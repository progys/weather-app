import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const LATITUDE = '54.687157';
const LONGITUDE = '25.279652';

export const GET: RequestHandler = async ({ fetch }) => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const dateStr = tomorrow.toISOString().split('T')[0];

	const url = new URL('https://api.open-meteo.com/v1/forecast');
	url.searchParams.set('latitude', LATITUDE);
	url.searchParams.set('longitude', LONGITUDE);
	url.searchParams.set('daily', 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,wind_speed_10m_max');
	url.searchParams.set('start_date', dateStr);
	url.searchParams.set('end_date', dateStr);
	url.searchParams.set('timezone', 'auto');

	const res = await fetch(url.toString());
	if (!res.ok) {
		return json({ error: 'Failed to fetch weather data' }, { status: 502 });
	}

	const data = await res.json();
	return json({
		date: dateStr,
		location: { name: 'Vilnius', latitude: LATITUDE, longitude: LONGITUDE },
		daily: data.daily
	});
};
