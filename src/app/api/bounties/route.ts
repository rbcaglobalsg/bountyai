import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Plan } from '@/types';

export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const userPlan = (session?.user?.plan as Plan) || Plan.FREE;

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const language = searchParams.get('language') || '';
    const page = parseInt(searchParams.get('page') || '1');
    
    // FREE users are limited to 5 bounties total (no pagination for them)
    const limit = userPlan === Plan.FREE ? 5 : 30;
    
    // Adjust skip/take for FREE tier
    const skip = userPlan === Plan.FREE ? 0 : (page - 1) * limit;
    const take = limit;

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
            skip,
            take,
        }),
        prisma.bounty.count({ where }),
    ]);

    // Get user skills for matching if Pro/Elite
    const user = session?.user as any;
    const userSkills = user?.skills || [];
    const userMinBounty = user?.minBounty || 0;
    const userMaxHours = user?.maxHours || 10;

    // Mask sensitive data and calculate Match Score for Pro/Elite
    const processedBounties = bounties.map((bounty) => {
        let matchScore = undefined;
        
        if (userPlan !== Plan.FREE) {
            // Simple dynamic matching logic (syncing with matcher.ts logic)
            let score = 0;
            const matchedSkills = userSkills.filter((s: string) => 
                bounty.languages.some((l: string) => l.toLowerCase() === s.toLowerCase())
            );
            
            // 1. Skill Match (max 40)
            score += Math.min((matchedSkills.length / Math.max(bounty.languages.length, 1)) * 40, 40);
            
            // 2. Amount Match (max 20)
            if ((bounty.amount / 100) >= userMinBounty) score += 20;
            
            // 3. Difficulty/Time Match (max 20)
            if (bounty.estimatedHours && bounty.estimatedHours <= userMaxHours) score += 20;
            
            // 4. Competitors Match (max 20)
            if (bounty.competitors <= 2) score += 20;
            else if (bounty.competitors <= 5) score += 10;

            matchScore = Math.round(score);
        }

        return {
            ...bounty,
            matchScore,
            // AI Hints are ONLY for ELITE
            aiAnalysis: userPlan === Plan.ELITE ? (bounty as any).aiAnalysis : null,
            // Match score/Difficulty/EstimatedHours/Activity are for PRO/ELITE
            difficulty: userPlan !== Plan.FREE ? bounty.difficulty : null,
            estimatedHours: userPlan !== Plan.FREE ? bounty.estimatedHours : null,
            linkedPrCount: userPlan !== Plan.FREE ? (bounty as any).linkedPrCount : 0,
            lastActivityAt: userPlan !== Plan.FREE ? (bounty as any).lastActivityAt : null,
        };
    });

    return NextResponse.json({
        bounties: processedBounties,
        total: userPlan === Plan.FREE ? Math.min(total, 5) : total,
        page,
        totalPages: userPlan === Plan.FREE ? 1 : Math.ceil(total / limit),
        userPlan,
    });
}
