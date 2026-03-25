import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateHints } from '@/lib/gemini';
import { getRepositoryContext } from '@/lib/github';
import { Plan } from '@/types';

export const maxDuration = 60;

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        console.log('[DEBUG ROUTE] OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);
        if (process.env.OPENAI_API_KEY) {
            console.log('[DEBUG ROUTE] Key prefix:', process.env.OPENAI_API_KEY.slice(0, 10));
        }
        const session = await getServerSession(authOptions);
        const userPlan = (session?.user?.plan as Plan) || Plan.FREE;
     
        if (userPlan !== Plan.ELITE) {
            return NextResponse.json(
                { error: 'Elite plan required for AI hints' },
                { status: 403 }
            );
        }

        const { id } = await params;

        const bounty = await prisma.bounty.findUnique({
            where: { id },
        });

        if (!bounty) {
            return NextResponse.json({ error: 'Bounty not found' }, { status: 404 });
        }

        // Check if hints already saved in a submission or if we should generate fresh
        let submission = await prisma.submission.findUnique({
            where: {
                userId_bountyId: {
                    userId: session!.user.id,
                    bountyId: id,
                },
            },
        });

        if (submission?.aiHints) {
            try {
                // If the old cache is Markdown, JSON.parse will throw and it will regenerate.
                const cleaned = submission.aiHints.replace(/```json/gi, '').replace(/```/g, '').trim();
                JSON.parse(cleaned);
                return NextResponse.json({ hints: submission.aiHints });
            } catch (e) {
                console.log('Legacy Markdown hints detected. Forcing regeneration to JSON...');
            }
        }

        // Generate fresh hints
        const repoContext = await getRepositoryContext(bounty.url);
        const hints = await generateHints(bounty.title, bounty.description, bounty.url, repoContext, bounty.competitors, bounty.linkedPrCount);
        
        // Save to submission (upsert)
        await prisma.submission.upsert({
            where: {
                userId_bountyId: {
                    userId: session!.user.id,
                    bountyId: id,
                },
            },
            update: { aiHints: hints },
            create: {
                userId: session!.user.id,
                bountyId: id,
                aiHints: hints,
                status: 'IN_PROGRESS',
            },
        });

        return NextResponse.json({ hints });
    } catch (error: any) {
        console.error('Fatal API Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
