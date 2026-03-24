import { prisma } from './prisma';

interface MatchResult {
    userId: string;
    bountyId: string;
    score: number;
    reasons: string[];
}

export async function matchBountyToUsers(
    bountyId: string
): Promise<MatchResult[]> {
    const bounty = await prisma.bounty.findUnique({
        where: { id: bountyId },
    });

    if (!bounty) return [];

    const users = await prisma.user.findMany({
        where: {
            skills: { hasSome: bounty.languages },
            alertEmail: true,
        },
    });

    const results: MatchResult[] = [];

    for (const user of users) {
        let score = 0;
        const reasons: string[] = [];

        // 1. 스킬 매칭 (최대 40점)
        const matchedSkills = user.skills.filter((s: string) =>
            bounty.languages.some(
                (l: string) => l.toLowerCase() === s.toLowerCase()
            )
        );
        const skillScore = Math.min(
            (matchedSkills.length / Math.max(bounty.languages.length, 1)) * 40,
            40
        );
        score += skillScore;
        if (matchedSkills.length > 0) {
            reasons.push(`스킬 일치: ${matchedSkills.join(', ')}`);
        }

        // 2. 금액 매칭 (최대 20점)
        const amountUSD = bounty.amount / 100;
        if (amountUSD >= user.minBounty) {
            score += 20;
            reasons.push(`금액 적합: $${amountUSD}`);
        }

        // 3. 난이도 매칭 (최대 20점)
        // User's maxHours is already used, but let's also give bonus for matching difficulty
        if (bounty.difficulty) {
            const difficultyMap: Record<string, number> = { EASY: 1, MEDIUM: 2, HARD: 3, EXPERT: 4 };
            const bountyDiff = difficultyMap[bounty.difficulty] || 2;
            
            // Assume users with higher skills prefer harder bounties? 
            // For now, just if it's within their time limit
            if (bounty.estimatedHours && bounty.estimatedHours <= user.maxHours) {
                score += 20;
                reasons.push(`소요 시간 적합 (${bounty.estimatedHours}h, 난이도: ${bounty.difficulty})`);
            }
        } else if (bounty.estimatedHours && bounty.estimatedHours <= user.maxHours) {
            score += 15;
            reasons.push(`소요 시간 적합: ${bounty.estimatedHours}시간`);
        }

        // 4. 경쟁 점수 (최대 20점)
        if (bounty.competitors <= 2) {
            score += 20;
            reasons.push('경쟁자 적음');
        } else if (bounty.competitors <= 5) {
            score += 10;
            reasons.push('경쟁자 보통');
        }

        if (score >= 40) {
            results.push({
                userId: user.id,
                bountyId: bounty.id,
                score: Math.round(score),
                reasons,
            });
        }
    }

    // 점수 높은 순 정렬
    return results.sort((a, b) => b.score - a.score);
}
