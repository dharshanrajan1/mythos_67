"use client"

import { useEffect, useState } from "react"
import { Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from "lucide-react"

interface Weather {
    temp: number
    weatherCode: number
    windspeed: number
    humidity: number
    city: string
}

function getWeatherIcon(code: number, className = "h-5 w-5") {
    // WMO weather interpretation codes
    if (code === 0) return <Sun className={`${className} text-amber-400`} />
    if (code <= 3) return <Cloud className={`${className} text-sky-400`} />
    if (code <= 67) return <CloudRain className={`${className} text-blue-400`} />
    if (code <= 77) return <CloudSnow className={`${className} text-cyan-300`} />
    if (code <= 82) return <CloudRain className={`${className} text-blue-500`} />
    return <CloudLightning className={`${className} text-violet-400`} />
}

function getWeatherLabel(code: number): string {
    if (code === 0) return "Clear"
    if (code <= 3) return "Cloudy"
    if (code <= 48) return "Foggy"
    if (code <= 67) return "Rainy"
    if (code <= 77) return "Snowy"
    if (code <= 82) return "Showers"
    return "Stormy"
}

export function WeatherWidget() {
    const [weather, setWeather] = useState<Weather | null>(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        const fetchWeather = async () => {
            try {
                // Atlanta, GA coordinates
                const lat = 33.7490
                const lon = -84.3880
                const city = "Atlanta, GA"

                // Fetch weather from Open-Meteo
                const weatherRes = await fetch(
                    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&wind_speed_unit=mph&temperature_unit=fahrenheit`
                )
                const weatherData = await weatherRes.json()
                const c = weatherData.current

                setWeather({
                    temp: Math.round(c.temperature_2m),
                    weatherCode: c.weather_code,
                    windspeed: Math.round(c.wind_speed_10m),
                    humidity: c.relative_humidity_2m,
                    city,
                })
            } catch {
                setError(true)
            }
        }

        fetchWeather()
    }, [])

    if (error) return null

    if (!weather) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground text-sm animate-pulse">
                <Cloud className="h-4 w-4" />
                <span>Loading weather…</span>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-3">
            {getWeatherIcon(weather.weatherCode, "h-6 w-6")}
            <div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-semibold">{weather.temp}°F</span>
                    <span className="text-sm text-muted-foreground">{getWeatherLabel(weather.weatherCode)}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    <span className="flex items-center gap-1">
                        <Droplets className="h-3 w-3" />
                        {weather.humidity}%
                    </span>
                    <span className="flex items-center gap-1">
                        <Wind className="h-3 w-3" />
                        {weather.windspeed} mph
                    </span>
                    <span>{weather.city}</span>
                </div>
            </div>
        </div>
    )
}
