import { ThemeOptions } from "@mui/material/styles";
import { blue, pink } from "@mui/material/colors";

declare module "@mui/material/styles" {
	interface Palette {
		sidebar: Palette["primary"];
		chat: Palette["primary"];
	}
	interface PaletteOptions {
		sidebar?: PaletteOptions["primary"];
		chat?: PaletteOptions["primary"];
	}
}

export const lightThemeOptions: ThemeOptions = {
	palette: {
		mode: "light",
		primary: blue,
		secondary: pink,
		background: {
			default: "#f5f5f5",
			paper: "#ffffff",
		},
		text: {
			primary: "#212121",
			secondary: "#757575",
		},
		sidebar: {
			main: "#ffffff",
		},
		chat: {
			main: "#f5f5f5",
		},
	},
	typography: {
		fontFamily: "inherit",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					textTransform: "none",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 8,
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
				},
			},
		},
	},
};

export const darkThemeOptions: ThemeOptions = {
	palette: {
		mode: "dark",
		primary: blue,
		secondary: pink,
		background: {
			default: "#121212",
			paper: "#1e1e1e",
		},
		text: {
			primary: "#ffffff",
			secondary: "#bbbbbb",
		},
		sidebar: {
			main: "#1e1e1e",
		},
		chat: {
			main: "#121212",
		},
	},
	typography: {
		fontFamily: "inherit",
	},
	components: {
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: 8,
					textTransform: "none",
				},
			},
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					"& .MuiOutlinedInput-root": {
						borderRadius: 8,
					},
				},
			},
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: 12,
				},
			},
		},
	},
};
