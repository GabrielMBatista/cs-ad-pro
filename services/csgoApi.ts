
import { CSGOSkin } from '../types';

const BASE_URL = 'https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en';
let skinsCache: CSGOSkin[] | null = null;

export async function getSkins(): Promise<CSGOSkin[]> {
  if (skinsCache) return skinsCache;
  try {
    const res = await fetch(`${BASE_URL}/skins.json`);
    if (!res.ok) throw new Error('Failed to fetch skins catalog');
    const data = await res.json();
    skinsCache = data as CSGOSkin[];
    return skinsCache;
  } catch (error) {
    console.error('CS:GO API Error:', error);
    return [];
  }
}

export async function searchSkins(query: string): Promise<CSGOSkin[]> {
  const skins = await getSkins();
  if (!query.trim()) return skins.slice(0, 50);
  const q = query.toLowerCase();
  return skins.filter(skin => 
    skin.name.toLowerCase().includes(q) || 
    skin.weapon.name.toLowerCase().includes(q)
  ).slice(0, 50);
}

/**
 * Automatically finds the best official skin match based on a prompt string.
 */
export async function findBestMatch(prompt: string): Promise<CSGOSkin | null> {
  const skins = await getSkins();
  const p = prompt.toLowerCase();
  
  // High precision match (Weapon | Skin)
  const exactMatch = skins.find(s => p.includes(s.name.toLowerCase()));
  if (exactMatch) return exactMatch;

  // Keyword match
  const keywordMatch = skins.find(s => {
    const nameParts = s.name.toLowerCase().split(' | ');
    return nameParts.some(part => p.includes(part));
  });

  return keywordMatch || null;
}
