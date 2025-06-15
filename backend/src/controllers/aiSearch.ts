// backend/src/services/aiService.ts
import { GoogleGenerativeAI, Schema, Part, SchemaType } from '@google/generative-ai'; // ✅ FIX 1: Import Schema and SchemaType

// Initialize the AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

// ✅ FIX 2: Strongly type the schema and use the SchemaType enum for all "type" fields.
const jsonSchema: Schema = {
  type: SchemaType.OBJECT,
  properties: {
    category: { 
        type: SchemaType.STRING, 
        description: "A product category, like 'Fish', 'Shrimp', 'Mollusks', or a recipe name." 
    },
    attributes: { 
        type: SchemaType.ARRAY, 
        items: { type: SchemaType.STRING }, 
        description: "Adjectives or characteristics, e.g., 'healthy', 'spicy', 'boneless', 'wild-caught'." 
    },
    minPrice: { 
        type: SchemaType.NUMBER, 
        description: "The minimum price if mentioned." 
    },
    maxPrice: { 
        type: SchemaType.NUMBER, 
        description: "The maximum price if mentioned." 
    },
    cookingMethod: { 
        type: SchemaType.STRING, 
        description: "A cooking method like 'grill', 'fry', 'bake'." 
    },
    searchTerm: { 
        type: SchemaType.STRING, 
        description: "Any specific keywords or product names mentioned, e.g., 'tuna', 'calamari'." 
    }
  },
};

export async function interpretSearchQuery(query: string) {
  try {
    const prompt = `
      You are an expert seafood and recipe search assistant for an online fish market.
      Analyze the following user query and extract relevant search parameters based on the provided JSON schema.
      The query is: "${query}"
    `;

    // This part of the code does not need to change.
    // It will now work correctly because `jsonSchema` has the correct type.
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: jsonSchema }
    });
    
    const responseText = result.response.text();
    console.log('AI Interpretation:', responseText);
    return JSON.parse(responseText);

  } catch (error) {
    console.error("Error communicating with AI service:", error);
    // Fallback for when AI fails: treat the whole query as a search term
    return { searchTerm: query };
  }
}