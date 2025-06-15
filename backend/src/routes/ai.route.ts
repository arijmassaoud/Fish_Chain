// backend/src/routes/ai.route.ts

import express, { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const textModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

router.post('/generate-description', async (req: Request, res: Response) => {
    const { productName } = req.body;

    if (!productName || typeof productName !== 'string' || productName.trim().length < 3) {
        res.status(400).json({ error: 'A valid product name is required.' });
        return;
    }

    // A high-quality prompt to get a great description
    const prompt = `
        You are a marketing expert for an online fish market called "FishChain" based in Kairouan, Tunisia.
        Your tone is fresh, appealing, and trustworthy.
        Generate a compelling and concise product description for a product named: "${productName}".

        The description should:
        1. Be around 2-3 sentences long.
        2. Highlight freshness and quality.
        3. Mention potential culinary uses (e.g., "perfect for grilling", "ideal for a classic Tunisian stew").
        4. End with an enticing call to action.
        
        Do not use headings or lists. Return only the paragraph of text for the description.
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const description = result.response.text();
        res.json({ description });
    } catch (error) {
        console.error("AI Description Generation Error:", error);
        res.status(500).json({ error: "Failed to generate AI description." });
    }
});

router.post('/generate-category-description', async (req: Request, res: Response) => {
    const { categoryName } = req.body;

    if (!categoryName) {
        res.status(400).json({ error: 'A category name is required.' });
        return;
    }

    const prompt = `
        You are a content writer for an online fish market called "FishChain".
        Your tone is informative and engaging.
        Generate a concise, 1-2 sentence category description for a fish category named: "${categoryName}".

        The description should:
        1. Briefly explain what types of fish belong to this category.
        2. Mention the general characteristics or culinary benefits of the category.
        
        Example for "White Fish": "Our White Fish collection features delicate, mild-flavored options like cod and sea bass, perfect for a variety of healthy and delicious meals."
        Return only the paragraph of text for the description.
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const description = result.response.text();
        res.json({ description });
    } catch (error) {
        console.error("AI Category Description Error:", error);
        res.status(500).json({ error: "Failed to generate AI description." });
    }
    
});

router.post('/generate-certificate-text', async (req: Request, res: Response) => {
    const { productName, certificateType } = req.body;
    if (!productName || !certificateType) {
        res.status(400).json({ error: 'Product name and certificate type are required.' });
        return;
    }
    const prompt = `As a certified veterinarian in Kairouan, Tunisia, generate the official descriptive text for a certificate. The current date is: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}. The certificate is for the product: "${productName}". The certificate type is: "${certificateType}". The text should be formal and declarative, attesting to the health status of the product and its compliance with local health standards. Return only the official paragraph of text.`;

    try {
        const result = await textModel.generateContent(prompt);
        res.json({ description: result.response.text() });
    } catch (error) {
        console.error("AI Certificate Generation Error:", error);
        res.status(500).json({ error: "Failed to generate AI certificate text." });
    }
});

