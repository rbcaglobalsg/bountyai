import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { crawlAllBounties } from '@/lib/crawler';

export async function POST() {
    try {
        const startTime = Date.now();
        const bounties = await crawlAllBounties();

        let newAdded = 0;

        for (const bounty of bounties) {
            // AI 분석 (난이도, 예상 시간) - New bounties only for efficiency, 
            // but we can reuse existing or re-analyze if needed.
            const existing = await prisma.bounty.findUnique({
                where: { url: bounty.url },
            });

            let difficulty = existing?.difficulty || 'MEDIUM';
            let estimatedHours = existing?.estimatedHours || 4;
            let aiAnalysis = existing?.aiAnalysis || '';

            if (!existing) {
                try {
                    const { analyzeBounty } = await import('@/lib/openai');
                    const aiData = await analyzeBounty(
                        bounty.title, 
                        bounty.description, 
                        bounty.languages
                    );
                    difficulty = aiData.difficulty as any;
                    estimatedHours = aiData.estimatedHours;
                    aiAnalysis = JSON.stringify(aiData);
                } catch (e) {
                    console.error('AI Analysis failed for bounty:', bounty.title, e);
                }
                newAdded++;
            }

            // Upsert bounty with updated status/activity
            await (prisma.bounty as any).upsert({
                where: { url: bounty.url },
                update: {
                    linkedPrCount: bounty.linkedPrCount,
                    lastActivityAt: bounty.lastActivityAt,
                },
                create: {
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
                    difficulty: difficulty as any,
                    estimatedHours,
                    aiAnalysis,
                    linkedPrCount: bounty.linkedPrCount,
                    lastActivityAt: bounty.lastActivityAt,
                },
            });
        }

        const duration = Date.now() - startTime;

        await prisma.crawlLog.create({
            data: {
                source: 'unified',
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
