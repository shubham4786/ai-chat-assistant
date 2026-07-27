import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import "highlight.js/styles/github-dark.css";
import AuthContext from "@/features/auth/AuthContext";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import QueryProvider from "@/features/chat/QueryProvider";
import React from "react";
import MuiThemeRegistry from "@/features/theme/MuiThemeRegistry";

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "AI Chat Assistant",
	description:
		"A ChatGPT-inspired AI Chat Application built with Next.js and Google Gemini.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="h-full" suppressHydrationWarning>
			<body className={`${plusJakartaSans.className} min-h-full flex flex-col`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<MuiThemeRegistry>
						<QueryProvider>
							<AuthContext>{children}</AuthContext>
						</QueryProvider>
					</MuiThemeRegistry>
				</ThemeProvider>
			</body>
		</html>
	);
}
