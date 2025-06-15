import express from 'express';
import { getLiveWeather, getWeatherForLocation } from '../controllers/weatherController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// ✅ Protected route
router.get('/weather', authenticate, getWeatherForLocation);

export default router;