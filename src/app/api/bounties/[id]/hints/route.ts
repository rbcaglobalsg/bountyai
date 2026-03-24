import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateHints } from '@/lib/openai';
import { Plan } from '@/types';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
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
    // For simplicity, let's look at existing submission or generate new
    let submission = await prisma.submission.findUnique({
        where: {
            userId_bountyId: {
                userId: session!.user.id,
                bountyId: id,
            },
        },
    });

    if (submission?.aiHints) {
        return NextResponse.json({ hints: submission.aiHints });
    }

    // Generate fresh hints
    try {
        const hints = await generateHints(bounty.title, bounty.description, bounty.url);
        
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
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
