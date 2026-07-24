"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import { useRef, useState } from "react";
import Image from "next/image";
import { Box, Stack } from "@mui/material";

const formSchema = z.object({
	message: z.string(), // Allow empty message if image is present
});

interface MessageInputProps {
	onSendMessage: (message: string, image?: string) => void;
	isLoading: boolean;
}

export default function MessageInput({
	onSendMessage,
	isLoading,
}: MessageInputProps) {
	const { control, handleSubmit, reset, getValues } = useForm<
		z.infer<typeof formSchema>
	>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			message: "",
		},
	});

	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [imageFile, setImageFile] = useState<File | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
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
		}
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
		if (!values.message && !imageFile) return;

		if (imageFile) {
			const reader = new FileReader();
			reader.onloadend = () => {
				const base64Image = (reader.result as string).split(",")[1];
				onSendMessage(values.message, base64Image);
				removeImage();
				reset();
			};
			reader.readAsDataURL(imageFile);
		} else {
			onSendMessage(values.message);
			reset();
		}
	}

	return (
		<Box
			component="form"
			onSubmit={handleSubmit(onSubmit)}
			sx={{
				p: 1,
				pb: 2,
				position: "relative",
				borderTop: 1,
				borderColor: "divider",
			}}
		>
			{imagePreview && (
				<Box
					sx={{
						position: "relative",
						mb: 1,
						width: 80,
						height: 80,
						borderRadius: 1,
						overflow: "hidden",
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
							top: 2,
							right: 2,
							bgcolor: "error.main",
							color: "error.contrastText",
							"&:hover": { bgcolor: "error.dark" },
						}}
						onClick={removeImage}
					>
						<CloseIcon fontSize="small" />
					</IconButton>
				</Box>
			)}
			<Controller
				name="message"
				control={control}
				render={({ field, fieldState }) => (
					<TextField
						{...field}
						multiline
						rows={1}
						fullWidth
						placeholder="Ask me anything..."
						disabled={isLoading}
						error={!!fieldState.error}
						helperText={fieldState.error?.message}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(onSubmit)();
							}
						}}
						sx={{ pr: "96px" }}
					/>
				)}
			/>
			<Stack
				direction="row"
				spacing={1}
				sx={{
					position: "absolute",
					top: "50%",
					right: 8,
					transform: "translateY(-50%)",
				}}
			>
				<input
					type="file"
					ref={fileInputRef}
					onChange={handleImageChange}
					className="hidden"
					accept="image/*"
				/>
				<IconButton
					type="button"
					disabled={isLoading}
					onClick={() => fileInputRef.current?.click()}
				>
					<AttachFileIcon />
				</IconButton>
				<IconButton
					type="submit"
					color="primary"
					disabled={isLoading || (!getValues().message && !imageFile)}
				>
					<SendIcon />
				</IconButton>
			</Stack>
		</Box>
	);
}
