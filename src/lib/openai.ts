import OpenAI from 'openai';
import dotenv from 'dotenv';
import path from 'path';

// Load .env explicitly for extra reliability on some systems
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function getOpenAIClient(): OpenAI {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        throw new Error('OPENAI_API_KEY is not set. Please check your .env file.');
    }
    return new OpenAI({ apiKey });
}

export async function analyzeBounty(
    title: string,
    description: string,
    languages: string[]
): Promise<{
    difficulty: string;
    estimatedHours: number;
    skills: string[];
    summary: string;
}> {
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a developer bounty analyst. Analyze the given issue and provide:
1. difficulty: EASY, MEDIUM, HARD, or EXPERT
2. estimatedHours: realistic hours to complete
3. skills: required skills array
4. summary: brief actionable summary

Respond in JSON format only.`,
            },
            {
                role: 'user',
                content: `Title: ${title}\nDescription: ${description}\nLanguages: ${languages.join(', ')}`,
            },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

export async function generateHints(
    title: string,
    description: string,
    repoUrl: string,
    repoContext?: { readme: string, fileTree: string }
): Promise<string> {
    const openai = getOpenAIClient();

    const systemPrompt = `You are an elite, senior software architect specializing in technical bounties and open-source contributions.
Your task is to provide a meticulously detailed, highly actionable, and precise step-by-step guide to solve the given issue.
You have access to the repository's file tree and README. Analyze the architecture based on the file tree to determine precisely WHICH files need to be modified.

Provide practical, code-level hints:
1. Exact files that likely need changes (reference the actual file tree paths from the provided File Tree context).
2. The specific architectural approach to solve the issue.
3. Concrete code snippet suggestions matching the project's language and framework.
4. Potential edge cases or pitfalls.

Do NOT give generic advice. Use the provided File Tree to anchor your suggestions to real files. Be concise but highly technical.`;

    let userPrompt = `Title: ${title}\nDescription: ${description}\nRepo URL: ${repoUrl}\n`;
    
    if (repoContext) {
        userPrompt += `\n--- REPOSITORY CONTEXT ---\n`;
        userPrompt += `[FILE TREE (Max 800 items)]\n${repoContext.fileTree}\n\n`;
        userPrompt += `[README SUMMARY]\n${repoContext.readme}\n`;
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
    });

    return response.choices[0].message.content || '';
}
