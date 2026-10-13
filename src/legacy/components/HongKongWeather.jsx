import { useCallback, useEffect, useState } from "react";
import { Icon } from "./Icons.jsx";

const url = "https://api.open-meteo.com/v1/forecast?latitude=22.2819&longitude=114.1577&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=Asia%2FHong_Kong";
const descriptions = { 0: "Clear skies", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast", 45: "Misty", 48: "Misty", 51: "Light drizzle", 53: "Drizzle", 55: "Heavy drizzle", 61: "Light rain", 63: "Rain", 65: "Heavy rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow", 80: "Passing showers", 81: "Showers", 82: "Heavy showers", 95: "Thunderstorms", 96: "Thunderstorms", 99: "Thunderstorms" };
export default function HongKongWeather() {
  const [weather, setWeather] = useState(null); const [loading, setLoading] = useState(true); const [error, setError] = useState(false);
  const refresh = useCallback(async () => { try { const response = await fetch(url, { cache: "no-store" }); if (!response.ok) throw new Error("Weather unavailable"); const data = await response.json(); setWeather(data.current); setError(false); } catch { setError(true); } finally { setLoading(false); } }, []);
  useEffect(() => { refresh(); const timer = window.setInterval(refresh, 15 * 60 * 1000); return () => window.clearInterval(timer); }, [refresh]);
  return <section className={`weather-orb ${weather ? "weather-live" : ""}`} aria-label="Current weather in Hong Kong">
    {loading ? <><span className="weather-temp-skeleton"/><small>Checking Hong Kong<br/>weather…</small></> : weather ? <><span>{Math.round(weather.temperature_2m)}°</span><small>{descriptions[weather.weather_code] || "Current conditions"}<br/>Hong Kong</small><i className="weather-icon" aria-hidden="true"><Icon name={weather.weather_code >= 51 ? "rain" : weather.weather_code === 3 ? "cloud" : "sun"} size={20} /></i><div className="weather-details"><span>Feels like {Math.round(weather.apparent_temperature)}°</span><span>Humidity {weather.relative_humidity_2m}%</span><span>Wind {Math.round(weather.wind_speed_10m)} km/h</span></div><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Live conditions · Open-Meteo</a></> : <><span>—°</span><small>{error ? "Weather unavailable" : "Hong Kong"}</small><button type="button" className="weather-refresh" onClick={refresh}>Try again ↻</button></>}
  </section>;
}
