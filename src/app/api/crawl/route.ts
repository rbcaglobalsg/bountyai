import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crawlGitHubBounties } from '@/lib/crawler';

export async function POST() {
    try {
        const startTime = Date.now();
        const bounties = await crawlGitHubBounties();

        let newAdded = 0;

        for (const bounty of bounties) {
            const existing = await prisma.bounty.findUnique({
                where: { url: bounty.url },
            });

            if (!existing) {
                // AI 분석 (난이도, 예상 시간) - Pro/Elite 핵심 데이터
                let aiData: { difficulty: string; estimatedHours: number; skills: string[]; summary: string } = { 
                    difficulty: 'MEDIUM', 
                    estimatedHours: 4, 
                    skills: [], 
                    summary: '' 
                };
                try {
                    const { analyzeBounty } = await import('@/lib/openai');
                    aiData = await analyzeBounty(
                        bounty.title, 
                        bounty.description, 
                        bounty.languages
                    );
                } catch (e) {
                    console.error('AI Analysis failed for bounty:', bounty.title, e);
                }

                await prisma.bounty.create({
                    data: {
                        title: bounty.title,
                        description: bounty.description,
                        url: bounty.url,
                        amount: bounty.amount,
                        source: bounty.source,
                        repoOwner: bounty.repoOwner,
                        repoName: bounty.repoName,
                        issueNumber: bounty.issueNumber,
                        labels: bounty.labels,
                        languages: bounty.languages,
                        postedAt: bounty.postedAt,
                        difficulty: aiData.difficulty as any,
                        estimatedHours: aiData.estimatedHours,
                        aiAnalysis: JSON.stringify(aiData),
                    },
                });
                newAdded++;
            }
        }

        const duration = Date.now() - startTime;

        await prisma.crawlLog.create({
            data: {
                source: 'github',
                totalFound: bounties.length,
                newAdded,
                duration,
            },
        });

        return NextResponse.json({
            success: true,
            totalFound: bounties.length,
            newAdded,
            duration: `${duration}ms`,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

export async function GET() {
    return POST();
}
