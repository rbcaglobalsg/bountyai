import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { skills, minBounty, maxHours, plan } = await request.json();

    // Admin can update their own plan (Dev/Test Mode)
    const updateData: any = {
        skills,
        minBounty,
        maxHours,
    };

    if ((session?.user as any).role === 'ADMIN' && plan) {
        updateData.plan = plan;
    }

    const user = await prisma.user.update({
        where: { email: session.user.email! },
        data: updateData,
    });

    return NextResponse.json({ success: true, user });
}

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        select: {
            skills: true,
            minBounty: true,
            maxHours: true,
            plan: true,
            role: true,
        },
    });

    return NextResponse.json(user);
}
