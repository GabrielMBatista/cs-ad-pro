import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';


export async function POST(req: NextRequest) {
    try {
        const campaigns = await req.json();

        if (!Array.isArray(campaigns)) {
            return NextResponse.json({ error: 'Payload must be an array of campaigns' }, { status: 400 });
        }

        if (campaigns.length === 0) {
            return NextResponse.json({ message: 'No campaigns to import', count: 0 });
        }

        // Process campaigns to ensure data integrity
        // We ignore ID conflicts on SQLite by manually checking or using upsert loop
        // createMany is not supported on SQLite in older Prisma versions, but we are using 5.x.
        // However, skipDuplicates is convenient.
        // Let's rely on a loop for better SQLite support and conflict handling if skipDuplicates isn't flawless on SQLite.
        // Actually, for restore, we usually want to overwrite or skip. Let's skip existing IDs.

        let count = 0;

        // Using transaction for atomic import
        await prisma.$transaction(async (tx: any) => { // tx type as any to avoid complex type matching in quick script
            for (const camp of campaigns) {
                // Check if exists
                const existing = await tx.campaign.findUnique({ where: { id: camp.id } });
                if (!existing) {
                    await tx.campaign.create({
                        data: {
                            id: camp.id,
                            createdAt: BigInt(camp.createdAt), // Ensure BigInt conversion
                            prompt: camp.prompt,
                            imageUrl: camp.imageUrl,
                            overlays: camp.overlays, // Already stringified in export? Assume yes.
                            skinJson: camp.skinJson,
                            status: camp.status || 'draft'
                        }
                    });
                    count++;
                }
            }
        });

        return NextResponse.json({ message: 'Import successful', count });

    } catch (error: any) {
        console.error('Import Error:', error);
        return NextResponse.json(
            { error: error.message || 'Error importing campaigns' },
            { status: 500 }
        );
    }
}
