import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";
import {
	buildConversationInput,
	type ConversationStep,
} from "@/lib/gemini/conversation";
import { formatGeminiError } from "@/lib/gemini/errors";
import {
	DEFAULT_GEMINI_MODEL,
	isGeminiModelId,
	type GeminiModelId,
} from "@/lib/gemini/models";
import {
	extractWeatherCalls,
	getCurrentWeather,
	type WeatherFunctionResult,
} from "@/lib/gemini/weather";
import {
	resolveToolDefinitionByName,
	type GeminiToolName,
	type GeminiToolDefinition,
} from "@/lib/gemini/tools";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const ROUTER_MODEL: GeminiModelId = "gemini-3.5-flash-lite";

type InteractionState = {
	id: string;
	steps?: unknown[];
	outputs?: unknown[];
	output_text?: string | null;
};

type ConversationHistoryStep = ConversationStep | WeatherFunctionResult;
type ToolRouterDecision = {
	tool: GeminiToolName;
	reason?: string;
};

function isRateLimitError(error: unknown) {
	if (typeof error !== "object" || error === null) {
		return false;
	}

	const maybeError = error as {
		statusCode?: number;
		status?: number;
		message?: string;
		error?: { code?: string; message?: string };
	};

	return (
		maybeError.statusCode === 429 ||
		maybeError.status === 429 ||
		maybeError.error?.code === "too_many_requests" ||
		(typeof maybeError.message === "string" &&
			maybeError.message.toLowerCase().includes("too many requests"))
	);
}

async function createInteraction(
	model: GeminiModelId,
	input: ConversationHistoryStep[] | string,
	tools: GeminiToolDefinition[],
) {
	return ai.interactions.create({
		model,
		input: input as never,
		tools,
		store: true,
	});
}

async function createInteractionWithFallback(
	model: GeminiModelId,
	input: ConversationHistoryStep[] | string,
	tools: GeminiToolDefinition[],
) {
	try {
		return (await createInteraction(
			model,
			input,
			tools,
		)) as InteractionState;
	} catch (toolError) {
		if (!isRateLimitError(toolError)) {
			throw toolError;
		}

		console.warn(
			"Gemini tool request rate-limited, retrying without tools.",
		);
		return (await createInteraction(model, input, [])) as InteractionState;
	}
}

function parseToolRouterDecision(output: string): ToolRouterDecision | null {
	const trimmed = output.trim();
	const jsonCandidate = trimmed.match(/\{[\s\S]*\}/)?.[0] ?? trimmed;

	try {
		const parsed = JSON.parse(jsonCandidate) as Partial<ToolRouterDecision>;
		if (
			parsed &&
			typeof parsed.tool === "string" &&
			[
				"google_search",
				"url_context",
				"code_execution",
				"google_maps",
				"file_search",
				"weather",
				"none",
			].includes(parsed.tool)
		) {
			return {
				tool: parsed.tool as GeminiToolName,
				reason:
					typeof parsed.reason === "string"
						? parsed.reason
						: undefined,
			};
		}
	} catch {
		// fall through
	}

	const normalized = trimmed.toLowerCase();
	if (
		[
			"google_search",
			"url_context",
			"code_execution",
			"google_maps",
			"file_search",
			"weather",
			"none",
		].includes(normalized)
	) {
		return {
			tool: normalized as GeminiToolName,
		};
	}

	return null;
}

async function selectBestToolViaRouter(
	message: string,
	image?: string,
): Promise<GeminiToolDefinition[]> {
	const routerPrompt = `You are a strict tool router for a chat assistant.
Choose exactly one best tool for the user's message.

Return JSON only in this format:
{"tool":"google_search"|"url_context"|"code_execution"|"google_maps"|"file_search"|"weather"|"none","reason":"short reason"}

Rules:
- Use "google_search" for current facts, today's date, current time, latest news, recent events, weather updates, or anything that needs up-to-date public information.
- Use "url_context" only if the user provided a URL and wants information from that URL.
- Use "code_execution" for calculations, data transforms, code, scripts, math, or structured analysis.
- Use "google_maps" for places, directions, nearby search, restaurants, hotels, or route planning.
- Use "file_search" only if the user is asking about internal documents, notes, handbooks, or uploaded files and file search is available.
- Use "weather" only for explicit weather questions that should use the custom weather function.
- Use "none" only for pure chit-chat or when no external tool will improve the answer.
- Never choose more than one tool.
- Prefer google_search whenever the prompt asks for current or time-sensitive information.

User message:
${message}

${image ? "An image is attached." : "No image is attached."}`;

	try {
		const routerInteraction = (await ai.interactions.create({
			model: ROUTER_MODEL,
			input: routerPrompt,
			store: true,
		})) as InteractionState;

		const decision = parseToolRouterDecision(
			routerInteraction.output_text ?? "",
		);

		if (decision) {
			console.info("Gemini tool router decision:", decision);
			return resolveToolDefinitionByName(decision.tool);
		}
	} catch (error) {
		console.warn(
			"Tool router failed, falling back to google_search:",
			error,
		);
	}

	return [{ type: "google_search" }];
}

