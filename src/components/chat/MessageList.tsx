"use client";

import { useState } from "react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import {
	Box,
	Chip,
	IconButton,
	Paper,
	Slider,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { Message } from "@/types/message";

interface MessageListProps {
	messages: Message[];
	isLoading: boolean;
	onRegenerate: () => void;
	onEditAndResend: (
		message: Message,
		updatedContent: string,
	) => Promise<void>;
}

// function getSliderMarks() {
// 	return [
// 		{ value: 0, label: "Old" },
// 		{ value: 1, label: "New" },
// 	];
// }

export default function MessageList({
	messages,
	isLoading,
	onRegenerate,
	onEditAndResend,
}: MessageListProps) {
	const [editingMessageId, setEditingMessageId] = useState<string | null>(
		null,
	);
	const [draftContent, setDraftContent] = useState("");
	const [savingMessageId, setSavingMessageId] = useState<string | null>(null);
	const [versionByMessageId, setVersionByMessageId] = useState<
		Record<string, number>
	>({});

	const lastAssistantIndex = messages.reduce(
		(lastIndex, current, currentIndex) =>
			current.role === "assistant" ? currentIndex : lastIndex,
		-1,
	);

	const handleCopy = async (content: string) => {
		try {
			await navigator.clipboard.writeText(content);
		} catch (error) {
			console.error("Unable to copy message:", error);
		}
	};

	const beginEdit = (message: Message) => {
		setEditingMessageId(message.id);
		setDraftContent(message.content);
	};

	const cancelEdit = () => {
		if (savingMessageId) return;
		setEditingMessageId(null);
		setDraftContent("");
	};

	const saveEdit = async (message: Message) => {
		const nextContent = draftContent.trim();
		if (!nextContent || nextContent === message.content.trim()) {
			cancelEdit();
			return;
		}

		setSavingMessageId(message.id);
		try {
			await onEditAndResend(message, nextContent);
			setEditingMessageId(null);
			setDraftContent("");
			setVersionByMessageId((current) => ({
				...current,
				[message.id]: 1,
			}));
		} finally {
			setSavingMessageId(null);
		}
	};

	return (
		<Stack spacing={3} sx={{ px: { xs: 0, md: 1 }, py: 1 }}>
			{messages.map((message, index) => {
				const isUser = message.role === "user";
				const isAssistant = message.role === "assistant";
				const isLastAssistant =
					isAssistant && index === lastAssistantIndex;
				const isEditing = editingMessageId === message.id;
				const canEdit = isUser && !isLoading && !savingMessageId;
				const hasHistory = Boolean(
					isUser && message.isEdited && message.originalContent,
				);
				const versionValue = versionByMessageId[message.id] ?? 1;
				const visibleContent =
					hasHistory && versionValue === 0 && message.originalContent
						? message.originalContent
						: message.content;

				return (
					<Box
						className="message-row"
						key={message.id}
						sx={{
							display: "flex",
							justifyContent: isUser ? "flex-end" : "flex-start",
						}}
					>
						<Box
							sx={{
								maxWidth: { xs: "100%", md: "90%" },
								minWidth: 0,
								display: "flex",
								flexDirection: "column",
								alignItems: isUser ? "flex-end" : "flex-start",
							}}
						>
							<Paper
								sx={{
									width: "100%",
									px: 2,
									py: 1,
									borderRadius: 4,
									// border: "1px solid",
									// borderColor: isUser
									// 	? "rgba(59,130,246,0.18)"
									// 	: "rgba(148,163,184,0.24)",
									bgcolor: isUser
										? "rgba(59,130,246,0.20)"
										: "transparent",
									color: "text.primary",
									boxShadow: isUser
										? "0 12px 26px rgba(59,130,246,0.08)"
										: "0 12px 30px rgba(15, 23, 42, 0.06)",
									backdropFilter: "blur(16px)",
								}}
							>
								{message.image && (
									<Box
										sx={{
											mb: 1,
											p: 0.25,
											borderRadius: 9999,
											overflow: "hidden",
											display: "inline-flex",
											maxWidth: 280,
											bgcolor: "rgba(255,255,255,0.45)",
										}}
									>
										<Image
											src={message.image}
											alt="User uploaded image"
											width={640}
											height={420}
											style={{
												width: "100%",
												height: "auto",
												display: "block",
												borderRadius: 9999,
											}}
										/>
									</Box>
								)}

								{isEditing ? (
									<TextField
										value={draftContent}
										onChange={(event) =>
											setDraftContent(event.target.value)
										}
										multiline
										minRows={4}
										fullWidth
										autoFocus
										disabled={
											savingMessageId === message.id
										}
										variant="standard"
										InputProps={{
											disableUnderline: true,
											sx: {
												px: 0,
												py: 0,
												fontSize: 15,
												lineHeight: 1.75,
												backgroundColor: "transparent",
											},
										}}
									/>
								) : (
									<Typography
										component="div"
										sx={{
											whiteSpace: "pre-wrap",
											wordBreak: "break-word",
											"& > p": {
												margin: 0,
												lineHeight: 1.75,
											},
											"& > p + p": {
												mt: 1,
											},
											"& pre": {
												borderRadius: 3,
												overflow: "auto",
											},
											"& code": {
												fontFamily:
													'"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
											},
											"& a": {
												color: isUser
													? "primary.dark"
													: "primary.main",
												textDecoration: "underline",
											},
										}}
									>
										<ReactMarkdown
											remarkPlugins={[remarkGfm]}
											rehypePlugins={[rehypeHighlight]}
										>
											{visibleContent}
										</ReactMarkdown>
									</Typography>
								)}
							</Paper>

							{/* {hasHistory && !isEditing && (
								<Box
									sx={{
										mt: 1,
										width: "100%",
										p: 1.25,
										borderRadius: 3,
										border: "1px solid",
										borderColor: "rgba(148,163,184,0.18)",
										bgcolor: "rgba(255,255,255,0.72)",
										backdropFilter: "blur(12px)",
									}}
								>
									<Stack
										direction="row"
										alignItems="center"
										justifyContent="space-between"
										sx={{ mb: 0.75 }}
									>
										<Typography
											variant="caption"
											sx={{
												fontWeight: 700,
												letterSpacing: "0.04em",
											}}
											color="text.secondary"
										>
											Original / Edited
										</Typography>
										<Chip
											label={
												versionValue === 0
													? "Old"
													: "New"
											}
											size="small"
											variant="outlined"
										/>
									</Stack>
									<Slider
										value={versionValue}
										min={0}
										max={1}
										step={1}
										// marks={getSliderMarks()}
										onChange={(_, value) =>
											setVersionByMessageId(
												(current) => ({
													...current,
													[message.id]: Array.isArray(
														value,
													)
														? value[0]
														: value,
												}),
											)
										}
									/>
								</Box>
							)} */}

							<Box
								className="message-actions"
								sx={{
									mt: 0.5,
									display: "flex",
									alignItems: "center",
									gap: 0.5,
									flexWrap: "wrap",
									opacity: isUser ? 0 : 1,
									pointerEvents: isUser ? "none" : "auto",
									transition: "opacity 0.15s ease",
									...(isUser && {
										".message-row:hover &": {
											opacity: 1,
											pointerEvents: "auto",
										},
									}),
								}}
							>
								{!isEditing && (
									<IconButton
										size="small"
										onClick={() =>
											handleCopy(message.content)
										}
										disabled={isLoading}
										aria-label="Copy message"
										disableRipple
										sx={{
											color: "text.secondary",
											bgcolor: "transparent",
											border: "none",
											boxShadow: "none",
											p: 0.25,
											"&:hover": {
												bgcolor: "transparent",
											},
										}}
									>
										<ContentCopyIcon fontSize="small" />
									</IconButton>
								)}

								{isUser && !isEditing && (
									<IconButton
										size="small"
										onClick={() => beginEdit(message)}
										disabled={!canEdit}
										aria-label="Edit message"
										disableRipple
										sx={{
											color: "text.secondary",
											bgcolor: "transparent",
											border: "none",
											boxShadow: "none",
											p: 0.25,
											"&:hover": {
												bgcolor: "transparent",
											},
										}}
									>
										<EditOutlinedIcon fontSize="small" />
									</IconButton>
								)}

								{isAssistant && isLastAssistant && (
									<IconButton
										size="small"
										onClick={onRegenerate}
										disabled={isLoading}
										aria-label="Regenerate response"
										disableRipple
										sx={{
											color: "text.secondary",
											bgcolor: "transparent",
											border: "none",
											boxShadow: "none",
											p: 0.25,
											"&:hover": {
												bgcolor: "transparent",
											},
										}}
									>
										<RefreshIcon fontSize="small" />
									</IconButton>
								)}

								{isEditing && (
									<>
										<IconButton
											size="small"
											onClick={() => saveEdit(message)}
											disabled={
												savingMessageId ===
													message.id ||
												!draftContent.trim()
											}
											aria-label="Save edited message"
											disableRipple
											sx={{
												color: "success.main",
												bgcolor: "transparent",
												border: "none",
												boxShadow: "none",
												p: 0.25,
												"&:hover": {
													bgcolor: "transparent",
												},
											}}
										>
											<CheckIcon fontSize="small" />
										</IconButton>
										<IconButton
											size="small"
											onClick={cancelEdit}
											disabled={
												savingMessageId === message.id
											}
											aria-label="Cancel edit"
											disableRipple
											sx={{
												color: "text.secondary",
												bgcolor: "transparent",
												border: "none",
												boxShadow: "none",
												p: 0.25,
												"&:hover": {
													bgcolor: "transparent",
												},
											}}
										>
											<CloseIcon fontSize="small" />
										</IconButton>
									</>
								)}
							</Box>
						</Box>
					</Box>
				);
			})}
		</Stack>
	);
}
