import { WeaponData } from "../types/WeaponConfig";

// Bullet.ts
export default class Bullet extends Phaser.Physics.Arcade.Sprite {
    private weaponData!: WeaponData;

    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene, x, y, 'bullet'); // Default texture
    }

    fire(x: number, y: number, direction: number, weaponData: WeaponData) {
        this.weaponData = weaponData;

        this.setActive(true);
        this.setVisible(true);
        this.enableBody(true, x, y, true, true);    // 1. WAKE UP & RESET
        this.setScale(1);   // CRITICAL: Reset scale to "Big" (100%) so it starts fresh every time

        // 2. PHYSICS & TEXTURE
        this.setTexture(weaponData.bulletTexture);
        this.setVelocityX(weaponData.bulletSpeed * direction); 
        this.setGravityY(0);
        //this.setFlipX(direction < 0);

        // 3. THE SHRINK ANIMATION (Perspective Effect)
        // Shrink to 50% size over 200ms
        this.scene.tweens.add({
            targets: this,
            scaleX: 0.5,
            scaleY: 0.5,
            duration: 350,   // Fast shrink
            ease: 'Linear',  // Steady shrink
        });
    }

    override preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Automatic Cleanup: If bullet goes off screen, kill it
        if (this.x > this.scene.scale.width + 50 || this.x < -50) {
            this.setActive(false);
            this.setVisible(false);
        }
    }

    public setBulletTexture(texture: string) {
        this.setTexture(texture);
        const body = this.body as Phaser.Physics.Arcade.Body;
        
        if (texture === 'bullet-large') {
            // Special logic for the Big Round Bullet
            // Set a circle based on the NEW width
            const radius = this.width * 0.5; 
            body.setCircle(radius);
            
            // Ensure it centers properly (sometimes setCircle needs a nudge)
            // body.setOffset(0, 0); 
        } else {
            // For normal rectangular bullets
            body.setSize(this.width, this.height);
        }
    }

    public getWeaponData(): WeaponData {
        return this.weaponData;
    }
}