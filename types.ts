
export type AppView = 'generator' | 'analyzer' | 'editor' | 'catalog' | 'history';

export type ImageSize = '1K' | '2K' | '4K';
export type AspectRatio = '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

export interface ColorStyle {
  id: string;
  name: string;
  colors: string[];
}

export type LayerType = 'text' | 'image' | 'sticker';

export interface Layer {
  id: string;
  type: LayerType;
  visible: boolean;
  locked: boolean;

  // Transform
  x: number;
  y: number;
  rotation: number;
  scale: number;
  zIndex: number;
  opacity: number;

  // Content specific
  text?: string;
  src?: string; // For images/stickers

  // Style
  style?: {
    fontFamily?: string;
    fontWeight?: string;
    fontSize?: number;
    color?: string;
    textAlign?: 'left' | 'center' | 'right';
    shadow?: boolean;
  };
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
  createdAt: number; // Stored as BigInt in DB, converted to number in API
  skin?: CSGOSkin;
  prompt: string;
  imageUrl: string;
  layers: Layer[]; // New unified structure
  status: 'draft' | 'final';
}
