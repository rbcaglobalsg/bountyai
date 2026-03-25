import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly for extra reliability on some systems
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getGeminiClient(): GoogleGenerativeAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set. Please check your .env file.');
    }
    return new GoogleGenerativeAI(apiKey);
}

export async function generateHints(
    title: string,
    description: string,
    repoUrl: string,
    repoContext?: { readme: string, fileTree: string }
): Promise<string> {
    const genAI = getGeminiClient();
    // Use gemini-2.5-flash for its massive context window capability and high generation speed
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an elite, senior software architect specializing in technical bounties and open-source contributions.
Your task is to provide a meticulously detailed, highly actionable, and precise step-by-step guide to solve the given issue.
You have access to the repository's file tree and README. Analyze the architecture based on the file tree to determine precisely WHICH files need to be modified.

Provide practical, code-level hints:
1. Exact files that likely need changes (reference the actual file tree paths from the provided File Tree context).
2. The specific architectural approach to solve the issue.
3. Concrete code snippet suggestions matching the project's language and framework.
4. Potential edge cases or pitfalls.

Do NOT give generic advice. Use the provided File Tree to anchor your suggestions to real files. Be concise but highly technical.`
    });

    let userPrompt = `Title: ${title}\nDescription: ${description}\nRepo URL: ${repoUrl}\n`;
    
    if (repoContext) {
        userPrompt += `\n--- REPOSITORY CONTEXT ---\n`;
        userPrompt += `[FILE TREE]\n${repoContext.fileTree}\n\n`;
        userPrompt += `[README SUMMARY]\n${repoContext.readme}\n`;
    }

    const result = await model.generateContent(userPrompt);
    return result.response.text();
}
