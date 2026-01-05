import { BirdType } from './BirdConfig';
import { ItemType } from './ItemConfig'; // <--- Import your type
import { WeaponType } from './WeaponConfig';

export interface LevelPhase {
    startTime: number;       // Seconds when this phase begins
    spawnInterval: number;   // How often items fall (ms)
    allowedItemsEvil: ItemType[]; 
    allowedItemsLove: ItemType[];
    evilRatio: number;       // 0.0 = All Potion, 1.0 = All Damage
    allowedBirds: BirdType[];
}

export interface LevelData {
    id: number;
    title: string;
    duration: number;        // Total seconds (e.g., 180s = 3 mins)
    backgroundKey: string;   // Optional: Change BG per level
    weapons: WeaponType[]; 
    phases: LevelPhase[];
}

export const LEVEL_MANIFEST: LevelData[] = [
    {
        id: 1,
        title: "Level 1: First Date",
        duration: 180, // 3 Minutes
        backgroundKey: 'bg_city',
        weapons: ['the_neutralizer', 'dart'],
        phases: [
            // PHASE 1: WARM UP (0s - 60s)
            // Just flowerpots and potions. Slow pace.
            { 
                startTime: 0, 
                spawnInterval: 3000, 
                allowedItemsEvil: ['flowerpot'], 
                allowedItemsLove: ['potion_small', 'potion_slow'], 
                evilRatio: 0.5,
                allowedBirds: ['stork', 'seagull']
            },
            // PHASE 2: REALITY SETS IN (45s - 120s)
            // Microwaves enter. Faster.
            { 
                startTime: 60, 
                spawnInterval: 2500, 
                allowedItemsEvil: ['flowerpot', 'microwave'], 
                allowedItemsLove: ['potion_small', 'potion_slow', 'potion_large'], 
                evilRatio: 0.4,
                allowedBirds: ['stork', 'seagull'] 
            },
            // PHASE 3: PANIC MODE (120s - End)
            // Safes enter. Fast pace.
            { 
                startTime: 120, 
                spawnInterval: 2000, 
                allowedItemsEvil: ['flowerpot', 'microwave', 'safe'], 
                allowedItemsLove: ['potion_small', 'potion_slow', 'potion_large'], 
                evilRatio: 0.3,
                allowedBirds: ['stork', 'seagull'] 
            }
        ]
    }
    // You can add Level 2, Level 3 here later...
];