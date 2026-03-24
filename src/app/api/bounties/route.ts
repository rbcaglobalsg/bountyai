import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const language = searchParams.get('language') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 30;

    const where: any = {
        status: 'OPEN',
    };

    if (search) {
        where.title = {
            contains: search,
            mode: 'insensitive',
        };
    }

    if (language && language !== 'All') {
        where.languages = {
            has: language,
        };
    }

    const [bounties, total] = await Promise.all([
        prisma.bounty.findMany({
            where,
            orderBy: { postedAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.bounty.count({ where }),
    ]);

    return NextResponse.json({
        bounties,
        total,
        page,
        totalPages: Math.ceil(total / limit),
    });
}
