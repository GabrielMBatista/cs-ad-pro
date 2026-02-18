import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const campaigns = await prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(
            campaigns.map((c) => {
                let overlays = [];
                let skin = undefined;
                try { overlays = JSON.parse(c.overlays); } catch (e) { console.error('Failed to parse overlays for campaign', c.id); }
                try { skin = c.skinJson ? JSON.parse(c.skinJson) : undefined; } catch (e) { console.error('Failed to parse skin for campaign', c.id); }

                return {
                    ...c,
                    createdAt: Number(c.createdAt),
                    overlays,
                    skin,
                };
            })
        );

    } catch (error) {
        console.error('GET /api/campaigns error:', error);
        return NextResponse.json({ error: 'Failed to fetch campaigns' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const campaign = await prisma.campaign.create({
            data: {
                id: body.id,
                createdAt: BigInt(body.createdAt),
                prompt: body.prompt,
                imageUrl: body.imageUrl,
                overlays: JSON.stringify(body.overlays ?? []),
                skinJson: body.skin ? JSON.stringify(body.skin) : null,
                status: body.status ?? 'draft',
            },
        });
        return NextResponse.json({ id: campaign.id }, { status: 201 });
    } catch (error) {
        console.error('POST /api/campaigns error:', error);
        return NextResponse.json({ error: 'Failed to save campaign' }, { status: 500 });
    }
}
