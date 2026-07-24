"use client";

import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";
import { Message } from "@/types/message";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Box, Typography } from "@mui/material";

interface BackendMessage {
	_id: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
}

async function fetchMessages(chatId: string): Promise<Message[]> {
	const response = await fetch(`/api/chats/${chatId}/messages`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const data = await response.json();
	// Map the data from the backend to the frontend Message type
	return data.map((msg: BackendMessage) => ({
		id: msg._id,
		role: msg.role,
		content: msg.content,
		timestamp: new Date(msg.createdAt),
	}));
}

export default function ChatPage() {
	const params = useParams();
	const chatId = params.chatId as string;
	const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const queryClient = useQueryClient();

	const { data: initialMessages, isLoading: isLoadingMessages } = useQuery({
		queryKey: ["messages", chatId],
		queryFn: () => fetchMessages(chatId),
		enabled: !!chatId,
	});

	const messages = initialMessages
		? [...initialMessages, ...optimisticMessages]
		: optimisticMessages;

	const streamAIResponse = async (
		text: string,
		currentMessages: Message[],
		image?: string,
	) => {
		setIsLoading(true);

		const aiMessagePlaceholder: Message = {
			id: (Date.now() + 1).toString(), // temporary id
			role: "assistant",
			content: "",
			timestamp: new Date(),
		};

		setOptimisticMessages((prev) => [...prev, aiMessagePlaceholder]);

		try {
			const response = await fetch("/api/chat", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ message: text, chatId, image }),
			});
			console.log("response", response);

			if (!response.body) throw new Error("No response body");

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let done = false;
			let fullResponse = "";

			while (!done) {
				const { value, done: readerDone } = await reader.read();
				done = readerDone;
				const chunk = decoder.decode(value, { stream: true });
				fullResponse += chunk;

				setOptimisticMessages((prev) =>
					prev.map((msg) =>
						msg.id === aiMessagePlaceholder.id
							? { ...msg, content: fullResponse }
							: msg,
					),
				);
			}
			setOptimisticMessages([]);
			queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
			// Invalidate chats query to refresh the chat title in sidebar
			queryClient.invalidateQueries({ queryKey: ["chats"] });
		} catch (error) {
			console.error("Error fetching stream:", error);
			setOptimisticMessages((prev) =>
				prev.map((msg) =>
					msg.id === aiMessagePlaceholder.id
						? {
								...msg,
								content:
									"Sorry, I'm having trouble connecting. Please try again later.",
							}
						: msg,
				),
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendMessage = async (text: string, image?: string) => {
		if (isLoading) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			role: "user",
			content: text,
			timestamp: new Date(),
			image: image ? `data:image/jpeg;base64,${image}` : undefined,
		};

		setOptimisticMessages((prev) => [...prev, userMessage]);
		await streamAIResponse(text, [userMessage], image);
	};

	const handleRegenerate = async () => {
		if (isLoading || messages.length < 2) return;

		const lastAiMessageIndex = messages.findLastIndex(
			(m) => m.role === "assistant",
		);
		if (lastAiMessageIndex === -1) return;

		const lastAiMessage = messages[lastAiMessageIndex];
		const lastUserMessage = messages[lastAiMessageIndex - 1];
		if (!lastUserMessage || lastUserMessage.role !== "user") return;

		try {
			const response = await fetch(`/api/chats/${chatId}/messages`, {
				method: "DELETE",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ messageId: lastAiMessage.id }),
			});

			if (!response.ok) {
				throw new Error("Failed to delete message");
			}

			queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
			await streamAIResponse(
				lastUserMessage.content,
				[],
				lastUserMessage.image
					? lastUserMessage.image.split(",")[1]
					: undefined,
			);
		} catch (error) {
			console.error("Error regenerating response:", error);
		}
	};

	if (isLoadingMessages) {
		return <div>Loading messages...</div>;
	}

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				bgcolor: "chat.main",
			}}
		>
			<Box sx={{ flexGrow: 1, overflowY: "auto", p: 4 }}>
				{messages.length === 0 ? (
					<Box
						sx={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							height: "100%",
						}}
					>
						<Box sx={{ textAlign: "center" }}>
							<Box
								sx={{
									mx: "auto",
									height: 48,
									width: 48,
									borderRadius: "50%",
									bgcolor: "primary.main",
									mb: 2,
								}}
							></Box>
							<Typography variant="h5" sx={{ fontWeight: 600 }}>
								How can I help you today?
							</Typography>
						</Box>
					</Box>
				) : (
					<MessageList
						messages={messages}
						onRegenerate={handleRegenerate}
					/>
				)}
			</Box>

			<Box sx={{ p: 2 }}>
				<Box sx={{ maxWidth: "md", mx: "auto" }}>
					<MessageInput
						onSendMessage={handleSendMessage}
						isLoading={isLoading}
					/>
				</Box>
			</Box>
		</Box>
	);
}
