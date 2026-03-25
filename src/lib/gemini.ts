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
    repoContext?: { readme: string, fileTree: string, issueComments?: string },
    dbCompetitors: number = 0,
    dbPrCount: number = 0,
    lang: string = 'ko',
    modelName: string = 'gemini-3.1-pro-preview'
): Promise<string> {
    const isEn = lang === 'en';
    const genAI = getGeminiClient();
    // Use the model explicitly requested by the user/system (Default: Gemini 3.1 Pro)
    const model = genAI.getGenerativeModel({ 
        model: modelName,
        systemInstruction: `You are an elite, senior software architect specializing in technical bounties and open-source contributions.
Your task is to provide a meticulously detailed, highly actionable, and precise step-by-step guide to solve the given issue.
You have access to the repository's file tree, README, and the latest issue comments.

IMPORTANT: You MUST respond purely in valid JSON matching the following schema. Do NOT include markdown blocks like \`\`\`json.
{
  "competition": {
    "statusSummary": "Brief summary of active competition in ${isEn ? 'English' : 'Korean'}",
    "isRecommended": boolean,
    "competitorGapAnalysis": "Analysis in ${isEn ? 'English' : 'Korean'}",
    "winningStrategy": "Strategy in ${isEn ? 'English' : 'Korean'}"
  },
  "filesToModify": ["files"],
  "architectureApproach": "Approach in ${isEn ? 'English' : 'Korean'}",
  "stepByStepGuide": [
    {
      "title": "${isEn ? 'Title in English' : 'Title in Korean'}",
      "description": "Description in ${isEn ? 'English' : 'Korean'}",
      "command": "git command (optional)",
      "codeSnippet": "exact code to copy-paste (optional, strongly encouraged!!!)"
    }
  ]
}

IMPORTANT: You MUST respond in ${isEn ? 'English' : 'Korean (한국어) - All text must be in clear, professional Korean.'}.

IMPORTANT REWARD SUCCESS RULES:
- You are a REWARD ARCHITECT. Your goal is to get the user PAID purely by copy-pasting.
- Explain in extremely simple language so even a complete beginner who doesn't know GitHub can just follow and get the reward.
- Format the 5-7 most critical steps in ${isEn ? 'English' : 'Korean'}.
- MANDATORY: Make sure EVERY single step from \`git clone\`, making changes, testing, to \`git push\` is provided flawlessly.
- MANDATORY: Do NOT just describe the solution. Write the EXACT full code to replace or insert in 'codeSnippet'.
- MANDATORY STEP 1: Provide the exact \`git clone\` command.
- MANDATORY FINAL STEP: Provide the exact \`git push\` command and PR template.
- Use extremely simple, non-preachy language. Assume the user is a complete beginner.`
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
            responseMimeType: "application/json",
            temperature: 0.2,       // Highly deterministic for faster generation
            maxOutputTokens: 8192
        }
    });
    return result.response.text();
}
