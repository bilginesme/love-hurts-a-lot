import { WeaponType } from "./WeaponConfig";

export enum BirdNature { EVIL = 1, LOVE = 2 }
export type BirdType = 'stork' | 'seagull' | 'pelican'| 'witch' | 'alien_scout';
export type DropCapability = 'standard' | 'balloon' | 'all';

export interface BirdData {
    id: BirdType;
    nature: BirdNature;
    texture: string;
    animKey: string;     // e.g., 'lovebird_fly'
    frame?: string;     // Optional: Initial frame name (e.g., '01.png')
    speed: number;
    scale: number;
    vulnerableTo: WeaponType[]; 
    capability: DropCapability; // New Property
    hitReaction: 'explode' | 'drop_escape';
    hitSound: string;
    tint?: number;       // Optional color tint (e.g., 0xffdddd)
    
    physics: {
        hitWidthFactor: number;    // % of texture width (0.7)
        hitHeightFactor: number;   // % of texture height (0.35)
        offsetYFactor: number;  // % of texture height for vertical offset (0.35)
    }
}

// 2. THE MANIFEST (The Data)
export const BIRD_MANIFEST: Record<BirdType, BirdData> = {
    stork: {
        id: 'stork',
        nature: BirdNature.EVIL,
        capability: 'standard',
        texture: 'stork_atlas',
        animKey: 'stork_fly',
        frame: '01.png',
        speed: 150,
        scale: 1.0,
        vulnerableTo: ['the_neutralizer', 'peace_maker'], 
        hitReaction: 'explode',
        hitSound: 'squawk',
        physics: {
            hitWidthFactor: 0.7,
            hitHeightFactor: 0.35,
            offsetYFactor: 0.35
        }
    },
    seagull: {
        id: 'seagull',
        nature: BirdNature.LOVE,
        capability: 'standard',
        texture: 'lovebird_atlas',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 100,
        scale: 1.0,
        vulnerableTo: ['the_neutralizer'], 
        hitReaction: 'explode',
        hitSound: 'squawk',
        tint: 0xffdddd,
        physics: {
            hitWidthFactor: 0.7,
            hitHeightFactor: 0.35,
            offsetYFactor: 0.35
        }
    },
    pelican: {
        id: 'pelican',
        nature: BirdNature.LOVE,
        capability: "balloon",
        texture: 'pelican_atlas',
        animKey: 'pelican_fly',
        frame: '01.png',
        speed: 100,
        scale: 0.5,
        vulnerableTo: ['the_neutralizer'], 
        hitReaction: 'explode',
        hitSound: 'squawk',
        tint: 0xffdddd,
        physics: {
            hitWidthFactor: 0.7,
            hitHeightFactor: 0.35,
            offsetYFactor: 0.35
        }
    },
    witch: {
        id: 'witch',
        nature: BirdNature.EVIL,
        capability: 'standard',
        texture: 'witch_ride',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 150,
        scale: 1.0,
        vulnerableTo: ['the_neutralizer', 'peace_maker'], 
        hitReaction: 'drop_escape',
        hitSound: 'magic_poof',
        tint: 0xffdddd,
        
        physics: {
            hitWidthFactor: 0.7,
            hitHeightFactor: 0.35,
            offsetYFactor: 0.35
        }
    },
    alien_scout: {
        id: 'alien_scout',
        nature: BirdNature.EVIL,
        capability: 'standard',
        texture: 'ufo_green',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 200,
        scale: 1.0,
        vulnerableTo: ['peace_maker'], 
        hitReaction: 'explode',
        hitSound: 'scifi_crash',
        tint: 0xffdddd,
        
        physics: {
            hitWidthFactor: 0.7,
            hitHeightFactor: 0.35,
            offsetYFactor: 0.35
        }
    }
};