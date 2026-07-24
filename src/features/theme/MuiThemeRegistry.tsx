"use client";

import {
	createTheme,
	ThemeProvider as MuiThemeProvider,
} from "@mui/material/styles";
import { useTheme } from "next-themes";
import { CssBaseline } from "@mui/material";
import React, { useMemo } from "react";
import { lightThemeOptions, darkThemeOptions } from "./theme";
import MuiEmotionCacheProvider from "./EmotionCache";

export default function MuiThemeRegistry({
	children,
}: {
	children: React.ReactNode;
}) {
	const { theme } = useTheme();

	const muiTheme = useMemo(
		() =>
			createTheme(
				theme === "dark" ? darkThemeOptions : lightThemeOptions,
			),
		[theme],
	);

	return (
		<MuiEmotionCacheProvider>
			<MuiThemeProvider theme={muiTheme}>
				<CssBaseline />
				{children}
			</MuiThemeProvider>
		</MuiEmotionCacheProvider>
	);
}
