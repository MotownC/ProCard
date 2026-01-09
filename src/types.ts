export enum CardRarity {
  BASE = 'BASE',
  CHROME = 'CHROME',
  HOLOGRAPHIC = 'HOLOGRAPHIC',
  ONE_OF_ONE = 'ONE_OF_ONE'
}

export interface PlayerDetails {
  name: string;
  team: string;
  position: string;
  number: string;
  sport: string;
  bio: string;
}

export interface ShowcaseCard {
  id: number;
  player: string;
  team: string;
  imageType: string; // e.g., "action" or "portrait"
  rarity: CardRarity;
  gradient: string;
  imageUrl?: string; // Optional URL for custom uploaded images
  backImageUrl?: string; // Optional URL for the back of the card
  order?: number; // Optional order field for manual reordering
}