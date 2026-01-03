import { WeaponType } from "./WeaponConfig";

export type ItemType = 'none' |'safe' | 'microwave' | 'flowerpot' | 'potion_small' | 'potion_large' | 'potion_slow';
export type MovementStyle = 'fall_straight' | 'balloon_float' | 'parachute';

export interface ItemData {
    texture: string;
    effectValue: number; // Negative = Damage, Positive = Heal
    speed: number;       // How fast it falls
    rotationSpeed: number; // Optional: Does it spin?
    soundHitFloor: string;      // Sound when it hits floor
    soundHitCouple: string;      // Sound when it hits
    movementStyle: MovementStyle;
    balloonTexture?: string;
    vulnerableTo: WeaponType[];
}

export const ITEM_MANIFEST: Record<ItemType, ItemData> = {
    none: { 
        texture: '', 
        effectValue: 0, 
        speed: 0,
        rotationSpeed: 0, // Spins while falling
        soundHitFloor: 'none',
        soundHitCouple: 'none',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    safe: { 
        texture: 'safe', 
        effectValue: -15, 
        speed: 700,
        rotationSpeed: 2, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    microwave: { 
        texture: 'microwave', 
        effectValue: -10, 
        speed: 500,
        rotationSpeed: 2, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    flowerpot: { 
        texture: 'flowerpot', 
        effectValue: -5, 
        speed: 350,
        rotationSpeed: 0,
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_small: { 
        texture: 'love-potion-red', 
        effectValue: 10, 
        rotationSpeed: 2, // Spins while falling
        speed: 10,
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-love',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_large: { 
        texture: 'love-potion-strong', 
        effectValue: 20, 
        speed: 150,
        rotationSpeed: 1, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-love',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_slow: { 
        texture: 'love-potion-blue', 
        effectValue: 20, 
        speed: 100,
        rotationSpeed: 1, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-love',
        movementStyle: 'balloon_float',
        balloonTexture: 'balloon-yellow',
        vulnerableTo: ['dart']
    }
};