import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import Message from "@/models/Message";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

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

		let aiStream;
		let fullResponse = "";

		if (image) {
			aiStream = await ai.interactions.create({
				model: "gemini-3.5-flash",
				input: [
					{ type: "text", text: message },
					{ type: "image", data: image, mime_type: "image/jpeg" },
				],
				stream: true, // Enable streaming
			});
		} else {
			aiStream = await ai.interactions.create({
				model: "gemini-3.5-flash",
				input: message,
				stream: true, // Enable streaming
			});
		}

		const stream = new ReadableStream({
			async start(controller) {
				for await (const event of aiStream) {
					if (event.event_type === "step.delta") {
						const deltaEvent = event as {
							delta: { type: string; text: string };
						};
						if (deltaEvent.delta.type === "text") {
							const chunk = deltaEvent.delta.text;
							fullResponse += chunk;
							controller.enqueue(new TextEncoder().encode(chunk));
						}
					}
				} // Closing the for await loop

				await Message.create({
					chat: chatId,
					role: "assistant",
					content: fullResponse,
				});

				if (previousMessages.length === 0) {
					const titleInteraction = await ai.interactions.create({
						model: "gemini-3.5-flash",
						input: `Generate a short, concise title (max 5 words) for the following conversation:
                User: ${message}
                AI: ${fullResponse}`,
					});
					const title = (
						titleInteraction.output_text ?? message
					).replace(/"/g, "");

					await Chat.findByIdAndUpdate(chatId, { title });
				}

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
