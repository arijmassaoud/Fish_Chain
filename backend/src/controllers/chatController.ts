
// backend/src/controllers/chatController.ts

import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini client. It will get the API key from process.env,
// which is now correctly populated by docker-compose.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { history, message } = req.body;

        if (!message) {
            res.status(400).json({ error: 'Missing message in request body.' });
            return;
        }

        let cleanedHistory = history || [];
        
        const firstUserIndex = cleanedHistory.findIndex((msg: { role: string; }) => msg.role === 'user');
        if (firstUserIndex > 0) {
            cleanedHistory = cleanedHistory.slice(firstUserIndex);
        } else if (firstUserIndex === -1 && cleanedHistory.length > 0) {
            cleanedHistory = [];
        }
        
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash-latest',
            systemInstruction: "You are Fishchain, the friendly and helpful AI assistant for FishChain, an online fish market based in Mahdia, Tunisia.",
        });

        const chat = model.startChat({
            history: cleanedHistory,
            generationConfig: { maxOutputTokens: 500 },
            safetySettings: [{
                category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            }],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const content = response.text();

        res.json({ content });

    } catch (error) {
        console.error('AI Chat Error:', error);
        next(error);
    }
};

