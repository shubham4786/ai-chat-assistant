import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });
const MODEL_NAME = "gemini-3.6-flash";

const weatherFunctionDeclaration = {
	type: "function",
	name: "get_current_temperature",
	description: "Gets the current temperature for a given location.",
	parameters: {
		type: "object",
		properties: {
			location: {
				type: "string",
				description: "The city name, e.g. San Francisco",
			},
		},
		required: ["location"],
	},
} as const;

type FunctionCallStep = {
	type: "function_call";
	id: string;
	name: string;
	arguments?: {
		location?: string;
		[key: string]: unknown;
	};
};

type FunctionResultStep = {
	type: "function_result";
	name: string;
	call_id: string;
	result: Array<{ type: "text"; text: string }>;
};

function getWeatherDescription(weatherCode: number): string {
	const descriptions: Record<number, string> = {
		0: "clear sky",
		1: "mainly clear",
		2: "partly cloudy",
		3: "overcast",
		45: "fog",
		48: "depositing rime fog",
		51: "light drizzle",
		53: "moderate drizzle",
		55: "dense drizzle",
		61: "slight rain",
		63: "moderate rain",
		65: "heavy rain",
		66: "light freezing rain",
		67: "heavy freezing rain",
		71: "slight snow fall",
		73: "moderate snow fall",
		75: "heavy snow fall",
		77: "snow grains",
		80: "slight rain showers",
		81: "moderate rain showers",
		82: "violent rain showers",
		85: "slight snow showers",
		86: "heavy snow showers",
		95: "thunderstorm",
		96: "thunderstorm with slight hail",
		99: "thunderstorm with heavy hail",
	};

	return descriptions[weatherCode] ?? "unknown conditions";
}

async function getCurrentWeather(location: string) {
	const geocodeResponse = await fetch(
		`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
			location,
		)}&count=1&language=en&format=json`,
	);

	if (!geocodeResponse.ok) {
		throw new Error("Unable to look up that location right now.");
	}

	const geocodeData = (await geocodeResponse.json()) as {
		results?: Array<{
			name: string;
			latitude: number;
			longitude: number;
			admin1?: string;
			country?: string;
		}>;
	};

	const match = geocodeData.results?.[0];

	if (!match) {
		return {
			location,
			error: `No matching location found for "${location}".`,
		};
	}

	const weatherResponse = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
	);

	if (!weatherResponse.ok) {
		throw new Error("Unable to fetch the current weather right now.");
	}

	const weatherData = (await weatherResponse.json()) as {
		current?: {
			temperature_2m: number;
			apparent_temperature: number;
			weather_code: number;
			wind_speed_10m: number;
		};
		current_units?: {
			temperature_2m?: string;
			apparent_temperature?: string;
			wind_speed_10m?: string;
		};
	};

	if (!weatherData.current) {
		return {
			location,
			error: `Weather data was not available for "${location}".`,
		};
	}

	const displayLocation = [match.name, match.admin1, match.country]
		.filter(Boolean)
		.join(", ");

	return {
		location: displayLocation,
		temperature: weatherData.current.temperature_2m,
		feelsLike: weatherData.current.apparent_temperature,
		windSpeed: weatherData.current.wind_speed_10m,
		weatherCode: weatherData.current.weather_code,
		condition: getWeatherDescription(weatherData.current.weather_code),
		units: weatherData.current_units ?? {
			temperature_2m: "°C",
			apparent_temperature: "°C",
			wind_speed_10m: "km/h",
		},
	};
}

function getFunctionCalls(interaction: unknown): FunctionCallStep[] {
	const maybeSteps = interaction as {
		steps?: unknown[];
		outputs?: unknown[];
	};
	const steps = maybeSteps.steps ?? maybeSteps.outputs ?? [];

	return steps.filter(
		(step): step is FunctionCallStep =>
			typeof step === "object" &&
			step !== null &&
			"type" in step &&
			(step as { type?: string }).type === "function_call",
	);
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

		if (!session || !session.user || !session.user.id) {
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

		let interaction: {
			id: string;
			steps?: unknown[];
			outputs?: unknown[];
			output_text?: string | null;
		} = await ai.interactions.create({
			model: MODEL_NAME,
			input: image
				? [
						{ type: "text", text: message },
						{ type: "image", data: image, mime_type: "image/jpeg" },
				]
				: message,
			tools: [weatherFunctionDeclaration],
		});

		let loopGuard = 0;
		while (loopGuard < 3) {
			const functionCalls = getFunctionCalls(interaction);

			if (functionCalls.length === 0) {
				break;
			}

			const functionResults = await Promise.all(
				functionCalls.map(async (call): Promise<FunctionResultStep | null> => {
					if (call.name !== "get_current_temperature") {
						return null;
					}

					const location = call.arguments?.location;

					if (!location || typeof location !== "string") {
						return {
							type: "function_result",
							name: call.name,
							call_id: call.id,
							result: [
								{
									type: "text",
									text: JSON.stringify({
										error: "The weather tool needs a location.",
									}),
								},
							],
						};
					}

					const result = await getCurrentWeather(location);

					return {
						type: "function_result",
						name: call.name,
						call_id: call.id,
						result: [
							{
								type: "text",
								text: JSON.stringify(result),
							},
						],
					};
				}),
			);

			const validResults = functionResults.filter(
				(result): result is FunctionResultStep => result !== null,
			);

			if (validResults.length === 0) {
				break;
			}

			interaction = await ai.interactions.create({
				model: MODEL_NAME,
				previous_interaction_id: interaction.id,
				input: validResults,
			});

			loopGuard += 1;
		}

		const fullResponse = interaction.output_text ?? "I could not generate a response.";

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
