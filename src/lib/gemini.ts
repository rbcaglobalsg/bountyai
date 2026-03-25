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
    dbPrCount: number = 0
): Promise<string> {
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
    "statusSummary": "Brief summary of active competition (e.g. '2 users attempted, 1 open PR') Based on database metrics and comments.",
    "isRecommended": boolean,
    "competitorGapAnalysis": "Analyze why existing attempts might be stuck or failed (e.g. 'Previous PR failed CI', 'User only asked a question'). If Fresh, say 'First-mover advantage'.",
    "winningStrategy": "How to beat the competition (e.g. 'Submit a fix for the edge case they missed', 'Fix the linting errors in the existing PR')."
  },
  "filesToModify": ["path/to/file.py"],
  "architectureApproach": "1-2 sentences explaining the core architectural fix.",
  "stepByStepGuide": [
    {
      "title": "FOOLPROOF SETUP: Fork & Clone",
      "description": "How to get the code onto your machine. Must include the exact git clone command.",
      "command": "git clone <repo_url> && cd <repo_name>"
    },
    {
      "title": "CONSOLIDATED FIX: [File Name]",
      "description": "A comprehensive explanation of the exact code change required.",
      "codeSnippet": "// The absolute, final code to paste"
    },
    {
      "title": "FINISH & GET PAID: Submit PR",
      "description": "How to submit your work correctly so the maintainers accept it. Include 'Closes #XX' to ensure auto-payment.",
      "command": "git add . && git commit -m 'Fix: [Summary]' && git push origin main"
    }
  ]
}

IMPORTANT REWARD SUCCESS RULES:
- You are NOT just a coder; you are a REWARD ARCHITECT. Your goal is to maximize the user's chance of getting paid.
- MANDATORY STEP 1: Always provide the exact `git clone` command for the repository URL.
- MANDATORY FINAL STEP: Provide the exact `git push` command AND the precise text for the Pull Request description (e.g., 'This PR addresses the issue by... Closes #123').
- If the repository has a specific contribution guide (CONTRIBUTING.md) mentioned in the README, incorporate those rules into the steps.
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
