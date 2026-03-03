import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { WEAPON_MANIFEST, WeaponData, WeaponType } from '../types/WeaponConfig';

export class Hero extends Phaser.GameObjects.Container {
    private theScene: GameScene;
    private normalScaleHero: number = 1.0;
    private touchedScaleHero: number = 1.5;
    private normalScaleGun: number = 0.5;
    public heroSprite: Phaser.GameObjects.Sprite;
    public gunSprite: Phaser.GameObjects.Sprite;
    public laserBeamSprite: Phaser.GameObjects.Sprite;
    public currentWeaponKey: WeaponType = 'the_neutralizer';
    
    // Define the offset: How far is the hand from the center of the ninja image?
    // Based on your previous code, it was 40px down.
    private readonly HAND_Y_OFFSET = 40; 

    constructor(scene: GameScene, texture: string) {
        super(scene, 0, 0); 
        this.theScene = scene;
        this.theScene.add.existing(this);

        // 1. Setup Hero Sprite
        // We shift the Ninja UP (-HAND_Y_OFFSET) so the hand sits at Y=0
        this.heroSprite = new Phaser.GameObjects.Sprite(scene, 0, -this.HAND_Y_OFFSET, texture);
        this.heroSprite.setOrigin(0.5, 0.5);

        this.gunSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, 'gun-01');
        this.gunSprite.setVisible(false);

        this.laserBeamSprite = new Phaser.GameObjects.Sprite(scene, 0, 0, 'laser-beam');
        this.laserBeamSprite.setVisible(false);

        this.updateGunAndLaserBeam();

        // 4. Add to Container
        this.add([this.heroSprite, this.gunSprite, this.laserBeamSprite]);

        // 5. Physics Body Setup
        this.setSize(this.heroSprite.width, this.heroSprite.height);
        scene.physics.world.enable(this);
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        body.setSize(this.heroSprite.width, this.heroSprite.height);
        // Important: Adjust the physics offset to match the visual shift
        // We moved the sprite up, so we need to offset the box to match
        body.setOffset(
            -this.heroSprite.width / 2, 
            -this.heroSprite.height / 2 - this.HAND_Y_OFFSET
        );

        // 6. Interaction
        this.setInteractive({ draggable: true });
        this.setScale(this.normalScaleHero);
        this.setInitialLocation();

        this.on('dragstart', this.handleDragStart, this);
        this.on('drag', this.handleDrag, this);
        this.on('dragend', this.handleDragEnd, this);
    }

    public override update(time: number, delta: number): void {
        // Update logic
    }

    public setInitialLocation(): void {
        this.x = 1100;
        this.y = 2000;
    }

    private handleDragStart(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        this.setScale(this.touchedScaleHero);

        // Calculate inverse scale to keep the laser thin
        const inverseScale = 1 / (1.3 * this.touchedScaleHero);
        this.laserBeamSprite.setScale(inverseScale, inverseScale);
        
        this.laserBeamSprite.setVisible(true);
    }

    private handleDrag(pointer: Phaser.Input.Pointer, dragX: number, dragY: number): void {
        this.x = 1100;

        const minY = 200; 
        const maxY = this.theScene.scale.height - 370; 
        this.y = Phaser.Math.Clamp(dragY, minY, maxY);
    }

    private handleDragEnd(pointer: Phaser.Input.Pointer): void {
        this.setScale(this.normalScaleHero);
        this.laserBeamSprite.setScale(1);
        this.laserBeamSprite.setVisible(false);
    }

    // Since the gun is now at Y=0 local, the gunshot Y is just the Container Y
    public getYPosGunshot(): number {
        let gun:WeaponData = WEAPON_MANIFEST[this.currentWeaponKey];
        return this.y + gun.gunOffsetY; 
    }

    public updateGunAndLaserBeam(): void {
        let gun: WeaponData = WEAPON_MANIFEST[this.currentWeaponKey];

        // 1. UPDATE GUN (Reuse existing sprite)
        this.gunSprite.setTexture(gun.texture);
        this.gunSprite.setOrigin(0.5, 0.5);
        this.gunSprite.setScale(this.normalScaleGun);
        this.gunSprite.setPosition(gun.gunOffsetX, 0); // Update X, keep Y at 0
        this.gunSprite.setVisible(true);

        // 2. UPDATE LASER BEAM (Reuse existing sprite)
        // Do NOT use 'new Phaser.GameObjects.Sprite' here!
        this.laserBeamSprite.setTexture('laser-beam'); // Or gun.laserTexture if you have different beams
        this.laserBeamSprite.setPosition(-100, gun.gunOffsetY); // Update Y offset
        this.laserBeamSprite.setOrigin(1, 0.5);
        this.laserBeamSprite.setAlpha(0.9);
        this.laserBeamSprite.setVisible(false); // Reset visibility
    }

    public changeGun(weaponKey: WeaponType): void {
        this.currentWeaponKey = weaponKey;
        this.updateGunAndLaserBeam();
    }

    public getCurrentWeapon(): WeaponData {
        let gun:WeaponData =WEAPON_MANIFEST[this.currentWeaponKey];
        return gun;
    }

    public selectNextWeapon(allowedWeapons: WeaponType[]): void {
        // Safety check: ensure the list isn't empty
        if (!allowedWeapons || allowedWeapons.length === 0) {
            console.warn("No allowed weapons defined for this level.");
            return;
        }

        // 1. Find where our current weapon is in the ALLOWED list
        const currentIndex = allowedWeapons.indexOf(this.currentWeaponKey);

        let nextIndex: number;

        // 2. Calculate the next index
        if (currentIndex === -1) {
            // Edge Case: The current weapon is NOT in the allowed list.
            // (e.g., Level start, or debug weapon).
            // Action: Switch immediately to the first allowed weapon.
            nextIndex = 0;
        } else {
            // Normal Case: We found the current weapon. Move to the next one.
            // The modulo operator (%) ensures we wrap back to 0 after the last item.
            nextIndex = (currentIndex + 1) % allowedWeapons.length;
        }

        // 3. Get the key and switch
        const nextKey = allowedWeapons[nextIndex];
        
        // Optimization: Don't re-set if it's the same (unless you want to replay equip sound)
        if (nextKey !== this.currentWeaponKey) {
            this.setWeapon(nextKey);
        }
    }

    public setWeapon(key: WeaponType) {
        this.currentWeaponKey = key;
        this.updateGunAndLaserBeam();
    }
}