import * as Phaser from 'phaser';
import { ItemType, ITEM_MANIFEST, ItemData, MovementStyle } from '../types/ItemConfig';
import { AudioManager } from '../managers/AudioManager';
import Bullet from './Bullet';

// We now extend the Physics Sprite directly
export class FallingItem extends Phaser.Physics.Arcade.Sprite {
    private audioManager!: AudioManager;
    public itemData: ItemData;
    public isConsumed: boolean = false; 
    public movementStyle: MovementStyle;
    public nature: 'EVIL' | 'LOVE';

    // Since we are no longer a container, the balloon must be a separate sprite
    private balloonSprite?: Phaser.GameObjects.Sprite;
    private isBalloonActive: boolean = false;

    private yStart: number = 0;
    private scaleEnlarge: number = 4.0;

    constructor(scene: Phaser.Scene, x: number, y: number, type: ItemType, audioManager: AudioManager) {
        // 1. Initialize Sprite with Atlas and Frame
        const data = ITEM_MANIFEST[type];
        super(scene, x, y, 'objects-atlas', data.textureFrameNo);
        
        this.itemData = data;
        this.audioManager = audioManager;
        this.yStart = y;
        this.movementStyle = this.itemData.movementStyle;
        this.nature = this.itemData.effectValue >= 0 ? 'LOVE' : 'EVIL';

        // 2. Add to Scene and Physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // 3. Basic Visual Setup
        this.setOrigin(0.5, this.itemData.originY);
        this.setScale(this.itemData.scale);

        if (this.movementStyle === 'balloon_float' && this.itemData.balloonTexture) {
            this.setupBalloon(this.itemData.balloonTexture);
        }

        this.setupPhysics();
    }

    private setupBalloon(texture: string): void {
        this.isBalloonActive = true;
        
        // The balloon is now a "loose" sprite that we must manually sync in update()
        this.balloonSprite = this.scene.add.sprite(this.x, this.y - 60, texture);
        
        // Gentle sway (Apply to the item itself, balloon follows in preUpdate)
        this.scene.tweens.add({
            targets: this,
            x: this.x + 15,
            duration: 2000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    private setupPhysics(): void {
        const body = this.body as Phaser.Physics.Arcade.Body;
        if (!body) return;

        // In Sprite-land, size is straightforward
        const hitWidth = this.displayWidth * 0.7;
        const hitHeight = this.displayHeight * 0.6;

        body.setSize(hitWidth, hitHeight);
        
        // Center the body on the sprite's origin
        // Offset is relative to the top-left of the unscaled texture
        body.setOffset(
            (this.width / 2) - (hitWidth / 2 / this.scaleX),
            (this.height * this.originY) - (hitHeight / 2 / this.scaleY)
        );
    }

    // Crucial: Because we aren't a container, we must manually move the balloon
    protected override preUpdate(time: number, delta: number): void {
        // 1. Run the base Sprite logic (crucial for animations and physics sync)
        super.preUpdate(time, delta);
        
        // 2. Sync Balloon Position (now that the Sprite has moved this frame)
        if (this.isBalloonActive && this.balloonSprite) {
            this.balloonSprite.x = this.x;
            // Calculation: Top of the sprite minus a small gap
            this.balloonSprite.y = this.y - (this.displayHeight * this.originY) - 30;
        }

        // 3. Auto-cleanup for performance
        if (this.y > this.scene.scale.height + 100) {
            this.destroy();
        }
    }

    public startFalling() {
        // Initial "Spawn" Pop animation
        this.scene.tweens.add({
            targets: this,
            scale: this.itemData.scale * 1.5,
            duration: 200, 
            yoyo: true,             
            ease: 'Sine.easeInOut', 
            onComplete: () => {
                if (!this.active) return;
                
                this.scene.time.delayedCall(400, () => {
                    if (!this.active) return;
                    const body = this.body as Phaser.Physics.Arcade.Body;

                    if (this.isBalloonActive) {
                        body.setVelocityY(this.itemData.speed);
                        body.setAllowGravity(false);
                    } else {
                        body.setVelocityY(this.itemData.speed);
                        body.setAccelerationY(500); 
                    }
                    
                    if (this.itemData.rotationSpeed && !this.isBalloonActive) {
                        body.setAngularVelocity(100); // Physics-based rotation is better than tweens
                    }
                });
            }
        });
    }

    public popBalloon(): void {
        if (!this.isBalloonActive || !this.balloonSprite) return;
        this.audioManager.playSFX('balloon-pop');

        this.isBalloonActive = false;
        this.balloonSprite.destroy();
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setAccelerationY(800);
        body.setVelocityY(200);
        body.setAngularVelocity(Phaser.Math.Between(-200, 200)); // Start tumbling
    }

        public stopSpinning(): number {
        // 1. Stop the internal spin tween on the sprite
        this.scene.tweens.killTweensOf(this);
        
        // 2. Return the current visual angle so the Scene can snap it
        return this.angle;
    }

    public checkHitCoordinates(bullet: Bullet): boolean {
        const isVulnerable:boolean = this.itemData.vulnerableTo.includes(bullet.getWeaponData().id);

        if(!isVulnerable)
            return false;

        // If it's a normal falling item (no balloon), decide vulnerability
        if (!this.isBalloonActive) {
            this.playRicochet(); 
            return false; // Safes/Microwaves are armored!
        }

        // Check: Did we hit the Balloon or the Item?
        // Define the "Neck" Y-position between item and balloon
        const separationY = this.y - (this.height * 0.4);

        if (bullet.y < separationY) {
            // Bullet is ABOVE separation -> HITS BALLOON
            this.popBalloon();
            return true; // Hit registered, destroy bullet
        } else {
            // Bullet is BELOW separation -> HITS METAL ITEM
            this.playRicochet();
            return false; // Hit failed, destroy bullet, item survives
        }
    }

    private playRicochet(): void {
        // this.scene.sound.play('ricochet'); 
        this.scene.tweens.add({
            targets: this,
            x: 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    // Add the override keyword here
    public override destroy(fromScene?: boolean) {
        if (this.balloonSprite) {
            this.balloonSprite.destroy();
            this.balloonSprite = undefined; // Clean up reference
        }
        super.destroy(fromScene);
    }
    
    public getYStart(): number {
        return this.yStart;
    }

    public getIsBaloonActive(): boolean {
        return this.isBalloonActive;
    }
}