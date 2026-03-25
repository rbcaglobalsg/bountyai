import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("No API key found");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
    try {
        console.log("Listing models...");
        // In the latest SDK, listModels might be different. 
        // We'll try to fetch the list directly if possible.
        // Actually, the SDK might not expose listModels easily.
        // We'll try common names and see which ones don't 404.
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash-exp", "gemini-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent("test");
                console.log(`[SUCCESS] ${m} is available`);
            } catch (e: any) {
                console.log(`[FAILED] ${m}: ${e.message}`);
            }
        }
    } catch (e: any) {
        console.log("Fatal:", e.message);
    }
}

run();
