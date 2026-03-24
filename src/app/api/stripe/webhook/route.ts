import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
    const payload = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    try {
        if (!sig || !endpointSecret) {
            console.error('Missing signature or webhook secret');
            return NextResponse.json({ error: 'Webhook Secret Required' }, { status: 400 });
        }
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.userId;
            const tier = session.metadata?.tier;

            if (userId && tier) {
                await prisma.user.update({
                    where: { id: userId },
                    data: { 
                        plan: tier as any,
                        stripeId: session.customer as string 
                    },
                });
                console.log(`User ${userId} upgraded to ${tier}`);
            }
            break;
        }
        case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            // logic to handle plan changes if needed
            break;
        }
        case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const user = await prisma.user.findFirst({
                where: { stripeId: subscription.customer as string },
            });
            if (user) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { plan: 'FREE' },
                });
                console.log(`User ${user.id} subscription deleted, back to FREE`);
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
}

// NextJS edge runtime doesn't support stripe webhook constructEvent well if not configured
// But usually for standard App Router POST it's fine.
