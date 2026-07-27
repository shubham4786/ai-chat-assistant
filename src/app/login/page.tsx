'use client';

import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
	Box,
	Button,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Stack,
	Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import BoltIcon from "@mui/icons-material/Bolt";

export default function LoginPage() {
	const { status } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (status === "authenticated") {
			router.push("/chat");
		}
	}, [status, router]);

	if (status === "loading") {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					display: "grid",
					placeItems: "center",
					background:
						"radial-gradient(circle at top, rgba(59,130,246,0.16), transparent 34%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (status === "unauthenticated") {
		return (
			<Box
				sx={{
					minHeight: "100vh",
					py: { xs: 3, sm: 4 },
					background:
						"radial-gradient(circle at top left, rgba(59,130,246,0.16), transparent 34%), radial-gradient(circle at top right, rgba(124,58,237,0.14), transparent 30%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
				}}
			>
				<Container
					maxWidth="sm"
					sx={{
						minHeight: "100vh",
						display: "grid",
						placeItems: "center",
					}}
				>
					<Card
						elevation={0}
						sx={{
							width: "100%",
							borderRadius: 5,
							border: "1px solid",
							borderColor: "rgba(148,163,184,0.18)",
							bgcolor: "rgba(255,255,255,0.84)",
							backdropFilter: "blur(18px)",
							boxShadow: "0 28px 80px rgba(15,23,42,0.12)",
						}}
					>
						<CardContent sx={{ p: { xs: 3, sm: 4 } }}>
							<Stack spacing={3}>
								<Box
									sx={{
										width: 56,
										height: 56,
										borderRadius: "18px",
										display: "grid",
										placeItems: "center",
										background:
											"linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #7c3aed 100%)",
										color: "common.white",
										boxShadow: "0 18px 35px rgba(37,99,235,0.22)",
									}}
								>
									<ChatBubbleOutlineIcon />
								</Box>

								<Box>
									<Typography
										variant="overline"
										sx={{ letterSpacing: "0.2em", color: "text.secondary" }}
									>
										Welcome back
									</Typography>
									<Typography
										variant="h4"
										sx={{
											fontWeight: 900,
											letterSpacing: "-0.05em",
											mt: 0.5,
										}}
									>
										Sign in to continue your chats.
									</Typography>
									<Typography
										color="text.secondary"
										sx={{ mt: 1.5, lineHeight: 1.65 }}
									>
										Keep your conversations in one clean workspace and jump back into them anytime.
									</Typography>
								</Box>

								<Stack spacing={1.5}>
									<Stack direction="row" spacing={1.25} alignItems="center">
										<LockOutlinedIcon fontSize="small" color="primary" />
										<Typography variant="body2" color="text.secondary">
											Secure account-based access
										</Typography>
									</Stack>
									<Stack direction="row" spacing={1.25} alignItems="center">
										<BoltIcon fontSize="small" color="primary" />
										<Typography variant="body2" color="text.secondary">
											Quick entry into the chat workspace
										</Typography>
									</Stack>
								</Stack>

								<Button
									fullWidth
									variant="contained"
									size="large"
									onClick={() => signIn("google")}
									sx={{
										py: 1.3,
										borderRadius: 999,
										boxShadow: "0 18px 34px rgba(37,99,235,0.22)",
									}}
								>
									Continue with Google
								</Button>

								<Typography
									variant="caption"
									color="text.secondary"
									sx={{ textAlign: "center", lineHeight: 1.6 }}
								>
									Responsive layout for desktop and mobile. Your sign-in takes you straight into chat.
								</Typography>
							</Stack>
						</CardContent>
					</Card>
				</Container>
			</Box>
		);
	}

	return null;
}
