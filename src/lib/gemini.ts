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
    lang: string = 'ko'
): Promise<string> {
    const isEn = lang === 'en';
    const genAI = getGeminiClient();
    // Use gemini-1.5-flash for its massive context window capability and high generation speed
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
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
      "command": "git command"
    }
  ]
}

IMPORTANT: You MUST respond in ${isEn ? 'English' : 'Korean (한국어) - All text must be in clear, professional Korean.'}.

IMPORTANT REWARD SUCCESS RULES:
- You are a REWARD ARCHITECT. Your goal is to get the user PAID.
- Format the 5-7 most critical steps in ${isEn ? 'English' : 'Korean'}.
- MANDATORY STEP 1: Provide the exact \`git clone\` command.
- MANDATORY FINAL STEP: Provide the exact \`git push\` command and PR text.
- Use extremely simple, non-preachy language. Assume the user is smart but BRAND NEW to GitHub.`
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
