export type WeaponType = 'the_neutralizer' | 'peace_maker' | 'sniper_plasma' | 'dart';

export interface WeaponData {
    id: WeaponType;
    name: string;
    texture: string;
    
    // OFFSETS
    handYOffset: number;     // Vertical shift of the HERO SPRITE to align hand to center
    gunOffsetX: number;      // Horizontal shift of the GUN from center
    gunOffsetY: number;      // Vertical shift of the LASER/BULLET from center (Gun Pinpoint)

    // STATS
    bulletSpeed: number;
    fireRate: number;
    bulletTexture: string;

    bulletSound:string
}

export const WEAPON_MANIFEST: Record<WeaponType, WeaponData> = {
    the_neutralizer: {
        id: 'the_neutralizer',
        name: "The Neutralizer",
        texture: 'gun-01',
        handYOffset: 40,     
        gunOffsetX: -120,    
        gunOffsetY: -7,      
        bulletSpeed: 800,
        fireRate: 400,
        bulletTexture: 'bullet-small',
        bulletSound: 'bullet'
    },
    peace_maker: {
        id: 'peace_maker',
        name: "The Peacemaker",
        texture: 'gun-02',
        handYOffset: 35,     
        gunOffsetX: -130,
        gunOffsetY: -12,     
        bulletSpeed: 400,
        fireRate: 800,
        bulletTexture: 'bullet-large',
        bulletSound: 'bullet'
    },
    sniper_plasma: {
        id: 'sniper_plasma',
        name: "Sniper Plazma",
        texture: 'gun-03',
        handYOffset: 35,     
        gunOffsetX: -130,
        gunOffsetY: -12,     
        bulletSpeed: 600,
        fireRate: 800,
        bulletTexture: 'bullet-small',
        bulletSound: 'bullet'
    },
    dart: {
        id: 'dart',
        name: "Dart",
        texture: 'gun-04',
        handYOffset: 35,     
        gunOffsetX: -130,
        gunOffsetY: -12,     
        bulletSpeed: 500,
        fireRate: 800,
        bulletTexture: 'bullet-dart',
        bulletSound: 'bullet'
    }

};