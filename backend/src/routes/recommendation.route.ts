// backend/src/controllers/recommendationController.ts

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
// Note: AI and image generation logic would be in their own utility files in a larger app.
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

// This helper function can be moved to a utility file, e.g., 'src/utils/imageGenerator.ts'
async function generateImageWithHuggingFace(prompt: string): Promise<string | null> {
    try {
        const hfToken = process.env.HF_TOKEN;
        if (!hfToken) {
            console.error("CRITICAL ERROR: HF_TOKEN is missing from your .env file.");
            throw new Error("Hugging Face API token is not configured on the server.");
        }
        const API_URL = "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0";
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${hfToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ inputs: prompt }),
        });
        if (!response.ok) throw new Error(`Hugging Face API failed: ${await response.text()}`);
        const imageBlob = await response.blob();
        const buffer = Buffer.from(await imageBlob.arrayBuffer());
        return `data:${imageBlob.type};base64,${buffer.toString('base64')}`;
    } catch (error) {
        console.error("Error in generateImageWithHuggingFace:", error);
        return null;
    }
}

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
    const { id: productId } = req.params;
    const { type = 'similar' } = req.query as { type: string };

    try {
        const targetProduct = await prisma.product.findUnique({ where: { id: productId } });
        if (!targetProduct) {
            res.status(404).json({ error: 'Target product not found.' });
            return;
        }

        let responseData;

        switch (type) {
            case 'similar':
                const similarProducts = await prisma.product.findMany({
                    where: {
                        NOT: { id: productId },
                        categoryId: targetProduct.categoryId,
                    },
                    take: 3,
                });

                if (similarProducts.length === 0) {
                    responseData = { products: [], imageUrl: null, text: "No similar products were found in this category." };
                    break;
                }
                
                const productNames = similarProducts.map(p => p.name).join(', ');
                const imagePrompt = `A single, elegant, high-resolution image showcasing these three fish: ${productNames}. Artfully arranged on a bed of crushed ice at a luxury fish market stall. Bright, clean, professional studio lighting. Photorealistic.`;
                const generatedImageUrl = await generateImageWithHuggingFace(imagePrompt);
                
                responseData = { 
                    products: similarProducts, 
                    imageUrl: generatedImageUrl,
                    text: `Based on your interest in ${targetProduct.name}, you might also love these.`
                };
                break;
            
            case 'season':
                const seasonTextPrompt = `You are a marine biologist from Kairouan, Tunisia. For the fish named "${targetProduct.name}", describe its peak fishing season. Keep it concise. The current date is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`;
                const seasonImagePrompt = `A beautiful, artistic photo representing the fishing season for ${targetProduct.name} in Tunisia. The image should evoke a bright sunny day on the Mediterranean coast, with the fish swimming in clear blue water.`;
                const seasonText = (await textModel.generateContent(seasonTextPrompt)).response.text();
                const seasonImageUrl = await generateImageWithHuggingFace(seasonImagePrompt);
                responseData = { text: seasonText, imageUrl: seasonImageUrl };
                break;

            case 'recipe':
                const recipeTextPrompt = `You are a Tunisian chef from Kairouan. Provide a simple, delicious recipe for preparing "${targetProduct.name}", including a creative name for the dish. Format in markdown.`;
                const recipeImagePrompt = `Professional food photography, a beautifully plated Tunisian dish of ${targetProduct.name}, hyper-realistic, on a rustic ceramic plate.`;
                const recipeText = (await textModel.generateContent(recipeTextPrompt)).response.text();
                const recipeImageUrl = await generateImageWithHuggingFace(recipeImagePrompt);
                responseData = { text: recipeText, imageUrl: recipeImageUrl };
                break;

            default:
                res.status(400).json({ error: `Invalid recommendation type: ${type}` });
                return;
        }
        res.json(responseData);
    } catch (error: any) {
        console.error(`AI Recommendation Error (type: ${type}):`, error);
        next(error);
    }
};
