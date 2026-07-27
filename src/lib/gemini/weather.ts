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

export type WeatherFunctionCall = {
	type: "function_call";
	id: string;
	name: string;
	arguments?: {
		location?: string;
		[key: string]: unknown;
	};
};

export type WeatherFunctionResult = {
	type: "function_result";
	name: string;
	call_id: string;
	result: Array<{ type: "text"; text: string }>;
};

function getWeatherDescription(weatherCode: number): string {
	const descriptions: Record<number, string> = {
		0: "clear sky",
		1: "mainly clear",
		2: "partly cloudy",
		3: "overcast",
		45: "fog",
		48: "depositing rime fog",
		51: "light drizzle",
		53: "moderate drizzle",
		55: "dense drizzle",
		61: "slight rain",
		63: "moderate rain",
		65: "heavy rain",
		66: "light freezing rain",
		67: "heavy freezing rain",
		71: "slight snow fall",
		73: "moderate snow fall",
		75: "heavy snow fall",
		77: "snow grains",
		80: "slight rain showers",
		81: "moderate rain showers",
		82: "violent rain showers",
		85: "slight snow showers",
		86: "heavy snow showers",
		95: "thunderstorm",
		96: "thunderstorm with slight hail",
		99: "thunderstorm with heavy hail",
	};

	return descriptions[weatherCode] ?? "unknown conditions";
}

export async function getCurrentWeather(location: string) {
	const geocodeResponse = await fetch(
		`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
			location,
		)}&count=1&language=en&format=json`,
	);

	if (!geocodeResponse.ok) {
		throw new Error("Unable to look up that location right now.");
	}

	const geocodeData = (await geocodeResponse.json()) as {
		results?: Array<{
			name: string;
			latitude: number;
			longitude: number;
			admin1?: string;
			country?: string;
		}>;
	};

	const match = geocodeData.results?.[0];

	if (!match) {
		return {
			location,
			error: `No matching location found for "${location}".`,
		};
	}

	const weatherResponse = await fetch(
		`https://api.open-meteo.com/v1/forecast?latitude=${match.latitude}&longitude=${match.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`,
	);

	if (!weatherResponse.ok) {
		throw new Error("Unable to fetch the current weather right now.");
	}

	const weatherData = (await weatherResponse.json()) as {
		current?: {
			temperature_2m: number;
			apparent_temperature: number;
			weather_code: number;
			wind_speed_10m: number;
		};
		current_units?: {
			temperature_2m?: string;
			apparent_temperature?: string;
			wind_speed_10m?: string;
		};
	};

	if (!weatherData.current) {
		return {
			location,
			error: `Weather data was not available for "${location}".`,
		};
	}

	const displayLocation = [match.name, match.admin1, match.country]
		.filter(Boolean)
		.join(", ");

	return {
		location: displayLocation,
		temperature: weatherData.current.temperature_2m,
		feelsLike: weatherData.current.apparent_temperature,
		windSpeed: weatherData.current.wind_speed_10m,
		weatherCode: weatherData.current.weather_code,
		condition: getWeatherDescription(weatherData.current.weather_code),
		units: weatherData.current_units ?? {
			temperature_2m: "°C",
			apparent_temperature: "°C",
			wind_speed_10m: "km/h",
		},
	};
}

export function extractWeatherCalls(
	interaction: unknown,
): WeatherFunctionCall[] {
	const maybeSteps = interaction as {
		steps?: unknown[];
		outputs?: unknown[];
	};
	const steps = maybeSteps.steps ?? maybeSteps.outputs ?? [];

	return steps.filter(
		(step): step is WeatherFunctionCall =>
			typeof step === "object" &&
			step !== null &&
			"type" in step &&
			(step as { type?: string }).type === "function_call",
	);
}
