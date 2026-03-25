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
    "statusSummary": "최신 깃허브 활동 및 데이터베이스 통계를 바탕으로 한 현재 경쟁 상태 요약 (한국어)",
    "isRecommended": boolean,
    "competitorGapAnalysis": "기존 시도자들의 실패 원인이나 부족한 점 분석 (한국어). 만약 없다면 '최초 선점 기회' 강조.",
    "winningStrategy": "리워드 획득을 위한 필승 전략. 타인보다 우월한 코드를 짜기 위한 팁 (한국어)."
  },
  "filesToModify": ["수정해야 할 파일 경로/목록"],
  "architectureApproach": "핵심 아키텍처 수정 방안 (한국어).",
  "stepByStepGuide": [
    {
      "title": "설정 및 준비: Fork & Clone",
      "description": "코드를 로컬 기기로 가져오는 방법. 정확한 git clone 명령어를 포함하세요.",
      "command": "git clone <repo_url> && cd <repo_name>"
    },
    {
      "title": "핵심 로직 수정: [파일명]",
      "description": "수행해야 할 정확한 코드 수정 내역 설명 (한국어).",
      "codeSnippet": "// 붙여넣기만 하면 되는 최종 완성 코드"
    },
    {
      "title": "제출 및 보상 수령: Pull Request",
      "description": "작업물을 제출하고 리워드를 받기 위한 최종 단계. 'Closes #ID' 문구를 반드시 포함하여 자동 지급을 승인받으세요.",
      "command": "git add . && git commit -m 'Fix: [Summary]' && git push origin main"
    }
  ]
}

IMPORTANT: You MUST respond in Korean (한국어) as the user is a Korean Elite subscriber.
All descriptions, titles, and summaries MUST be in clear, professional Korean.

IMPORTANT REWARD SUCCESS RULES:
- 당신은 단순한 개발자가 아니라 '리워드 설계사'입니다. 사용자가 반드시 돈을 벌 수 있도록 안내하는 것이 유일한 목표입니다.
- 가장 핵심적인 5-7개 단계로 요약하여 성공 경로를 제시하세요.
- MANDATORY STEP 1: 정확한 \`git clone\` 명령어를 제공하세요.
- MANDATORY FINAL STEP: 정확한 \`git push\` 명령어와 Pull Request 시 필요한 본문 텍스트(예: 'Closes #ID')를 명시하세요.
- 솔루션은 '완성형'이어야 합니다. 엣지 케이스를 생략하지 마세요.
- 사용자가 깃허브가 처음이라고 가정하고, 가장 직관적이고 따라 하기 쉬운 길로 안내하세요.
- 말투는 격려하되 매우 기술적이고 정교해야 합니다.`
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
