import OpenAI from 'openai';

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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
    repoUrl: string
): Promise<string> {
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {
                role: 'system',
                content: `You are a senior developer helping solve a bounty issue. 
Provide practical hints:
1. Which files likely need changes
2. Approach to solve the issue
3. Code snippet suggestion
4. Potential pitfalls

Be concise and actionable.`,
            },
            {
                role: 'user',
                content: `Title: ${title}\nDescription: ${description}\nRepo: ${repoUrl}`,
            },
        ],
        temperature: 0.5,
    });

    return response.choices[0].message.content || '';
}
