import { serve } from "bun";
import index from "./static/index.html";

function getTomorrowDate(): string {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	return tomorrow.toISOString().split("T")[0];
}

async function fetchWeather(): Promise<Response> {
	const lat = "54.687157";
	const lon = "25.279652";
	const dateStr = getTomorrowDate();

	const url = new URL("https://api.open-meteo.com/v1/forecast");
	url.searchParams.set("latitude", lat);
	url.searchParams.set("longitude", lon);
	url.searchParams.set(
		"daily",
		"temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,wind_speed_10m_max"
	);
	url.searchParams.set("start_date", dateStr);
	url.searchParams.set("end_date", dateStr);
	url.searchParams.set("timezone", "auto");

	try {
		const res = await fetch(url.toString());
		if (!res.ok) {
			return Response.json(
				{ error: "Failed to fetch weather data" },
				{ status: 502 }
			);
		}
		const data = await res.json();
		return Response.json({
			date: dateStr,
			location: { name: "Vilnius", latitude: lat, longitude: lon },
			daily: data.daily,
		});
	} catch (e) {
		return Response.json({ error: "Network error" }, { status: 500 });
	}
}

const server = serve({
	port: Number(process.env.PORT) || 3000,
	routes: {
		"/": index,
		"/api/weather": { GET: fetchWeather },
	},
});

console.log(`Listening on ${server.url}`);
