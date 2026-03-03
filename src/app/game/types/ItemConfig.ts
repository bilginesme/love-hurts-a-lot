import { WeaponType } from "./WeaponConfig";

export type ItemType = 'none' |'safe' | 'microwave' | 'flowerpot' | 'potion_small' | 'potion_large' | 'potion_slow';
export type MovementStyle = 'fall_straight' | 'balloon_float' | 'parachute';

export interface ItemData {
    textureFrameNo: number;
    effectValue: number; // Negative = Damage, Positive = Heal
    speed: number;       // How fast it falls
    rotationSpeed: number; // Optional: Does it spin?
    originY:number;
    scale:number;
    isPotion:boolean;
    soundHitFloor: string;      // Sound when it hits floor
    soundHitCouple: string;      // Sound when it hits
    movementStyle: MovementStyle;
    balloonTexture?: string;
    vulnerableTo: WeaponType[];
}

export const ITEM_MANIFEST: Record<ItemType, ItemData> = {
    none: { 
        textureFrameNo: 0,
        originY: 0.5,
        scale: 0.3,
        isPotion: false,
        effectValue: 0, 
        speed: 0,
        rotationSpeed: 0, // Spins while falling
        soundHitFloor: 'none',
        soundHitCouple: 'none',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    safe: { 
        textureFrameNo: 5, 
        originY: 0.3,
        scale: 0.4,
        isPotion: false,
        effectValue: -15, 
        speed: 700,
        rotationSpeed: 2, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    microwave: { 
        textureFrameNo: 4, 
        originY: 0.3,
        scale: 0.4,
        isPotion: false,
        effectValue: -10, 
        speed: 500,
        rotationSpeed: 2, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    flowerpot: { 
        textureFrameNo: 0, 
        originY: 0.5,
        scale: 0.6,
        isPotion: false,
        effectValue: -5, 
        speed: 350,
        rotationSpeed: 0,
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-evil',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_small: { 
        textureFrameNo: 2, 
        originY: 0.3,
        scale: 0.45,
        isPotion: true,
        effectValue: 10, 
        rotationSpeed: 2, // Spins while falling
        speed: 10,
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-love',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_large: { 
        textureFrameNo: 3, 
        originY: 0.3,
        scale: 0.40,
        isPotion: true,
        effectValue: 20, 
        speed: 150,
        rotationSpeed: 1, // Spins while falling
        soundHitFloor: 'hit-ground-01',
        soundHitCouple: 'hit-couple-love',
        movementStyle: 'fall_straight',
        vulnerableTo: []
    },
    potion_slow: { 
        textureFrameNo: 1, 
        originY: 0.3,
        scale: 0.45,
        isPotion: true,
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