router.post('/generate-smart-replies', async (req: Request, res: Response) => {
    const { lastMessageContent } = req.body;
    if (!lastMessageContent) {
        res.status(400).json({ error: 'Last message content is required.' });
        return;
    }

    const prompt = `
        Based on the last message received in a conversation, which was: "${lastMessageContent}", 
        suggest 3 very short, relevant, one-click replies. The replies should be natural and conversational.
        Return ONLY a JSON array of strings. 
        Example: ["Sounds great!", "Let me check.", "Thanks!"]
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const replies = JSON.parse(result.response.text());
        res.json({ replies });
    } catch (error) {
        console.error("AI Smart Reply Error:", error);
        res.status(500).json({ error: "Failed to generate smart replies." });
    }
});

router.get('/generate-news-topics', async (req: Request, res: Response) => {
    const prompt = `
        You are a news curator for an online fish market called "FishChain" based in Kairouan, Tunisia.
        Generate 5 current and interesting news headlines related to fishing, aquaculture, marine life, sustainable seafood, or culinary trends involving fish, specifically relevant to a Tunisian context if possible.
        For each headline, provide a very brief (1-sentence) summary.
        Format your response as a JSON array of objects, where each object has a 'title' and a 'summary' field.
        Example: 
        [
            {
                "title": "New Sustainable Fishing Practices Unveiled in Tunisian Coasts",
                "summary": "Tunisia's Ministry of Agriculture, Water Resources, and Fisheries announced new initiatives to promote sustainable fishing."
            },
            {
                "title": "The Rise of Aquaculture: How Farmed Fish is Shaping the Global Market",
                "summary": "A deep dive into the growing role of aquaculture in meeting global seafood demand and its environmental impacts."
            }
        ]
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const textResponse = result.response.text();
        // Attempt to parse the JSON. Gemini can sometimes add ```json or other text.
        const cleanedResponse = textResponse.replace(/```json\n|```/g, '').trim();
        const newsItems = JSON.parse(cleanedResponse);
        res.json({ news: newsItems });
    } catch (error) {
        console.error("AI News Generation Error:", error);
        res.status(500).json({ error: "Failed to generate news topics." });
    }
});