function makeFunctionResult(
	name: string,
	callId: string,
	payload: unknown,
): WeatherFunctionResult {
	return {
		type: "function_result",
		name,
		call_id: callId,
		result: [
			{
				type: "text",
				text: JSON.stringify(payload),
			},
		],
	};
}

export async function POST(req: NextRequest) {
	try {
		if (!process.env.GOOGLE_API_KEY) {
			console.error("GOOGLE_API_KEY is not set");
			return new Response(
				"Internal Server Error: AI API key not configured",
				{ status: 500 },
			);
		}

		const session = await getServerSession(authOptions);

		if (!session?.user?.id) {
			return new Response("Unauthorized", { status: 401 });
		}

		const {
			message,
			chatId,
			image,
			model,
			saveUserMessage = true,
		} = await req.json();

		if (!chatId) {
			return new Response("chatId is required", { status: 400 });
		}

		const selectedModel: GeminiModelId = isGeminiModelId(model)
			? model
			: DEFAULT_GEMINI_MODEL;
		const tools = await selectBestToolViaRouter(message, image);

		await connectToDB();

		const chat = await Chat.findById(chatId);

		if (!chat || chat.user.toString() !== session.user.id) {
			return new Response("Chat not found or access denied", {
				status: 404,
			});
		}

		const previousMessages = await Message.find({ chat: chatId }).sort({
			createdAt: "asc",
		});

		if (saveUserMessage) {
			await Message.create({
				chat: chatId,
				role: "user",
				content: message,
				image: image ? `data:image/jpeg;base64,${image}` : undefined,
			});
		}

		let conversationHistory: ConversationHistoryStep[] =
			buildConversationInput(previousMessages, message, image, {
				includeCurrentMessage: saveUserMessage,
			});

		let interaction: InteractionState = await createInteractionWithFallback(
			selectedModel,
			conversationHistory,
			tools,
		);

		let loopGuard = 0;
		while (loopGuard < 3) {
			const weatherCalls = extractWeatherCalls(interaction);

			if (weatherCalls.length === 0) {
				break;
			}

			const results = await Promise.all(
				weatherCalls.map(async (call) => {
					if (call.name !== "get_current_temperature") {
						return null;
					}

					const location = call.arguments?.location;

					if (!location || typeof location !== "string") {
						return makeFunctionResult(call.name, call.id, {
							error: "The weather tool needs a location.",
						});
					}

					const result = await getCurrentWeather(location);
					return makeFunctionResult(call.name, call.id, result);
				}),
			);

			const validResults = results.filter(
				(result): result is WeatherFunctionResult => result !== null,
			);

			if (validResults.length === 0) {
				break;
			}

			const modelSteps = (interaction.steps ??
				interaction.outputs ??
				[]) as ConversationHistoryStep[];
			conversationHistory = [
				...conversationHistory,
				...modelSteps,
				...validResults,
			];

			interaction = await createInteractionWithFallback(
				selectedModel,
				conversationHistory,
				tools,
			);

			loopGuard += 1;
		}

		const fullResponse =
			interaction.output_text ?? "I could not generate a response.";

		await Message.create({
			chat: chatId,
			role: "assistant",
			content: fullResponse,
		});

		if (previousMessages.length === 0) {
			try {
				const titleInteraction = await ai.interactions.create({
					model: selectedModel,
					input: `Generate a short, concise title (max 5 words) for the following conversation:
User: ${message}
AI: ${fullResponse}`,
					store: true,
				});

				const title = (titleInteraction.output_text ?? message).replace(
					/"/g,
					"",
				);
				await Chat.findByIdAndUpdate(chatId, { title });
			} catch (titleError) {
				console.error("Error generating chat title:", titleError);
			}
		}

		const stream = new ReadableStream({
			start(controller) {
				controller.enqueue(new TextEncoder().encode(fullResponse));
				controller.close();
			},
		});

		return new Response(stream, {
			headers: {
				"Content-Type": "text/plain; charset=utf-8",
			},
		});
	} catch (error) {
		console.error("Error in chat API:", error);
		const geminiError = formatGeminiError(error);
		return new Response(JSON.stringify({ error: geminiError.message }), {
			status: geminiError.status,
			headers: {
				"Content-Type": "application/json; charset=utf-8",
			},
		});
	}
}
