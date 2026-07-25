import Link from "next/link";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Stack,
	Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import ImageSearchIcon from "@mui/icons-material/ImageSearch";
import SecurityIcon from "@mui/icons-material/Security";
import TuneIcon from "@mui/icons-material/Tune";

const features = [
	{
		title: "Fast everyday chat",
		description:
			"Open a conversation instantly and keep the flow moving with a clean, distraction-free composer.",
		icon: FlashOnIcon,
	},
	{
		title: "Image-aware prompts",
		description:
			"Upload an image and ask follow-up questions without leaving the chat, right from the same workspace.",
		icon: ImageSearchIcon,
	},
	{
		title: "Safer model control",
		description:
			"Choose the model you want and keep it stable per chat unless you decide to change it.",
		icon: TuneIcon,
	},
	{
		title: "Privacy-minded by default",
		description:
			"Your conversations stay scoped to your account, with chat history and actions kept easy to manage.",
		icon: SecurityIcon,
	},
];

const steps = [
	"Sign in and create a new chat in one click.",
	"Pick the model that fits the task and start prompting.",
	"Edit, resend, and refine replies without losing context.",
];

export default function LandingPage() {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				overflow: "hidden",
				background:
					"radial-gradient(circle at top left, rgba(59,130,246,0.18), transparent 28%), radial-gradient(circle at top right, rgba(236,72,153,0.14), transparent 24%), linear-gradient(180deg, rgba(248,250,252,1), rgba(241,245,249,1))",
			}}
		>
			<Container maxWidth="lg" sx={{ position: "relative", py: 3 }}>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 2,
						mb: { xs: 6, md: 10 },
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Box
							sx={{
								width: 42,
								height: 42,
								borderRadius: "14px",
								background:
									"linear-gradient(135deg, #2563eb, #7c3aed)",
								boxShadow: "0 18px 35px rgba(37,99,235,0.28)",
							}}
						/>
						<Box>
							<Typography
								variant="subtitle1"
								sx={{ fontWeight: 800, lineHeight: 1.1 }}
							>
								AI Chat Assistant
							</Typography>
							<Typography variant="caption" color="text.secondary">
								Focused conversations for work and ideas
							</Typography>
						</Box>
					</Stack>

					<Link href="/login" style={{ textDecoration: "none" }}>
						<Button
							variant="contained"
							size="medium"
							sx={{
								px: 2.25,
								py: 1.1,
								borderRadius: 999,
								boxShadow:
									"0 16px 32px rgba(37,99,235,0.22)",
							}}
						>
							Get Started
						</Button>
					</Link>
				</Box>

				<Stack
					direction={{ xs: "column", lg: "row" }}
					spacing={{ xs: 6, lg: 4 }}
					alignItems="stretch"
				>
					<Box sx={{ flex: 1, pt: { xs: 0, lg: 4 } }}>
						<Box
							sx={{
								display: "inline-flex",
								alignItems: "center",
								gap: 1,
								px: 1.5,
								py: 0.9,
								mb: 2.5,
								borderRadius: 999,
								border: "1px solid",
								borderColor: "rgba(148,163,184,0.25)",
								bgcolor: "rgba(255,255,255,0.7)",
								backdropFilter: "blur(12px)",
							}}
						>
							<Box
								sx={{
									width: 10,
									height: 10,
									borderRadius: "999px",
									bgcolor: "primary.main",
									boxShadow: "0 0 0 4px rgba(37,99,235,0.14)",
								}}
							/>
							<Typography
								variant="caption"
								sx={{ fontWeight: 700, letterSpacing: "0.08em" }}
							>
								SMART CHAT WORKSPACE
							</Typography>
						</Box>

						<Typography
							variant="h1"
							sx={{
								fontWeight: 900,
								letterSpacing: "-0.05em",
								lineHeight: 0.96,
								fontSize: {
									xs: "3rem",
									sm: "3.75rem",
									md: "4.8rem",
								},
								maxWidth: 760,
							}}
						>
							A polished AI chat experience that feels fast,
							clear, and professional.
						</Typography>

						<Typography
							variant="h6"
							color="text.secondary"
							sx={{
								mt: 3,
								maxWidth: 640,
								lineHeight: 1.65,
								fontWeight: 500,
							}}
						>
							Build conversations, edit prompts, switch models, and
							manage every reply from one refined interface.
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.5}
							sx={{ mt: 4 }}
						>
							<Link href="/login" style={{ textDecoration: "none" }}>
								<Button
									variant="contained"
									size="large"
									startIcon={<ChatBubbleOutlineIcon />}
									sx={{
										px: 3,
										py: 1.3,
										borderRadius: 999,
										boxShadow:
											"0 18px 34px rgba(37,99,235,0.26)",
									}}
								>
									Start Chatting
								</Button>
							</Link>
							<Button
								component="a"
								href="#features"
								variant="outlined"
								size="large"
								sx={{
									px: 3,
									py: 1.3,
									borderRadius: 999,
									borderColor: "rgba(148,163,184,0.35)",
									bgcolor: "rgba(255,255,255,0.72)",
									backdropFilter: "blur(12px)",
								}}
							>
								Explore features
							</Button>
						</Stack>

						<Stack
							direction="row"
							spacing={1}
							useFlexGap
							flexWrap="wrap"
							sx={{ mt: 4 }}
						>
							{[
								"Responsive UI",
								"Model control",
								"Image chat",
								"Edit and resend",
							].map((item) => (
								<Chip
									key={item}
									label={item}
									variant="outlined"
									sx={{
										bgcolor: "rgba(255,255,255,0.72)",
										backdropFilter: "blur(12px)",
										borderColor: "rgba(148,163,184,0.2)",
									}}
								/>
							))}
						</Stack>
					</Box>

					<Box sx={{ flex: 0.95, position: "relative" }}>
						<Box
							sx={{
								position: "absolute",
								inset: { xs: 12, md: 24 },
								borderRadius: 8,
								background:
									"linear-gradient(135deg, rgba(37,99,235,0.14), rgba(236,72,153,0.12))",
								filter: "blur(20px)",
							}}
						/>
						<Card
							elevation={0}
							sx={{
								position: "relative",
								borderRadius: 6,
								border: "1px solid",
								borderColor: "rgba(148,163,184,0.2)",
								bgcolor: "rgba(255,255,255,0.82)",
								backdropFilter: "blur(20px)",
								boxShadow: "0 28px 80px rgba(15,23,42,0.12)",
							}}
						>
							<CardContent sx={{ p: { xs: 3, md: 4 } }}>
								<Stack spacing={2.5}>
									<Box>
										<Typography
											variant="overline"
											sx={{
												letterSpacing: "0.2em",
												color: "text.secondary",
											}}
										>
											Designed for focus
										</Typography>
										<Typography
											variant="h5"
											sx={{ fontWeight: 800, mt: 0.5 }}
										>
											Everything you need, without the noise.
										</Typography>
									</Box>

									<Box
										sx={{
											p: 2.5,
											borderRadius: 4,
											bgcolor: "rgba(15,23,42,0.96)",
											color: "common.white",
										}}
									>
										<Typography
											variant="body2"
											sx={{
												opacity: 0.72,
												mb: 1,
											}}
										>
											Example prompt
										</Typography>
										<Typography sx={{ fontWeight: 600 }}>
											“Summarize this proposal, keep the
											key risks, and suggest a cleaner
											closing section.”
										</Typography>
									</Box>

									<Stack spacing={1.5}>
										{features.map(({ title, description, icon: Icon }) => (
											<Stack
												key={title}
												direction="row"
												spacing={1.5}
												alignItems="flex-start"
											>
												<Box
													sx={{
														width: 38,
														height: 38,
														borderRadius: "12px",
														display: "grid",
														placeItems: "center",
														bgcolor:
															"rgba(37,99,235,0.1)",
														color: "primary.main",
														flexShrink: 0,
													}}
												>
													<Icon fontSize="small" />
												</Box>
												<Box>
													<Typography
														variant="subtitle1"
														sx={{ fontWeight: 700 }}
													>
														{title}
													</Typography>
													<Typography
														variant="body2"
														color="text.secondary"
														sx={{ lineHeight: 1.6 }}
													>
														{description}
													</Typography>
												</Box>
											</Stack>
										))}
									</Stack>
								</Stack>
							</CardContent>
						</Card>
					</Box>
				</Stack>

				<Box
					id="features"
					sx={{
						mt: { xs: 8, md: 12 },
						mb: { xs: 8, md: 12 },
					}}
				>
					<Stack spacing={1.5} sx={{ mb: 4, maxWidth: 720 }}>
						<Typography
							variant="overline"
							sx={{ letterSpacing: "0.2em", color: "text.secondary" }}
						>
							Why it works well
						</Typography>
						<Typography variant="h4" sx={{ fontWeight: 800 }}>
							A clean home page that feels like a product, not a
							template.
						</Typography>
						<Typography color="text.secondary" sx={{ maxWidth: 620 }}>
							The layout is intentionally simple, premium, and
							responsive so it reads well on both desktop and mobile.
						</Typography>
					</Stack>

					<Box
						sx={{
							display: "grid",
							gridTemplateColumns: {
								xs: "1fr",
								sm: "repeat(2, minmax(0, 1fr))",
							},
							gap: 2,
						}}
					>
						{features.map(({ title, description, icon: Icon }) => (
							<Card
								key={title}
								elevation={0}
								sx={{
									borderRadius: 4,
									border: "1px solid",
									borderColor: "rgba(148,163,184,0.18)",
									bgcolor: "rgba(255,255,255,0.78)",
									backdropFilter: "blur(14px)",
								}}
							>
								<CardContent sx={{ p: 3 }}>
									<Stack spacing={2}>
										<Box
											sx={{
												width: 44,
												height: 44,
												borderRadius: 3,
												display: "grid",
												placeItems: "center",
												bgcolor: "rgba(37,99,235,0.1)",
												color: "primary.main",
											}}
										>
											<Icon />
										</Box>
										<Box>
											<Typography
												variant="h6"
												sx={{ fontWeight: 800, mb: 0.5 }}
											>
												{title}
											</Typography>
											<Typography
												color="text.secondary"
												sx={{ lineHeight: 1.7 }}
											>
												{description}
											</Typography>
										</Box>
									</Stack>
								</CardContent>
							</Card>
						))}
					</Box>
				</Box>

				<Box
					sx={{
						display: "grid",
						gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
						gap: 2.5,
						alignItems: "stretch",
						mb: 10,
					}}
				>
					<Card
						elevation={0}
						sx={{
							borderRadius: 5,
							border: "1px solid",
							borderColor: "rgba(148,163,184,0.18)",
							bgcolor: "rgba(255,255,255,0.8)",
							backdropFilter: "blur(14px)",
						}}
					>
						<CardContent sx={{ p: { xs: 3, md: 4 } }}>
							<Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
								How it works
							</Typography>
							<Stack spacing={1.5}>
								{steps.map((step, index) => (
									<Stack
										key={step}
										direction="row"
										spacing={1.5}
										alignItems="flex-start"
									>
										<Box
											sx={{
												width: 28,
												height: 28,
												borderRadius: "999px",
												display: "grid",
												placeItems: "center",
												bgcolor: "primary.main",
												color: "common.white",
												fontSize: 13,
												fontWeight: 800,
												flexShrink: 0,
											}}
										>
											{index + 1}
										</Box>
										<Typography
											color="text.secondary"
											sx={{ lineHeight: 1.7 }}
										>
											{step}
										</Typography>
									</Stack>
								))}
							</Stack>
						</CardContent>
					</Card>

					<Card
						elevation={0}
						sx={{
							borderRadius: 5,
							border: "1px solid",
							borderColor: "rgba(148,163,184,0.18)",
							bgcolor: "rgba(15,23,42,0.96)",
							color: "common.white",
							boxShadow: "0 24px 70px rgba(15,23,42,0.2)",
						}}
					>
						<CardContent sx={{ p: { xs: 3, md: 4 } }}>
							<Typography
								variant="overline"
								sx={{
									letterSpacing: "0.2em",
									color: "rgba(255,255,255,0.7)",
								}}
							>
								Ready when you are
							</Typography>
							<Typography variant="h5" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>
								Start a better chat flow today.
							</Typography>
							<Typography
								sx={{
									color: "rgba(255,255,255,0.72)",
									lineHeight: 1.7,
									mb: 3,
								}}
							>
								Create a new conversation, pick a model, and keep
								everything organized from a single workspace.
							</Typography>
							<Link href="/login" style={{ textDecoration: "none" }}>
								<Button
									variant="contained"
									size="large"
									fullWidth
									sx={{
										py: 1.4,
										borderRadius: 999,
										boxShadow:
											"0 18px 34px rgba(37,99,235,0.26)",
									}}
								>
									Enter the app
								</Button>
							</Link>
						</CardContent>
					</Card>
				</Box>

				<Box
					component="footer"
					sx={{
						py: 3,
						borderTop: "1px solid",
						borderColor: "rgba(148,163,184,0.18)",
						display: "flex",
						flexDirection: { xs: "column", sm: "row" },
						justifyContent: "space-between",
						alignItems: { xs: "flex-start", sm: "center" },
						gap: 1.5,
						color: "text.secondary",
					}}
				>
					<Typography variant="body2">
						AI Chat Assistant
					</Typography>
					<Typography variant="body2">
						Designed for a cleaner, more focused chat experience.
					</Typography>
				</Box>
			</Container>
		</Box>
	);
}
