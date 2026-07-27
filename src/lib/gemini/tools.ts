export type GeminiToolMode = "web" | "maps" | "knowledge" | "weather";
export type GeminiToolName =
	| "google_search"
	| "url_context"
	| "code_execution"
	| "google_maps"
	| "file_search"
	| "weather"
	| "none";

export const DEFAULT_GEMINI_TOOL_MODE: GeminiToolMode = "web";

export const GEMINI_TOOL_MODES: Array<{
	id: GeminiToolMode;
	label: string;
	description: string;
	disabled?: boolean;
}> = [
	{
		id: "web",
		label: "Web + Code",
		description: "Google Search, URL Context, and Code Execution.",
	},
	{
		id: "maps",
		label: "Maps",
		description: "Ground answers in places, directions, and nearby results.",
	},
	{
		id: "knowledge",
		label: "Knowledge Base",
		description: "Search your File Search store, if configured.",
	},
	{
		id: "weather",
		label: "Weather",
		description: "Use the custom weather function only.",
	},
];

export const weatherFunctionDeclaration = {
	type: "function",
	name: "get_current_temperature",
	description: "Gets the current temperature for a given location.",
	parameters: {
		type: "object",
		properties: {
			location: {
				type: "string",
				description: "The city name, e.g. Pune",
			},
		},
		required: ["location"],
	},
} as const;

export type GeminiToolDefinition =
	| typeof weatherFunctionDeclaration
	| { type: "google_search" }
	| { type: "code_execution" }
	| { type: "url_context" }
	| { type: "google_maps" }
	| {
			type: "file_search";
			file_search_store_names: string[];
			metadata_filter?: string;
			top_k?: number;
	  };

export function getConfiguredFileSearchStores() {
	const rawStores =
		process.env.GEMINI_FILE_SEARCH_STORE_NAMES ??
		process.env.GEMINI_FILE_SEARCH_STORE_NAME ??
		"";

	return rawStores
		.split(",")
		.map((store) => store.trim())
		.filter(Boolean);
}

export function isGeminiToolMode(mode: string): mode is GeminiToolMode {
	return GEMINI_TOOL_MODES.some((entry) => entry.id === mode);
}

export function normalizeGeminiToolMode(mode: string | undefined) {
	return mode && isGeminiToolMode(mode) ? mode : DEFAULT_GEMINI_TOOL_MODE;
}

function looksLikeWeatherRequest(message: string) {
	return /\b(weather|temperature|forecast|rain|snow|humidity|wind|climate)\b/i.test(
		message,
	);
}

function looksLikeUrlRequest(message: string) {
	return /\bhttps?:\/\/|www\./i.test(message);
}

function looksLikeCodeRequest(message: string) {
	return /\b(calculate|compute|calculator|math|equation|sum|average|percentage|convert|sort|analyze|analysis|code|script|python|javascript|sql|regex)\b/i.test(
		message,
	);
}

function looksLikeMapsRequest(message: string) {
	return /\b(map|directions?|route|near me|nearby|location|places?|restaurant|hotel|cafe|airport|train station)\b/i.test(
		message,
	);
}

function looksLikeKnowledgeRequest(message: string) {
	return /\b(uploaded|document|docs?|pdf|file search|knowledge base|my notes|my files|internal|policy|handbook)\b/i.test(
		message,
	);
}

export function autoSelectGeminiToolMode(
	message: string,
	image?: string,
): GeminiToolMode {
	if (looksLikeWeatherRequest(message)) {
		return "weather";
	}

	if (looksLikeMapsRequest(message)) {
		return "maps";
	}

	if (looksLikeKnowledgeRequest(message)) {
		return "knowledge";
	}

	if (image) {
		return "web";
	}

	return "web";
}

function looksLikeFreshInfoRequest(message: string) {
	return /\b(today|todays|current|now|latest|recent|news|date|time|this week|this month|right now|weather)\b/i.test(
		message,
	);
}

export function selectGeminiToolsForPrompt(
	message: string,
	image?: string,
): GeminiToolDefinition[] {
	if (looksLikeWeatherRequest(message)) {
		return [weatherFunctionDeclaration];
	}

	if (looksLikeMapsRequest(message)) {
		return [{ type: "google_maps" }];
	}

	if (looksLikeKnowledgeRequest(message)) {
		const fileSearchStoreNames = getConfiguredFileSearchStores();
		return fileSearchStoreNames.length > 0
			? [
					{
						type: "file_search",
						file_search_store_names: fileSearchStoreNames,
					},
				]
			: [];
	}

	if (looksLikeUrlRequest(message)) {
		return [{ type: "url_context" }];
	}

	if (looksLikeCodeRequest(message)) {
		return [{ type: "code_execution" }];
	}

	if (looksLikeFreshInfoRequest(message)) {
		return [{ type: "google_search" }];
	}

	if (image) {
		return [{ type: "google_search" }];
	}

	return [{ type: "google_search" }];
}

export function resolveToolDefinitionByName(
	toolName: GeminiToolName,
): GeminiToolDefinition[] {
	switch (toolName) {
		case "google_search":
			return [{ type: "google_search" }];
		case "url_context":
			return [{ type: "url_context" }];
		case "code_execution":
			return [{ type: "code_execution" }];
		case "google_maps":
			return [{ type: "google_maps" }];
		case "file_search": {
			const fileSearchStoreNames = getConfiguredFileSearchStores();
			return fileSearchStoreNames.length > 0
				? [
						{
							type: "file_search",
							file_search_store_names: fileSearchStoreNames,
						},
					]
				: [{ type: "google_search" }];
		}
		case "weather":
			return [weatherFunctionDeclaration];
		case "none":
		default:
			return [];
	}
}
