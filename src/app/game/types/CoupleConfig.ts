import { MovementStyle } from "./ItemConfig";

export type CoupleType = 'balcony_couple' | 'window_couple';

export interface CouplePosition {
    x: number;
    y: number;
    id: string; // for debugging (e.g. "top_left")
    type: CoupleType; // <--- NEW: Which config to use?
}

export interface CoupleData {
    id: CoupleType;
    textureNormal: string;         
    textureHit: string;         
    textureLove: string;         
    vulnerableTo: MovementStyle; 
    
    // VISUALS
    animIdle: string;
    animHit: string;
    animLove: string;

    // PHYSICS (Optional but recommended)
    physics: {
        widthPct: number;
        heightPct: number;
        offsetYPct: number;
    }
}

export const COUPLE_MANIFEST: Record<CoupleType, CoupleData> = {
    balcony_couple: {
         id: 'balcony_couple',
         textureNormal: 'couple-balcony',
         textureHit: 'couple-balcony-hit',
         textureLove: 'couple-balcony-love',
         // Balcony couples get hit by heavy falling objects
         vulnerableTo: 'fall_straight',
        
         animIdle: 'couple_idle',
         animHit: 'couple_hit',
         animLove: 'couple_love',
        
         physics: { widthPct: 0.6, heightPct: 0.9, offsetYPct: 0.1 }
    },

    window_couple: {
         id: 'window_couple',
         textureNormal: 'couple-window',
         textureHit: 'couple-window-hit',
         textureLove: 'couple-window-love',

         // Window couples only take items delivered by balloons
         vulnerableTo: 'balloon_float', 
         
         animIdle: 'window_idle', // Maybe they just lean out?
         animHit: 'window_hit',
         animLove: 'window_love',
         
         physics: { widthPct: 0.8, heightPct: 0.8, offsetYPct: 0 }
    }
};