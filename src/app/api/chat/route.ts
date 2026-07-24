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
import {
	extractWeatherCalls,
	getCurrentWeather,
	weatherFunctionDeclaration,
	type WeatherFunctionResult,
} from "@/lib/gemini/weather";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const MODEL_NAME = "gemini-3.5-flash";

type InteractionState = {
	id: string;
	steps?: unknown[];
	outputs?: unknown[];
	output_text?: string | null;
};

type ConversationHistoryStep = ConversationStep | WeatherFunctionResult;

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

		const { message, chatId, image } = await req.json();

		if (!chatId) {
			return new Response("chatId is required", { status: 400 });
		}

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

		await Message.create({
			chat: chatId,
			role: "user",
			content: message,
			image: image ? `data:image/jpeg;base64,${image}` : undefined,
		});

		let conversationHistory: ConversationHistoryStep[] =
			buildConversationInput(previousMessages, message, image);

		let interaction: InteractionState = await ai.interactions.create({
			model: MODEL_NAME,
			input: conversationHistory as never,
			tools: [weatherFunctionDeclaration],
			// store: false,
		});

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

			interaction = await ai.interactions.create({
				model: MODEL_NAME,
				input: conversationHistory as never,
				tools: [weatherFunctionDeclaration],
				// store: false,
			});

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
			const titleInteraction = await ai.interactions.create({
				model: MODEL_NAME,
				input: `Generate a short, concise title (max 5 words) for the following conversation:
User: ${message}
AI: ${fullResponse}`,
				// store: false,
			});

			const title = (titleInteraction.output_text ?? message).replace(
				/"/g,
				"",
			);
			await Chat.findByIdAndUpdate(chatId, { title });
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
		return new Response("Internal Server Error", { status: 500 });
	}
}
