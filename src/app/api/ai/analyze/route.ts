import { NextRequest, NextResponse } from 'next/server';
import { analyzeBounty } from '@/lib/openai';

export async function POST(request: NextRequest) {
    try {
        const { title, description, languages } = await request.json();

        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: 'OpenAI API key not configured' },
                { status: 500 }
            );
        }

        const analysis = await analyzeBounty(title, description, languages);

        return NextResponse.json(analysis);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
