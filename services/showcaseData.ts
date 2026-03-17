export interface ShowcaseItem {
    id: string;
    title: string;
    prompt: string;
    imageUrl: string;
    skin?: {
        name: string;
        image: string;
    };
}

export const SHOWCASE_IDEAS: ShowcaseItem[] = [
    {
        id: "showcase-1",
        title: "AWP | Dragon Lore - Legendary Myth",
        prompt: "Create a Legendary Mythological Fantasy advertisement background for a CS:GO Skin. Scene: Ancient ruins, Floating magical particles, Smoke and embers, Gold treasure room background. Lighting: Golden Hour, Dramatic God Rays, Warm Fire Glow. Mood: Epic, High-Budget Marketing, 8k Resolution, Unreal Engine 5 Render. Colors: Match the vibe of 'AWP | Dragon Lore'.",
        imageUrl: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=1000",
        skin: {
            name: "AWP | Dragon Lore",
            image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FAR17PLfYQJD_9W7m5a0mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f"
        }
    },
    {
        id: "showcase-2",
        title: "M4A4 | Bullet Rain - Action Scene",
        prompt: "Create a Cinematic Action Product Showcase advertisement background for a CS:GO Skin. Scene: Intense urban firefight, rain hitting the pavement, sparks from ricochets, neon city lights in the background. Lighting: Moody Blue and Red Neon, Flash of Gunfire. Mood: Fast-paced, Gritty, Cyberpunk Action, Photorealistic. Colors: Match the vibe of 'M4A4 | Bullet Rain'.",
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=1000",
        skin: {
            name: "M4A4 | Bullet Rain",
            image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszfjLpAf8i5mY60mvLwOq7c2D9Uv8Am07iS8Nis3A3mqhY6ajunJ9ScdgE6N1iE_lW9le_o0MTu78idm3Vmu3Nx-z-DyG2XfX7V/360fx360f"
        }
    },
    {
        id: "showcase-3",
        title: "Desert Shamagh - Tactical Sand",
        prompt: "Create a Cinematic Product Showcase advertisement background for a CS:GO Skin. Scene: High-tech military lab, desert base at dawn, swirling sand in the air. Lighting: Natural desert sunlight with cool blue interior shadows. Mood: Professional, Stealthy, High-Resolution. Colors: Match the vibe of '★ Hand Wraps | Desert Shamagh'.",
        imageUrl: "https://images.unsplash.com/photo-1506466010722-395aa2bef877?auto=format&fit=crop&q=80&w=1000",
        skin: {
            name: "★ Hand Wraps | Desert Shamagh",
            image: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSs_gFpxs0fTjJ9-966m4-Zkvb7N7PukmpY7cZ9j9bM8Ij8nVn6_xVrZ2HycY-TdlU8ZV-G-lPrwu3v1pTu6JrPynEx7yYjsGwj2B_i/360fx360f"
        }
    }
];
