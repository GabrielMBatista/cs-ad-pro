
export type AppView = 'generator' | 'analyzer' | 'editor' | 'catalog' | 'history';

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ColorStyle {
  id: string;
  name: string;
  colors: string[];
}

export interface TextOverlay {
  id: string;
  text: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  fontFamily: string;
  fontWeight: string;
  textAlign: 'left' | 'center' | 'right';
  rotation?: number;
}

export interface WeaponTransform {
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

/**
 * CS:GO API Data Structures
 */
export interface CSGOSkin {
  id: string;
  name: string;
  description?: string;
  weapon: {
    id: string;
    name: string;
  };
  rarity: {
    id: string;
    name: string;
    color: string;
  };
  image: string;
}

export interface Campaign {
  id: string;
  createdAt: number;
  skin?: CSGOSkin;
  prompt: string;
  imageUrl: string;
  overlays: TextOverlay[];
  status: 'draft' | 'final';
}