// New: Generate a full blog post from a topic
router.post('/generate-blog-post', async (req: Request, res: Response) => {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim().length < 10) {
        res.status(400).json({ error: 'A valid blog topic is required.' });
        return;
    }

    const prompt = `
        You are an engaging blog writer for "FishChain," an online fish market in Kairouan, Tunisia.
        Write a blog post (approximately 300-500 words) about the topic: "${topic}".
        The post should be informative, engaging, and relevant to our audience who loves fresh fish and seafood.
        Include a catchy title, an introduction, 2-3 body paragraphs with subheadings, and a concluding paragraph.
        Incorporate keywords like "fresh fish," "Tunisian seafood," "sustainable," or "healthy eating" naturally.
        Ensure the tone is fresh, appealing, and trustworthy.
        Return the entire blog post content, including the title and subheadings, as a single markdown string.
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const blogContent = result.response.text();
        res.json({ content: blogContent });
    } catch (error) {
        console.error("AI Blog Post Generation Error:", error);
        res.status(500).json({ error: "Failed to generate blog post." });
    }
});

router.post('/suggest-image-prompts', async (req: Request, res: Response) => {
    const { blogPostTitle, blogPostContent } = req.body;

    if (!blogPostTitle || !blogPostContent) {
        res.status(400).json({ error: 'Blog post title and content are required to suggest images.' });
        return;
    }

    const prompt = `
        You are an AI image prompt generator for "FishChain", an online fish market based in Kairouan, Tunisia.
        Your task is to generate highly descriptive and creative prompts for a text-to-image AI model (like DALL-E or Midjourney) that capture the essence of a given blog post.

        Consider the following blog post:
        Title: "${blogPostTitle}"
        Content: "${blogPostContent.substring(0, 1000)}..." // Limit content to avoid overly long prompts

        Generate 3 distinct image prompts. Each prompt should:
        1. Be a single sentence.
        2. Be highly descriptive, focusing on visual elements, colors, lighting, and mood.
        3. Incorporate themes relevant to "FishChain" (e.g., freshness, Tunisian seafood, local Kairouan fishing, healthy eating, sustainability, culinary uses).
        4. Suggest a style or artistic direction (e.g., "photorealistic," "vibrant watercolor," "minimalist," "cinematic").
        5. Be suitable for a blog post hero image or section illustration.

        Return ONLY a JSON array of strings, where each string is a generated image prompt.

        Example:
        [
            "A bustling, vibrant fish market scene in Kairouan, Tunisia, with fishermen proudly displaying freshly caught sea bream on ice, golden hour lighting, photorealistic, cinematic feel.",
            "Close-up of a beautifully cooked whole fish, perhaps grilled with lemon and herbs, on a rustic wooden table with a blurred background of a Mediterranean coastline, soft natural light, food photography style.",
            "An abstract depiction of ocean waves transforming into a flowing fish silhouette, incorporating colors of the Tunisian flag (red, white, star, crescent), minimalist digital art."
        ]
    `;

    try {
        const result = await textModel.generateContent(prompt);
        const textResponse = result.response.text();

        const cleanedResponse = textResponse.replace(/```json\n|```/g, '').trim();

        const imagePrompts: string[] = JSON.parse(cleanedResponse);

        if (!Array.isArray(imagePrompts) || imagePrompts.some(p => typeof p !== 'string')) {
            throw new Error('AI returned an invalid array of image prompts.');
        }

        res.json({ prompts: imagePrompts });

    } catch (error: any) {
        console.error("AI Image Prompt Generation Error:", error);
        res.status(500).json({
            error: "Failed to generate image prompts.",
            details: error.message || "An unexpected error occurred."
        });
    }
});

router.post('/ask-faq', async (req: Request, res: Response) => {
    const { question } = req.body;

    if (!question || typeof question !== 'string' || question.trim().length < 5) {
        res.status(400).json({ error: 'A valid question is required.' });
        return;
    }

    const knowledgeBaseContext = `
        You are an AI assistant for FishChain, an online marketplace based in Kairouan, Tunisia, specializing in fresh fish, sustainable aquaculture, and blockchain traceability.
        You provide clear, concise, and helpful answers. If a question is outside your scope related to FishChain's operations, or if you don't have enough information, politely state that you cannot answer.

        Here is some general information about FishChain and its operations:
        - **Product Freshness:** All fish are sourced daily from local Tunisian fishermen or sustainable aquaculture farms. They are handled with care and delivered fresh.
        - **Delivery Zones:** We deliver across Kairouan, Sousse, Monastir, and Tunis. Specific delivery times vary by zone and are typically within 24-48 hours of order confirmation.
        - **Payment Methods:** We accept secure online payments via credit card (Visa, Mastercard) and local mobile payment solutions. Cash on delivery is available for orders within Kairouan.
        - **Returns/Refunds:** Due to the perishable nature of our products, returns are generally not accepted unless there's a proven quality issue upon delivery. Please contact customer support within 2 hours of receipt with photo evidence for review.
        - **Blockchain Traceability:** Each fish product comes with a unique QR code. Scanning this code allows you to view its full journey: origin (farm/fishing boat), date of catch/harvest, handling details, and certifications. This ensures transparency and sustainability.
        - **Sustainable Sourcing:** FishChain is committed to promoting sustainable fishing practices and responsible aquaculture. We partner only with suppliers who adhere to environmental regulations and ethical standards.
        - **Account Issues:** For password resets, login problems, or order history, please visit your account dashboard or contact customer support directly.
        - **Order Placement:** Orders can be placed directly through our website. Select your desired fish, add to cart, and proceed to checkout.
        - **Contact Support:** For any further assistance, you can reach our customer support via live chat on our website or by emailing support@fishchain.tn.
        - **Fish Species:** We offer a wide variety of fresh fish including Sea Bream (Dorado), Sea Bass (Loup de Mer), Red Mullet, Sardines, and more, depending on seasonal availability.
        - **Kairouan Focus:** While we deliver broadly, our main processing and dispatch hub is in Kairouan, ensuring local freshness and quality.
        - **Tunisian Context:** We emphasize fresh Tunisian seafood, supporting local fisheries and bringing the best of our coastal bounty to your table.

        Based on the provided information, answer the following question: "${question}".
        Keep your answer concise and to the point. If the question is about a very specific fish disease not mentioned or a highly technical blockchain detail beyond the scope provided, state you cannot answer.
    `;

    try {
        const result = await textModel.generateContent(knowledgeBaseContext);
        const answer = result.response.text();
        res.json({ answer });
    } catch (error) {
        console.error("AI FAQ Generation Error:", error);
        res.status(500).json({ error: "Failed to get an answer to your question." });
    }
});


export default router;