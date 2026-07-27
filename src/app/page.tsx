import Link from "next/link";
import {
	Box,
	Button,
	Card,
	CardContent,
	Chip,
	Container,
	Divider,
	Stack,
	Typography,
} from "@mui/material";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AutoAwesome from "@mui/icons-material/AutoAwesome";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";

const highlights = ["Fast replies", "Simple interface", "Private by default"];

const valuePoints = [
	{
		icon: AutoAwesome,
		title: "Focused conversations",
		description: "A calm workspace that keeps the attention on the chat.",
	},
	{
		icon: LockOutlinedIcon,
		title: "Account-scoped history",
		description: "Your chats stay organized and easy to come back to.",
	},
	{
		icon: PhoneIphoneIcon,
		title: "Built for mobile",
		description:
			"Everything stacks cleanly and stays easy to tap on small screens.",
	},
];

export default function LandingPage() {
	return (
		<Box
			sx={{
				minHeight: "100vh",
				overflow: "hidden",
				background:
					"radial-gradient(circle at top left, rgba(56,189,248,0.18), transparent 32%), radial-gradient(circle at top right, rgba(99,102,241,0.14), transparent 28%), linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)",
			}}
		>
			<Container
				maxWidth="lg"
				sx={{ position: "relative", py: { xs: 2.5, md: 4 } }}
			>
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						gap: 2,
						mb: { xs: 6, md: 8 },
					}}
				>
					<Stack direction="row" spacing={1.5} alignItems="center">
						<Box
							sx={{
								width: 42,
								height: 42,
								borderRadius: "14px",
								background:
									"linear-gradient(135deg, #0f172a 0%, #2563eb 55%, #7c3aed 100%)",
								boxShadow: "0 18px 35px rgba(37,99,235,0.22)",
							}}
						/>
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
								Minimal chat, maximum focus
							</Typography>
						</Box>
					</Stack>

					<Link href="/login" style={{ textDecoration: "none" }}>
						<Button
							variant="contained"
							size="medium"
							sx={{
								px: 2.25,
								py: 1.05,
								borderRadius: 999,
								boxShadow: "0 16px 32px rgba(37,99,235,0.2)",
							}}
						>
							Sign in
						</Button>
					</Link>
				</Box>

				<Stack
					direction={{ xs: "column", md: "row" }}
					spacing={{ xs: 4, md: 5 }}
					alignItems="center"
				>
					<Box sx={{ flex: 1, width: "100%" }}>
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
								bgcolor: "rgba(255,255,255,0.72)",
								backdropFilter: "blur(12px)",
							}}
						>
							<Box
								sx={{
									width: 9,
									height: 9,
									borderRadius: "999px",
									bgcolor: "primary.main",
									boxShadow: "0 0 0 4px rgba(37,99,235,0.12)",
								}}
							/>
							<Typography
								variant="caption"
								sx={{ fontWeight: 700, letterSpacing: "0.1em" }}
							>
								SMART CHAT WORKSPACE
							</Typography>
						</Box>

						<Typography
							variant="h1"
							sx={{
								fontWeight: 900,
								letterSpacing: "-0.06em",
								lineHeight: 0.95,
								fontSize: {
									xs: "2.8rem",
									sm: "3.7rem",
									md: "4.9rem",
								},
								maxWidth: 760,
							}}
						>
							Chat with an interface that feels clean, quick, and
							easy to use.
						</Typography>

						<Typography
							variant="h6"
							color="text.secondary"
							sx={{
								mt: 2.5,
								maxWidth: 620,
								lineHeight: 1.6,
								fontWeight: 500,
								fontSize: { xs: "1rem", md: "1.15rem" },
							}}
						>
							Start a conversation, keep the page uncluttered, and
							pick up right where you left off.
						</Typography>

						<Stack
							direction={{ xs: "column", sm: "row" }}
							spacing={1.5}
							sx={{ mt: 3.5 }}
						>
							<Link
								href="/login"
								style={{ textDecoration: "none" }}
							>
								<Button
									variant="contained"
									size="large"
									startIcon={<ChatBubbleOutlineIcon />}
									sx={{
										px: 3,
										py: 1.25,
										borderRadius: 999,
										boxShadow:
											"0 18px 34px rgba(37,99,235,0.24)",
									}}
								>
									Start chatting
								</Button>
							</Link>
							{/* <Button
								component="a"
								href="#overview"
								variant="outlined"
								size="large"
								sx={{
									px: 3,
									py: 1.25,
									borderRadius: 999,
									borderColor: "rgba(148,163,184,0.35)",
									bgcolor: "rgba(255,255,255,0.7)",
									backdropFilter: "blur(12px)",
								}}
							>
								See the experience
							</Button> */}
						</Stack>

						<Stack
							direction="row"
							spacing={1}
							useFlexGap
							flexWrap="wrap"
							sx={{ mt: 3 }}
						>
							{highlights.map((item) => (
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

					<Box
						sx={{ flex: 0.95, width: "100%", position: "relative" }}
					>
						<Box
							sx={{
								position: "absolute",
								inset: { xs: 10, md: 20 },
								borderRadius: 8,
								background:
									"linear-gradient(135deg, rgba(37,99,235,0.16), rgba(124,58,237,0.14))",
								filter: "blur(24px)",
							}}
						/>

						<Card
							elevation={0}
							sx={{
								position: "relative",
								borderRadius: 6,
								border: "1px solid",
								borderColor: "rgba(148,163,184,0.18)",
								bgcolor: "rgba(255,255,255,0.84)",
								backdropFilter: "blur(20px)",
								boxShadow: "0 28px 80px rgba(15,23,42,0.1)",
							}}
						>
							<CardContent sx={{ p: { xs: 2.5, sm: 3, md: 4 } }}>
								<Stack spacing={2.5}>
									<Box>
										<Typography
											variant="overline"
											sx={{
												letterSpacing: "0.2em",
												color: "text.secondary",
											}}
										>
											Why it feels better
										</Typography>
										<Typography
											variant="h5"
											sx={{ fontWeight: 800, mt: 0.5 }}
										>
											Everything important, nothing extra.
										</Typography>
									</Box>

									<Box
										sx={{
											p: { xs: 2, md: 2.5 },
											borderRadius: 4,
											bgcolor: "rgba(15,23,42,0.96)",
											color: "common.white",
										}}
									>
										<Typography
											variant="body2"
											sx={{ opacity: 0.72, mb: 1 }}
										>
											Example prompt
										</Typography>
										<Typography
											sx={{
												fontWeight: 600,
												lineHeight: 1.6,
											}}
										>
											“Summarize this idea, keep it
											concise, and make the next step
											obvious.”
										</Typography>
									</Box>

									<Stack spacing={1.5} id="overview">
										{valuePoints.map(
											({
												title,
												description,
												icon: Icon,
											}) => (
												<Stack
													key={title}
													direction="row"
													spacing={1.5}
													alignItems="flex-start"
												>
													<Box
														sx={{
															width: 40,
															height: 40,
															borderRadius:
																"12px",
															display: "grid",
															placeItems:
																"center",
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
															sx={{
																fontWeight: 700,
															}}
														>
															{title}
														</Typography>
														<Typography
															variant="body2"
															color="text.secondary"
															sx={{
																lineHeight: 1.6,
															}}
														>
															{description}
														</Typography>
													</Box>
												</Stack>
											),
										)}
									</Stack>

									<Divider />

									<Typography
										variant="body2"
										color="text.secondary"
									>
										Designed to feel calm on desktop and
										compact on mobile.
									</Typography>
								</Stack>
							</CardContent>
						</Card>
					</Box>
				</Stack>
			</Container>
		</Box>
	);
}
