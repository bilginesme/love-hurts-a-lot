import { WeaponType } from "./WeaponConfig";

export enum BirdNature { EVIL = 1, LOVE = 2 }
export type BirdType = 'stork' | 'seagull' | 'witch' | 'alien_scout';

export interface BirdData {
    id: BirdType;
    nature: BirdNature;
    texture: string;
    animKey: string;     // e.g., 'lovebird_fly'
    frame?: string;     // Optional: Initial frame name (e.g., '01.png')
    speed: number;
    vulnerableTo: WeaponType[]; 
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
        texture: 'stork_atlas',
        animKey: 'stork_fly',
        frame: '01.png',
        speed: 200,
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
        texture: 'lovebird_atlas',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 250,
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
        texture: 'witch_ride',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 300,
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
        texture: 'ufo_green',
        animKey: 'lovebird_fly',
        frame: '01.png',
        speed: 400,
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