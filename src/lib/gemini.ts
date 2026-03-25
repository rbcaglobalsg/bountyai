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
    repoContext?: { readme: string, fileTree: string, issueComments?: string }
): Promise<string> {
    const genAI = getGeminiClient();
    // Use gemini-2.5-flash for its massive context window capability and high generation speed
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash",
        systemInstruction: `You are an elite, senior software architect specializing in technical bounties and open-source contributions.
Your task is to provide a meticulously detailed, highly actionable, and precise step-by-step guide to solve the given issue.
You have access to the repository's file tree, README, and the latest issue comments.

IMPORTANT: You MUST respond purely in valid JSON matching the following schema. Do NOT include markdown blocks like \`\`\`json.
{
  "competition": {
    "statusSummary": "Brief summary of active competition (e.g. '2 users attempted, 1 open PR. High competition.') based on the comments.",
    "isRecommended": boolean // false if a PR is submitted and likely to merge, true if it's still available or early.
  },
  "filesToModify": ["path/to/file.py"],
  "architectureApproach": "1-2 sentences explaining the core architectural fix.",
  "stepByStepGuide": [
    {
      "title": "Contextual title of the step",
      "description": "Thoroughly detailed explanation of what needs to be changed.",
      "codeSnippet": "Code snippet demonstrating the exact change or implementation (optional, but highly recommended)"
    }
  ]
}`
    });

    let userPrompt = `Title: ${title}\nDescription: ${description}\nRepo URL: ${repoUrl}\n`;
    
    if (repoContext) {
        userPrompt += `\n--- REPOSITORY CONTEXT ---\n`;
        userPrompt += `[FILE TREE]\n${repoContext.fileTree}\n\n`;
        userPrompt += `[README SUMMARY]\n${repoContext.readme}\n`;
        if (repoContext.issueComments) {
            userPrompt += `[LATEST ISSUE COMMENTS]\n${repoContext.issueComments}\n`;
        }
    }

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
            responseMimeType: "application/json"
        }
    });
    return result.response.text();
}
