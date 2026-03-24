import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { matchBountyToUsers } from '@/lib/matcher';
import { resend } from '@/lib/resend';
import { Plan } from '@/types';

// 이 API는 Vercel Cron이나 외부 스케줄러에 의해 호출됨
export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');
    if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 1. 최근 24시간 내에 추가된 활성 바운티 가져오기
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const newBounties = await prisma.bounty.findMany({
            where: {
                createdAt: { gte: last24h },
                status: 'OPEN',
            },
        });

        if (newBounties.length === 0) {
            return NextResponse.json({ message: 'No new bounties to alert' });
        }

        // 2. Pro/Elite 유저들 가져오기
        const premiumUsers = await prisma.user.findMany({
            where: {
                plan: { in: [Plan.PRO, Plan.ELITE] },
                alertEmail: true,
            },
        });

        let emailsSent = 0;

        for (const user of premiumUsers) {
            const userMatches = [];
            
            for (const bounty of newBounties) {
                // matcher.ts의 로직을 사용하여 점수 계산
                // (여기서는 간단하게 직접 계산하거나 matcher를 호출)
                const results = await matchBountyToUsers(bounty.id);
                const userResult = results.find(r => r.userId === user.id);
                
                if (userResult && userResult.score >= 70) {
                    userMatches.push({
                        title: bounty.title,
                        amount: bounty.amount / 100,
                        score: userResult.score,
                        url: bounty.url,
                    });
                }
            }

            if (userMatches.length > 0) {
                // 3. 이메일 발송
                await sendMatchEmail(user.email, user.name || 'Developer', userMatches);
                emailsSent++;
            }
        }

        return NextResponse.json({ success: true, emailsSent });
    } catch (error: any) {
        console.error('Match alert cron failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

async function sendMatchEmail(email: string, name: string, matches: any[]) {
    const matchItemsHtml = matches.map(m => `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e2e8f0; rounded: 8px;">
            <h3 style="margin: 0 0 10px 0;">${m.title}</h3>
            <p style="margin: 0; color: #10b981; font-weight: bold;">Reward: $${m.amount}</p>
            <p style="margin: 5px 0; color: #3b82f6;">Match Score: ${m.score}%</p>
            <a href="${process.env.NEXTAUTH_URL}/bounties" style="display: inline-block; margin-top: 10px; padding: 8px 16px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px;">View Bounty</a>
        </div>
    `).join('');

    await resend.emails.send({
        from: 'BountyAI <alerts@bountyai.com>',
        to: email,
        subject: `🎯 ${matches.length} New High-Match Bounties Found!`,
        html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1>Hello, ${name}!</h1>
                <p>We found some new bounties that perfectly match your skills.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
                ${matchItemsHtml}
                <p style="color: #666; font-size: 12px; margin-top: 30px;">
                    You are receiving this because you are a Pro/Elite subscriber of BountyAI.
                    <a href="${process.env.NEXTAUTH_URL}/profile">Manage notification settings</a>
                </p>
            </div>
        `,
    });
}
