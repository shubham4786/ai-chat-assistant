export type GeminiApiError = {
	message: string;
	status: number;
};

export function formatGeminiError(error: unknown): GeminiApiError {
	const fallback = {
		message: "Internal Server Error",
		status: 500,
	};

	if (error instanceof Error) {
		const message = error.message || fallback.message;
		const normalized = message.toLowerCase();

		if (
			normalized.includes("peak requests per day") ||
			normalized.includes("quota") ||
			normalized.includes("rate limit") ||
			normalized.includes("resource_exhausted") ||
			normalized.includes("429")
		) {
			return {
				message:
					"You’ve hit the Gemini usage limit for today. Please try again later or switch to a different model.",
				status: 429,
			};
		}

		return {
			message,
			status: fallback.status,
		};
	}

	return fallback;
}
