import axios from 'axios';
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

export const getLiveWeather = async (req: Request, res: Response) => {
  try {
    const { location } = req.query;

    if (!location || typeof location !== 'string') {
       res.status(400).json({ success: false, message: 'Location is required' });
       return
    }

    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
    );

    const data = response.data;

    const weatherData = {
      location: location,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].description,
      windSpeed: data.wind.speed * 3.6, // m/s → km/h
      humidity: data.main.humidity,
      visibility: data.visibility / 1000,
      icon: data.weather[0].main.toLowerCase(),
      forecast: [], // You can fetch this from a separate endpoint
      marineForecast: [] // Optional: integrate marine APIs
    };

    res.json({ success: true, data: weatherData });
  } catch (err) {
    console.error('Error fetching live weather:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch live weather data' });
  }
};
// backend/src/controllers/weatherController.ts


// Mocked weather data - this would come from OpenWeatherMap or another service
const mockWeatherData = {
  "Port de pêche - Brest": {
    temperature: 18,
    condition: "Partiellement nuageux",
    windSpeed: 15,
    humidity: 72,
    visibility: 8.5,
    icon: 'cloud',
    forecast: [
      { day: "Aujourd'hui", temp: 18, condition: "Nuageux", icon: 'cloud' },
      { day: "Demain", temp: 20, condition: "Ensoleillé", icon: 'sun' },
      { day: "Vendredi", temp: 16, condition: "Pluvieux", icon: 'cloud-rain' },
      { day: "Samedi", temp: 19, condition: "Ensoleillé", icon: 'sun' },
      { day: "Dimanche", temp: 17, condition: "Nuageux", icon: 'cloud' }
    ],
    marineForecast: [
      { time: "6h", wave: "1-2m", wind: "15 km/h", direction: "NO" },
      { time: "12h", wave: "1.5-2.5m", wind: "18 km/h", direction: "N" },
      { time: "18h", wave: "2-3m", wind: "22 km/h", direction: "NE" },
      { time: "24h", wave: "1.5-2m", wind: "16 km/h", direction: "E" }
    ]
  }
};

export const getWeatherForLocation = async (req: Request, res: Response) => {
  try {
    const { location } = req.query;

    // Simulate fetching real-time weather data based on location
    if (!location || typeof location !== 'string') {
       res.status(400).json({ success: false, message: 'Location required' });
       return
    }



    const mockWeatherData: WeatherData = {
  "Port de pêche - Brest": {
    temperature: 18,
    condition: "Partiellement nuageux",
    windSpeed: 15,
    humidity: 72,
    visibility: 8.5,
    icon: 'cloud',
    forecast: [
      { day: "Aujourd'hui", temp: 18, condition: "Nuageux", icon: 'cloud' },
      { day: "Demain", temp: 20, condition: "Ensoleillé", icon: 'sun' },
      { day: "Vendredi", temp: 16, condition: "Pluvieux", icon: 'cloud-rain' },
      { day: "Samedi", temp: 19, condition: "Ensoleillé", icon: 'sun' },
      { day: "Dimanche", temp: 17, condition: "Nuageux", icon: 'cloud' }
    ],
    marineForecast: [
      { time: "6h", wave: "1-2m", wind: "15 km/h", direction: "NO" },
      { time: "12h", wave: "1.5-2.5m", wind: "18 km/h", direction: "N" },
      { time: "18h", wave: "2-3m", wind: "22 km/h", direction: "NE" },
      { time: "24h", wave: "1.5-2m", wind: "16 km/h", direction: "E" }
    ]
}
}
    interface WeatherLocation {
  temperature: number;
  condition: string;
  windSpeed: number;
  humidity: number;
  visibility: number;
  icon: string;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
    icon: string;
  }>;
  marineForecast: Array<{
    time: string;
    wave: string;
    wind: string;
    direction: string;
  }>;
}





// ✅ Add index signature
type WeatherData = {
  [key: string]: WeatherLocation;
};


    const weatherData = mockWeatherData[location];

    if (!weatherData) {
       res.status(404).json({ success: false, message: 'No data found for location' });
       return
    }

    res.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch weather data' });
  }
};