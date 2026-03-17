import { Layer, AspectRatio } from "../types";

export interface ShowcaseItem {
    id: string;
    title: string;
    prompt: string;
    imageUrl: string;
    backgroundImage?: string;
    layers: Layer[];
    aspectRatio?: AspectRatio;
    skin: {
        id: string;
        name: string;
        image: string;
        weapon: {
            id: string;
            name: string;
        };
        rarity?: {
            id: string;
            name: string;
            color: string;
        };
    };
}

export const SHOWCASE_IDEAS: ShowcaseItem[] = [
    {
        id: "d5fb99d5-b59b-4414-aa6f-796486cb37a1",
        title: "AWP | Dragon Lore - Legendary Myth",
        prompt: "Create a Legendary Mythological Fantasy advertisement background for a CS:GO Skin. Scene: Ancient ruins, Floating magical particles, Smoke and embers, Gold treasure room background. Lighting: Golden Hour, Dramatic God Rays, Warm Fire Glow. Mood: Epic, High-Budget Marketing, 8k Resolution, Unreal Engine 5 Render. Composition: Center the view for a product placement (Note: The product will be composited later, leave the center clean/empty or with a podium). Colors: Match the vibe of 'AWP | Dragon Lore'.",
        imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
        backgroundImage: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
        aspectRatio: "9:16",
        skin: {
            id: "awp_dragon_lore",
            name: "Dragon Lore",
            image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
            weapon: { id: "awp", name: "AWP" },
            rarity: { id: "coverit", name: "Covert", color: "#eb4b4b" }
        },
        layers: [
            { id: "l1", type: "text", text: "DRAGON LORE", x: 50, y: 15, zIndex: 100, rotation: 0, scale: 1, opacity: 1, visible: true, locked: false, style: { fontSize: 32, color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", textAlign: "center" } },
            { id: "l2", type: "text", text: "AWP", x: 50, y: 10, zIndex: 101, rotation: 0, scale: 1, opacity: 1, visible: true, locked: false, style: { fontSize: 14, color: "#F97316", fontFamily: "Inter", fontWeight: "900", textAlign: "center" } }
        ]
    },
    {
        id: "a5fd0404-84ce-45a4-adc0-668ba4edc982",
        title: "M4A4 | Bullet Rain - Action Scene",
        prompt: "Create a Cinematic Product Showcase advertisement background for a CS:GO Skin. Scene: Professional gaming setup background with clean lighting and high-tech minimalist elements. Lighting: Blue and white studio lighting with soft highlights. Mood: Modern, Clean, Professional. Colors: Match the vibe of 'M4A4 | Bullet Rain'.",
        imageUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszfjLpAf8i5mY60mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
        backgroundImage: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszfjLpAf8i5mY60mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
        aspectRatio: "9:16",
        skin: {
            id: "m4a4_bullet_rain",
            name: "Bullet Rain",
            image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszfjLpAf8i5mY60mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f",
            weapon: { id: "m4a4", name: "M4A4" },
            rarity: { id: "covert", name: "Covert", color: "#eb4b4b" }
        },
        layers: [
            { id: "l1", type: "text", text: "BULLET RAIN", x: 50, y: 15, zIndex: 100, rotation: 0, scale: 1, opacity: 1, visible: true, locked: false, style: { fontSize: 32, color: "#ffffff", fontFamily: "Oswald", fontWeight: "900", textAlign: "center" } },
            { id: "l2", type: "text", text: "M4A4", x: 50, y: 10, zIndex: 101, rotation: 0, scale: 1, opacity: 1, visible: true, locked: false, style: { fontSize: 14, color: "#F97316", fontFamily: "Inter", fontWeight: "900", textAlign: "center" } }
        ]
    }
];
