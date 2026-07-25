"use client";

import MessageInput from "@/components/chat/MessageInput";
import MessageList from "@/components/chat/MessageList";
import { Message } from "@/types/message";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useSyncExternalStore, useState } from "react";
import {
	Alert,
	Box,
	Button,
	Chip,
	CircularProgress,
	IconButton,
	Stack,
	Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import {
	DEFAULT_GEMINI_MODEL,
	isGeminiModelId,
	type GeminiModelId,
} from "@/lib/gemini/models";
import { drawerWidth } from "@/components/layout/Sidebar";
import { useMediaQuery, useTheme } from "@mui/material";
import { useUIStore } from "@/store/ui";

const MODEL_STORAGE_PREFIX = "ai-chat:selected-model:";
const modelStoreListeners = new Map<string, Set<() => void>>();

interface BackendMessage {
	_id: string;
	role: "user" | "assistant";
	content: string;
	createdAt: string;
	image?: string;
	originalContent?: string;
	isEdited?: boolean;
	editedAt?: string;
}

function toFrontendMessage(msg: BackendMessage): Message {
	return {
		id: msg._id,
		role: msg.role,
		content: msg.content,
		timestamp: new Date(msg.createdAt),
		image: msg.image,
		originalContent: msg.originalContent,
		isEdited: msg.isEdited,
		editedAt: msg.editedAt ? new Date(msg.editedAt) : undefined,
	};
}

async function fetchMessages(chatId: string): Promise<Message[]> {
	const response = await fetch(`/api/chats/${chatId}/messages`);
	if (!response.ok) {
		throw new Error("Network response was not ok");
	}
	const data = await response.json();
	// Map the data from the backend to the frontend Message type
	return data.map(toFrontendMessage);
}

function getModelStorageKey(chatId: string) {
	return `${MODEL_STORAGE_PREFIX}${chatId}`;
}

function readStoredModel(chatId: string): GeminiModelId {
	if (typeof window === "undefined") {
		return DEFAULT_GEMINI_MODEL;
	}

	try {
		const storedModel = window.localStorage.getItem(
			getModelStorageKey(chatId),
		);
		return storedModel && isGeminiModelId(storedModel)
			? storedModel
			: DEFAULT_GEMINI_MODEL;
	} catch (error) {
		console.warn("Unable to read stored model:", error);
		return DEFAULT_GEMINI_MODEL;
	}
}

function writeStoredModel(chatId: string, model: GeminiModelId) {
	try {
		window.localStorage.setItem(getModelStorageKey(chatId), model);
	} catch (error) {
		console.warn("Unable to persist selected model:", error);
	}

	modelStoreListeners.get(chatId)?.forEach((listener) => listener());
}

function subscribeToModel(chatId: string, listener: () => void) {
	let listeners = modelStoreListeners.get(chatId);
	if (!listeners) {
		listeners = new Set();
		modelStoreListeners.set(chatId, listeners);
	}

	listeners.add(listener);

	return () => {
		listeners?.delete(listener);
		if (listeners && listeners.size === 0) {
			modelStoreListeners.delete(chatId);
		}
	};
}

export default function ChatPage() {
	const params = useParams();
	const chatId = params.chatId as string;
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));
	const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
	const toggleSidebar = useUIStore((state) => state.toggleSidebar);
	const [optimisticMessages, setOptimisticMessages] = useState<Message[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [serverError, setServerError] = useState<string | null>(null);
	const [serverErrorStatus, setServerErrorStatus] = useState<number | null>(
		null,
	);
	const queryClient = useQueryClient();
	const sidebarOffset =
		isMobile && isSidebarOpen ? 0 : isSidebarOpen ? drawerWidth : 0;

	const selectedModel = useSyncExternalStore(
		(callback) => (chatId ? subscribeToModel(chatId, callback) : () => {}),
		() => (chatId ? readStoredModel(chatId) : DEFAULT_GEMINI_MODEL),
		() => DEFAULT_GEMINI_MODEL,
	);

	const updateSelectedModel = (model: GeminiModelId) => {
		setServerError(null);
		setServerErrorStatus(null);

		if (chatId) {
			writeStoredModel(chatId, model);
		}
	};

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
		image?: string,
		model?: GeminiModelId,
		options?: {
			saveUserMessage?: boolean;
		},
	) => {
		setIsLoading(true);
		setServerError(null);
		setServerErrorStatus(null);

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
				body: JSON.stringify({
					message: text,
					chatId,
					image,
					model,
					saveUserMessage: options?.saveUserMessage ?? true,
				}),
			});
			console.log("response", response);

			if (!response.ok) {
				let errorMessage = "Sorry, something went wrong.";

				try {
					const data = (await response.json()) as { error?: string };
					errorMessage = data.error ?? errorMessage;
				} catch {
					errorMessage = await response.text();
				}

				const error = new Error(errorMessage);
				error.name = String(response.status);
				throw error;
			}

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
			const message =
				error instanceof Error
					? error.message
					: "Sorry, I'm having trouble connecting. Please try again later.";
			const status = error instanceof Error ? Number(error.name) : NaN;
			setServerErrorStatus(Number.isFinite(status) ? status : null);
			setServerError(message);
			setOptimisticMessages([]);
			queryClient.invalidateQueries({ queryKey: ["messages", chatId] });
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
		await streamAIResponse(text, image, selectedModel, {
			saveUserMessage: true,
		});
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
				lastUserMessage.image
					? lastUserMessage.image.split(",")[1]
					: undefined,
				selectedModel,
				{
					saveUserMessage: false,
				},
			);
		} catch (error) {
			console.error("Error regenerating response:", error);
		}
	};

	const handleEditAndResend = async (
		message: Message,
		updatedContent: string,
	) => {
		if (isLoading) return;

		setIsLoading(true);
		setServerError(null);
		setServerErrorStatus(null);

		try {
			const response = await fetch(`/api/chats/${chatId}/messages`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					messageId: message.id,
					content: updatedContent,
				}),
			});

			if (!response.ok) {
				let errorMessage = "Unable to update the message.";

				try {
					const data = (await response.json()) as { error?: string };
					errorMessage = data.error ?? errorMessage;
				} catch {
					errorMessage = await response.text();
				}

				throw new Error(errorMessage);
			}

			const updatedMessages = (await response.json()) as BackendMessage[];
			queryClient.setQueryData(
				["messages", chatId],
				updatedMessages.map(toFrontendMessage),
			);
			setOptimisticMessages([]);

			await streamAIResponse(updatedContent, undefined, selectedModel, {
				saveUserMessage: false,
			});
		} catch (error) {
			console.error("Error editing message:", error);
			const messageText =
				error instanceof Error
					? error.message
					: "Unable to edit and resend the message.";
			setServerError(messageText);
			throw error;
		} finally {
			setIsLoading(false);
		}
	};

	const handleModelNudge = () => {
		updateSelectedModel("gemini-3.1-flash-lite");
	};

	if (isLoadingMessages) {
		return (
			<Box
				sx={{
					minHeight: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					bgcolor: "chat.main",
				}}
			>
				<Stack spacing={2} alignItems="center">
					<CircularProgress />
					<Typography variant="body2" color="text.secondary">
						Loading your conversation...
					</Typography>
				</Stack>
			</Box>
		);
	}

	return (
		<Box
			sx={{
				minHeight: "100%",
				display: "flex",
				flexDirection: "column",
				position: "relative",
				overflow: "hidden",
				bgcolor: "chat.main",
				background:
					"radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 32%), radial-gradient(circle at top right, rgba(236,72,153,0.12), transparent 28%), linear-gradient(180deg, rgba(255,255,255,0.72), rgba(255,255,255,0.4))",
			}}
		>
			<Box
				sx={{
					px: { xs: 1.5, md: 2 },
					position: "fixed",
					top: 0,
					left: `${sidebarOffset}px`,
					right: 0,
					zIndex: 20,
				}}
			>
				<Box
					sx={{
						p: { xs: 1.25, md: 1.75 },
					}}
				>
					<Stack
						direction="row"
						spacing={1.5}
						alignItems="center"
						justifyContent="space-between"
					>
						<Stack
							direction="row"
							spacing={1.25}
							alignItems="center"
						>
							<IconButton
								onClick={toggleSidebar}
								aria-label={
									isSidebarOpen
										? "Close sidebar"
										: "Open sidebar"
								}
								sx={{
									borderRadius: 2.5,
									border: "1px solid",
									borderColor: "rgba(148,163,184,0.22)",
									bgcolor: "rgba(255,255,255,0.88)",
									boxShadow:
										"0 10px 24px rgba(15, 23, 42, 0.06)",
								}}
							>
								<MenuIcon />
							</IconButton>
							<Box>
								<Typography
									variant="subtitle1"
									sx={{ fontWeight: 800, lineHeight: 1.1 }}
								>
									AI Chat Assistant
								</Typography>
								<Typography
									variant="caption"
									color="text.secondary"
								>
									Responsive chat workspace
								</Typography>
							</Box>
						</Stack>
						<Stack direction="row" spacing={1} flexWrap="wrap">
							{serverErrorStatus === 429 && (
								<Chip
									label="Quota reached"
									color="warning"
									variant="filled"
								/>
							)}
						</Stack>
					</Stack>
				</Box>
			</Box>

			<Box
				sx={{
					flexGrow: 1,
					overflowY: "auto",
					px: { xs: 1.5, sm: 2, md: 4 },
					pt: { xs: "120px", sm: "132px", md: "144px" },
					pb: { xs: "320px", sm: "340px", md: "320px" },
				}}
			>
				<Box sx={{ maxWidth: "md", mx: "auto" }}>
					{messages.length === 0 ? (
						<Box
							sx={{
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								minHeight: "52vh",
							}}
						>
							<Box
								sx={{
									textAlign: "center",
									maxWidth: 560,
									p: 4,
									borderRadius: 4,
									border: "1px solid",
									borderColor: "divider",
									bgcolor: "rgba(255,255,255,0.72)",
									backdropFilter: "blur(18px)",
									boxShadow:
										"0 16px 40px rgba(15, 23, 42, 0.08)",
								}}
							>
								<Box
									sx={{
										mx: "auto",
										height: 72,
										width: 72,
										borderRadius: "24px",
										bgcolor: "primary.main",
										mb: 2,
										boxShadow:
											"0 18px 35px rgba(59,130,246,0.35)",
									}}
								/>
								<Typography
									variant="h4"
									sx={{ fontWeight: 800, mb: 1 }}
								>
									How can I help you today?
								</Typography>
								<Typography
									color="text.secondary"
									sx={{ mb: 2 }}
								>
									Ask a question, upload an image, or switch
									models from the composer below.
								</Typography>
								<Stack
									direction="row"
									spacing={1}
									justifyContent="center"
									flexWrap="wrap"
								>
									<Chip label="Weather" variant="outlined" />
									<Chip
										label="Summaries"
										variant="outlined"
									/>
									<Chip
										label="Image chat"
										variant="outlined"
									/>
									<Chip
										label="Model switcher"
										variant="outlined"
									/>
								</Stack>
							</Box>
						</Box>
					) : (
						<MessageList
							messages={messages}
							isLoading={isLoading}
							onRegenerate={handleRegenerate}
							onEditAndResend={handleEditAndResend}
						/>
					)}

					{serverError && (
						<Alert
							severity={
								serverErrorStatus === 429 ? "warning" : "error"
							}
							action={
								serverErrorStatus === 429 ? (
									<Button
										color="inherit"
										size="small"
										onClick={handleModelNudge}
									>
										Try Lite
									</Button>
								) : undefined
							}
							sx={{
								mb: 2,
								borderRadius: 3,
								alignItems: "center",
							}}
						>
							<Stack spacing={0.5}>
								<Typography
									variant="subtitle2"
									sx={{ fontWeight: 700 }}
								>
									{serverErrorStatus === 429
										? "Usage limit reached"
										: "Something went wrong"}
								</Typography>
								<Typography variant="body2">
									{serverError}
								</Typography>
							</Stack>
						</Alert>
					)}
				</Box>
			</Box>

			<Box
				sx={{
					// px: { xs: 2, md: 4 },
					// pb: { xs: 2, md: 3 },
					// pt: 1,
					position: "fixed",
					bottom: 0,
					left: `${sidebarOffset}px`,
					right: 0,
					zIndex: 20,
					// background:
					// 	"linear-gradient(180deg, rgba(245,245,245,0), rgba(245,245,245,0.94) 22%, rgba(245,245,245,1) 100%)",
					backdropFilter: "blur(18px)",
				}}
			>
				<Box
					sx={{
						maxWidth: "md",
						mx: "auto",
						// border: "1px solid",
						// borderColor: "divider",
					}}
				>
					<MessageInput
						onSendMessage={handleSendMessage}
						isLoading={isLoading}
						model={selectedModel}
						onModelChange={updateSelectedModel}
					/>
				</Box>
			</Box>
		</Box>
	);
}
