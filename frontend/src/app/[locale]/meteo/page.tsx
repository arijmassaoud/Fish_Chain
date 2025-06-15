'use client';

import React, { useEffect, useState } from 'react';

interface WeatherData {
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

export default function MeteoPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState('Port de pêche - Brest');

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Token not found');

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/weather?location=${encodeURIComponent(location)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const result = await response.json();
          throw new Error(result.message || 'Failed to load weather');
        }

        const result = await response.json();

        if (result.success && result.data) {
          setWeather(result.data);
        } else {
          throw new Error('Failed to load weather');
        }
      } catch (err) {
        console.error('Error fetching weather:', err);
        setError('Could not load weather.');
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [location]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        Loading weather data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden min-h-screen  bg-gradient-to-br from-indigo-900 via-purple-800 to-blue-800  py-20">
      <h1 className="text-3xl font-bold text-white text-center mb-6 mt-103">FishChain Météo</h1>

      {/* Location Input */}
      <div className="mb-6 max-w-md mx-auto">
        <label htmlFor="location" className="block text-sm font-medium mb-2">
          Port ou localisation
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Brest, Concarneau..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none"
        />
      </div>

      {/* Display Weather */}
      <div className="max-w-4xl mx-auto bg-blue-50 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">{location}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-bold">Température:</span> {weather?.temperature}°C
          </div>
          <div>
            <span className="font-bold">Condition:</span> {weather?.condition}
          </div>
          <div>
            <span className="font-bold">Vent:</span> {weather?.windSpeed} km/h
          </div>
          <div>
            <span className="font-bold">Humidité:</span> {weather?.humidity}%
          </div>
          <div>
            <span className="font-bold">Visibilité:</span> {weather?.visibility} km
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold">Prévisions Marine</h3>
          <ul className="mt-2 space-y-2">
            {weather?.marineForecast.map((forecast, index) => (
              <li key={index} className="bg-white p-3 rounded shadow-sm">
                <strong>{forecast.time}</strong>: Vagues {forecast.wave}, Vent {forecast.wind}, Direction {forecast.direction}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}