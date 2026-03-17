
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, 'showcase_items_fixed.json');
const tsPath = path.join(__dirname, 'services', 'showcaseData.ts');

try {
    const data = fs.readFileSync(jsonPath, 'utf8');
    const items = JSON.parse(data);

    // Map items to match the expected TypeScript interfaces exactly
    const mappedItems = items.map(item => {
        const mapped = {
            id: item.id,
            title: item.title,
            prompt: item.prompt,
            imageUrl: item.imageUrl,
            layers: item.layers,
            skin: {
                id: item.skin.id,
                name: item.skin.name,
                description: item.skin.description,
                weapon: {
                    id: item.skin.weapon.id,
                    name: item.skin.weapon.name
                },
                rarity: {
                    id: item.skin.rarity.id,
                    name: item.skin.rarity.name,
                    color: item.skin.rarity.color
                },
                image: item.skin.image
            }
        };

        if (item.backgroundImage) mapped.backgroundImage = item.backgroundImage;
        if (item.aspectRatio) mapped.aspectRatio = item.aspectRatio;

        return mapped;
    });

    const header = `import { Layer, AspectRatio, CSGOSkin } from "../types";

export interface ShowcaseItem {
    id: string;
    title: string;
    prompt: string;
    imageUrl: string;
    backgroundImage?: string;
    layers: Layer[];
    aspectRatio?: AspectRatio;
    skin: CSGOSkin;
}

export const SHOWCASE_IDEAS: ShowcaseItem[] = `;

    const content = header + JSON.stringify(mappedItems, null, 2) + ';\n';

    fs.writeFileSync(tsPath, content);
    console.log('Successfully reconstructed and mapped services/showcaseData.ts');
} catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
}
