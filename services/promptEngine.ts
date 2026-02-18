
import { CSGOSkin } from '../types';

interface ThemeRule {
    keywords: string[];
    theme: string;
    lighting: string;
    elements: string[];
}

const THEME_RULES: ThemeRule[] = [
    {
        keywords: ['Asiimov', 'Vulcan', 'Cyrex', 'Mecha', 'Printstream', 'Decimator', 'Neon'],
        theme: 'High-Tech Sci-Fi Future',
        lighting: 'Neon Blue and White, Clean Studio Lighting',
        elements: ['Cyberpunk city bokeh', 'Holographic interface elements', 'Clean white laboratory surfaces']
    },
    {
        keywords: ['Dragon Lore', 'Prince', 'Medusa', 'Atheris', 'Hyper Beast', 'Howl', 'Fire Serpent'],
        theme: 'Legendary Mythological Fantasy',
        lighting: 'Golden Hour, Dramatic God Rays, Warm Fire Glow',
        elements: ['Ancient ruins', 'Floating magical particles', 'Smoke and embers', 'Gold treasure room background']
    },
    {
        keywords: ['Fade', 'Doppler', 'Marble Fade', 'Disco', 'Vaporwave', 'Neon Rider', 'Vice'],
        theme: 'Synthwave Retro 80s',
        lighting: 'Purple and Pink Neon, Laser grids',
        elements: ['Retro grid background', 'Miami sunset smoke', 'Abstract geometric shapes', 'Chrome reflections']
    },
    {
        keywords: ['Rust Coat', 'Safari Mesh', 'Sand Dune', 'Wasteland', 'Hazard', 'Mud-Spec'],
        theme: 'Post-Apocalyptic Gritty',
        lighting: 'Harsh Desert Sun, Rusty Industrial Lights',
        elements: ['Destroyed concrete', 'Desert dust storms', 'Abandoned factory', 'Metal debris']
    },
    {
        keywords: ['Case Hardened', 'Blue Gem', 'Gold Gem'],
        theme: 'Luxury Jewelry Showcase',
        lighting: 'Softbox Jewel Photography, Star Filters',
        elements: ['Black velvet background', 'Diamonds and blue crystals scattering', 'Reflective glass table']
    }
];

const DEFAULT_THEME = {
    theme: 'Cinematic Product Showcase',
    lighting: 'Professional Studio Lighting (Rim Light)',
    elements: ['Dark concrete podium', 'Subtle smoke atmosphere', 'Clean minimal background']
};

export function generatePromptFromSkin(skin: CSGOSkin): string {
    const name = skin.name.toLowerCase();

    // Find matching rule
    const rule = THEME_RULES.find(r => r.keywords.some(k => name.includes(k.toLowerCase()))) || DEFAULT_THEME;

    // Construct Prompt
    return `
    Create a ${rule.theme} advertisement background for a CS:GO Skin.
    Scene: ${rule.elements.join(', ')}.
    Lighting: ${rule.lighting}.
    Mood: Epic, High-Budget Marketing, 8k Resolution, Unreal Engine 5 Render.
    Composition: Center the view for a product placement (Note: The product will be composited later, leave the center clean/empty or with a podium).
    Colors: Match the vibe of '${skin.name}'.
  `.trim().replace(/\s+/g, ' ');
}
