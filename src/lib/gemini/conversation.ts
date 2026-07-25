type ChatMessage = {
	role: "user" | "assistant";
	content: string;
	image?: string;
};

type GeminiPart =
	| { type: "text"; text: string }
	| { type: "image"; data: string; mime_type: string };

export type ConversationStep =
	| {
			type: "user_input";
			content: GeminiPart[];
	  }
	| {
			type: "model_output";
			content: GeminiPart[];
	  };

function imageToPart(image: string) {
	const base64Data = image.includes(",") ? image.split(",")[1] : image;
	return {
		type: "image",
		data: base64Data,
		mime_type: "image/jpeg",
	} as const;
}

function messageToTurn(message: ChatMessage): ConversationStep {
	if (message.role === "assistant") {
		const content: GeminiPart[] = [{ type: "text", text: message.content }];

		return {
			type: "model_output",
			content,
		};
	}

	const content: GeminiPart[] = [{ type: "text", text: message.content }];

	if (message.image) {
		content.push(imageToPart(message.image));
	}

	return {
		type: "user_input",
		content,
	};
}

export function buildConversationInput(
	previousMessages: ChatMessage[],
	message: string,
	image?: string,
	options?: {
		includeCurrentMessage?: boolean;
	},
): ConversationStep[] {
	const turns: ConversationStep[] = previousMessages.map(messageToTurn);

	if (options?.includeCurrentMessage === false) {
		return turns;
	}

	const currentTurn: ChatMessage = {
		role: "user",
		content: message,
		image,
	};

	turns.push(messageToTurn(currentTurn));

	return turns;
}
