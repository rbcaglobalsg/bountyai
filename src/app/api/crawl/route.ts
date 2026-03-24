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
