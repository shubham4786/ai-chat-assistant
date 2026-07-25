export type GeminiModelId =
	| "gemini-3.6-flash"
	| "gemini-3.5-flash"
	| "gemini-3.5-flash-lite"
	// | "gemini-3.1-pro-preview"
	| "gemini-3.1-flash-lite"
	| "gemini-3-flash-preview";
// | "gemini-2.5-pro"
// | "gemini-2.5-flash"
// | "gemini-2.5-flash-lite";

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-3.5-flash-lite";

export const GEMINI_MODELS: Array<{
	id: GeminiModelId;
	label: string;
	description: string;
}> = [
	{
		id: "gemini-3.6-flash",
		label: "Gemini 3.6 Flash",
		description: "Fast default for everyday chat and tool use.",
	},
	{
		id: "gemini-3.5-flash",
		label: "Gemini 3.5 Flash",
		description: "Balanced speed and quality.",
	},
	{
		id: "gemini-3.5-flash-lite",
		label: "Gemini 3.5 Flash-Lite",
		description: "Lower-cost, lighter-weight option.",
	},
	// {
	// 	id: "gemini-3.1-pro-preview",
	// 	label: "Gemini 3.1 Pro Preview",
	// 	description: "Stronger reasoning for harder prompts.",
	// },
	{
		id: "gemini-3.1-flash-lite",
		label: "Gemini 3.1 Flash-Lite",
		description: "Small, quick, budget-friendly model.",
	},
	{
		id: "gemini-3-flash-preview",
		label: "Gemini 3 Flash Preview",
		description: "Preview model for newer flash capabilities.",
	},
	// {
	// 	id: "gemini-2.5-pro",
	// 	label: "Gemini 2.5 Pro",
	// 	description: "Advanced model for complex reasoning.",
	// },
	// {
	// 	id: "gemini-2.5-flash",
	// 	label: "Gemini 2.5 Flash",
	// 	description: "Stable, high-volume general-purpose model.",
	// },
	// {
	// 	id: "gemini-2.5-flash-lite",
	// 	label: "Gemini 2.5 Flash-Lite",
	// 	description: "Fastest budget option in the 2.5 family.",
	// },
];

export function isGeminiModelId(model: string): model is GeminiModelId {
	return GEMINI_MODELS.some((entry) => entry.id === model);
}
