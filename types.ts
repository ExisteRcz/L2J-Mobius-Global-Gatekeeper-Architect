
export interface TeleportPoint {
  id: string;
  name: string;
  x: number;
  y: number;
  z: number;
  price: number;
}

export interface TeleportSubCategory {
  id: string;
  name: string;
  points: TeleportPoint[];
}

export interface TeleportCategory {
  id: string;
  name: string;
  subCategories: TeleportSubCategory[];
  points: TeleportPoint[];
}

export interface GKConfig {
  npcId: string;
  npcName: string;
  npcTitle: string;
  categories: TeleportCategory[];
}

export type GenerationType = 'HTML' | 'NPC_XML' | 'TELEPORT_XML' | 'JAVA';
