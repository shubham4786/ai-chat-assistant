"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import * as z from "zod";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useRef, useState } from "react";
import Image from "next/image";
import {
	Box,
	FormControl,
	MenuItem,
	Paper,
	Select,
	Stack,
	Typography,
} from "@mui/material";
import { GEMINI_MODELS, type GeminiModelId } from "@/lib/gemini/models";

const formSchema = z.object({
	message: z.string(),
});

interface MessageInputProps {
	onSendMessage: (
		message: string,
		image?: string,
		model?: GeminiModelId,
	) => void;
	isLoading: boolean;
	model: GeminiModelId;
	onModelChange: (model: GeminiModelId) => void;
}

export default function MessageInput({
	onSendMessage,
	isLoading,
	model,
	onModelChange,
}: MessageInputProps) {
	const { control, handleSubmit, reset } = useForm<
		z.infer<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			message: "",
		},
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [messageValue, setMessageValue] = useState("");
	const fileInputRef = useRef<HTMLInputElement>(null);
	const canSend = Boolean(messageValue.trim() || imageFile);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		if (file.size > 4 * 1024 * 1024) {
			alert("Image size should be less than 4MB");
			return;
		}

		if (!file.type.startsWith("image/")) {
			alert("Please select an image file");
			return;
		}

		setImageFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	function onSubmit(values: z.infer<typeof formSchema>) {
		if (isLoading) return;
		const prompt = values.message.trim();
		if (!prompt && !imageFile) return;

		if (imageFile) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64Image = (reader.result as string).split(",")[1];
				onSendMessage(prompt, base64Image, model);
				removeImage();
				reset();
				setMessageValue("");
			};
			reader.readAsDataURL(imageFile);
			return;
		}

		onSendMessage(prompt, undefined, model);
		reset();
		setMessageValue("");
	}

	return (
		<Box component="form" onSubmit={handleSubmit(onSubmit)}>
			<Paper
				elevation={0}
				sx={{
					overflow: "hidden",
					borderRadius: 5,
					border: "1px solid",
					borderColor: "rgba(148, 163, 184, 0.22)",
					bgcolor: "rgba(255,255,255,0.86)",
					backdropFilter: "blur(18px)",
					boxShadow: "0 22px 60px rgba(15, 23, 42, 0.12)",
				}}
			>
				<Box
					sx={{
						p: { xs: 1.25, md: 1.5 },
						background:
							"linear-gradient(180deg, rgba(255,255,255,0.9), rgba(248,250,252,0.78))",
					}}
				>
					{imagePreview && (
						<Box
							sx={{
								position: "relative",
								width: 116,
								height: 116,
								mb: 1.25,
								borderRadius: 3,
								overflow: "hidden",
								border: "1px solid",
								borderColor: "rgba(148, 163, 184, 0.24)",
								boxShadow: "0 12px 28px rgba(15, 23, 42, 0.1)",
							}}
						>
							<Image
								src={imagePreview}
								alt="Image preview"
								fill
								style={{ objectFit: "cover" }}
							/>
							<IconButton
								size="small"
								sx={{
									position: "absolute",
									top: 6,
									right: 6,
									bgcolor: "rgba(15, 23, 42, 0.7)",
									color: "common.white",
									"&:hover": {
										bgcolor: "rgba(15, 23, 42, 0.9)",
									},
								}}
								onClick={removeImage}
							>
								<CloseIcon fontSize="small" />
							</IconButton>
						</Box>
					)}

					<Stack
						direction={{ xs: "column", md: "row" }}
						spacing={1}
						alignItems="stretch"
						sx={{
							minHeight: 72,
							p: 0.75,
							borderRadius: 4,
							border: "1px solid",
							borderColor: "rgba(148, 163, 184, 0.2)",
							bgcolor: "rgba(255,255,255,0.72)",
							boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
						}}
					>
						<Controller
							name="message"
							control={control}
							render={({ field, fieldState }) => (
								<TextField
									{...field}
									variant="standard"
									multiline
									minRows={1}
									maxRows={8}
									fullWidth
									placeholder="Ask me anything..."
									disabled={isLoading}
									error={!!fieldState.error}
									helperText={fieldState.error?.message}
									onChange={(event) => {
										field.onChange(event);
										setMessageValue(event.target.value);
									}}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSubmit(onSubmit)();
										}
									}}
									InputProps={{
										disableUnderline: true,
										sx: {
											height: "100%",
											alignItems: "flex-start",
											px: 1.5,
											py: 1.2,
											fontSize: 15,
										},
									}}
									sx={{
										flex: 1,
										width: "100%",
										"& .MuiInput-root": {
											height: "100%",
										},
										"& .MuiInputBase-input": {
											lineHeight: 1.65,
											"::placeholder": {
												opacity: 0.72,
											},
										},
										"& .MuiFormHelperText-root": {
											position: "absolute",
											bottom: -22,
											left: 0,
											margin: 0,
										},
									}}
								/>
							)}
						/>

						<input
							type="file"
							ref={fileInputRef}
							onChange={handleImageChange}
							className="hidden"
							accept="image/*"
						/>

						<Box
							sx={{
								display: "flex",
								gap: 1,
								alignItems: "stretch",
								width: "100%",
								flexDirection: "row",
							}}
						>
							<IconButton
								type="button"
								disabled={isLoading}
								onClick={() => fileInputRef.current?.click()}
								sx={{
									flexShrink: 0,
									width: 48,
									height: 48,
									alignSelf: "center",
									borderRadius: 3,
									border: "1px solid",
									borderColor: "rgba(148, 163, 184, 0.22)",
									bgcolor: "rgba(255,255,255,0.9)",
									color: "text.secondary",
									boxShadow:
										"0 10px 24px rgba(15, 23, 42, 0.06)",
									"&:hover": {
										bgcolor: "rgba(248, 250, 252, 1)",
										color: "text.primary",
									},
								}}
							>
								<AttachFileIcon />
							</IconButton>

							<FormControl
								variant="standard"
								sx={{
									flex: 1,
									minWidth: 0,
									alignSelf: "center",
								}}
							>
								<Select
									value={model}
									disabled={isLoading}
									onChange={(event) =>
										onModelChange(
											event.target.value as GeminiModelId,
										)
									}
									disableUnderline
									renderValue={(selected) => {
										const current =
											GEMINI_MODELS.find(
												(entry) => entry.id === selected,
											) ?? GEMINI_MODELS[0];
										return (
											<Box sx={{ pr: 2 }}>
												<Typography
													variant="body2"
													sx={{
														fontWeight: 700,
														lineHeight: 1.2,
													}}
												>
													{current.label}
												</Typography>
											</Box>
										);
									}}
									sx={{
										height: "100%",
										px: 1.5,
										py: 1.1,
										borderRadius: 3,
										border: "1px solid",
										borderColor:
											"rgba(148, 163, 184, 0.22)",
										bgcolor: "rgba(255,255,255,0.9)",
										boxShadow:
											"0 10px 24px rgba(15, 23, 42, 0.06)",
										"& .MuiSelect-select": {
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											minHeight: "100%",
										},
									}}
								>
									{GEMINI_MODELS.map((entry) => (
										<MenuItem key={entry.id} value={entry.id}>
											<Box sx={{ py: 0.25 }}>
												<Typography
													variant="body2"
													sx={{ fontWeight: 700 }}
												>
													{entry.label}
												</Typography>
												<Typography
													variant="caption"
													color="text.secondary"
												>
													{entry.description}
												</Typography>
											</Box>
										</MenuItem>
									))}
								</Select>
							</FormControl>
							<IconButton
								type="submit"
								disabled={isLoading || !canSend}
								sx={{
									flexShrink: 0,
									width: 52,
									height: 52,
									alignSelf: "center",
									borderRadius: 3,
									bgcolor: canSend
										? "primary.main"
										: "action.disabledBackground",
									color: canSend
										? "primary.contrastText"
										: "action.disabled",
									boxShadow: canSend
										? "0 14px 30px rgba(59,130,246,0.28)"
										: "none",
									backgroundImage: canSend
										? "linear-gradient(135deg, rgba(59,130,246,1), rgba(37,99,235,1))"
										: "none",
									"&:hover": {
										bgcolor: canSend
											? "primary.dark"
											: "action.disabledBackground",
									},
									"&.Mui-disabled": {
										color: "rgba(100,116,139,0.8)",
									},
								}}
							>
								<SendIcon />
							</IconButton>
						</Box>
					</Stack>
				</Box>
			</Paper>
		</Box>
	);
}
