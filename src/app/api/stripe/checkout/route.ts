import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { stripe } from '@/lib/stripe';
import { Plan } from '@/types';

const PRICE_IDS: Record<string, string> = {
    PRO: process.env.STRIPE_PRO_PRICE_ID || 'price_placeholder_pro',
    ELITE: process.env.STRIPE_ELITE_PRICE_ID || 'price_placeholder_elite',
};

export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tier } = await request.json();

    if (!PRICE_IDS[tier]) {
        return NextResponse.json({ error: 'Invalid tier' }, { status: 400 });
    }

    try {
        const checkoutSession = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer_email: session.user.email,
            line_items: [
                {
                    price: PRICE_IDS[tier],
                    quantity: 1,
                },
            ],
            success_url: `${process.env.NEXTAUTH_URL}/profile?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/profile?canceled=true`,
            metadata: {
                userId: session.user.id,
                tier: tier,
            },
        });

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error: any) {
        console.error('Stripe checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
