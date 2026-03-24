import * as Phaser from 'phaser';
import { ItemType, ITEM_MANIFEST, ItemData, MovementStyle } from '../types/ItemConfig';
import { WeaponData } from '../types/WeaponConfig';
import Bullet from './Bullet';
import { AudioManager } from '../managers/AudioManager';

export class FallingItemOld extends Phaser.GameObjects.Container {
    private audioManager!: AudioManager;
    public itemData: ItemData;
    public isConsumed: boolean = false; 
    public movementStyle: MovementStyle;
    public nature: 'EVIL' | 'LOVE';

    // Visual Components
    private itemSprite: Phaser.GameObjects.Sprite;
    private balloonSprite?: Phaser.GameObjects.Sprite;
    private isBalloonActive: boolean = false;

    // Animation & Logic Props
    private scaleNormal: number = 1.0;
    private scaleEnlarge: number = 4.0;
    private yStart: number = 0;

    constructor(scene: Phaser.Scene, x: number, y: number, type: ItemType, audioManager: AudioManager) {
        super(scene, x, y);
        
        this.audioManager = audioManager;

        this.itemData = ITEM_MANIFEST[type];
        this.yStart = y; // Keep for sound intensity logic
        
        // Derive properties
        this.movementStyle = this.itemData.movementStyle;
        this.nature = this.itemData.effectValue >= 0 ? 'LOVE' : 'EVIL';

        scene.add.existing(this);
        scene.physics.add.existing(this);
       
        this.itemSprite = scene.add.sprite(0, 0, 'objects-atlas', this.itemData.textureFrameNo)
        .setOrigin(0.5, this.itemData.originY)
        .setScale(this.itemData.scale);
        this.add(this.itemSprite);

        // Setup Balloon (If config says so)
        if (this.movementStyle === 'balloon_float' && this.itemData.balloonTexture) {
            this.setupBalloon(this.itemData.balloonTexture);
        }


        // 3. Configure Physics Body Size
        this.setupPhysics();
        
    }

    private setupBalloon(texture: string): void {
        this.isBalloonActive = true;

        // Calculate Position: Place balloon above the item
        // (Item is at 0,0. Balloon sits on top of Item height/2)
        const yOffset = -(this.itemSprite.height / 2) - 30; // -30 for string/connector gap

        this.balloonSprite = this.scene.add.sprite(0, yOffset, texture);
        this.add(this.balloonSprite);

        // Add a gentle sway animation for floating items
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

        body.syncBounds = true;

        const width = this.itemSprite.width;
        const height = this.itemSprite.height;

        if (this.isBalloonActive && this.balloonSprite) {
            // CASE: BALLOON ACTIVE
            const balloonHeight = this.balloonSprite.height;
            const totalHeight = height + balloonHeight + 10;
            
            // Container (0,0) is the center of the itemSprite.
            // We need to shift the physics offset UP to cover the balloon.
            const offsetY = -(height / 2) - balloonHeight;

            body.setSize(width, totalHeight);
            body.setOffset(-width / 2, offsetY);
        } else {
       
          // Get the actual width/height based on the Atlas Frame, not the original PNG
            const width = this.itemSprite.displayWidth; 
            const height = this.itemSprite.displayHeight;

            console.log('width = ' + width + ', height = ' + height);

            // Use a tighter hitbox (e.g., 60% of height) to ignore potential padding
            const hitWidth = width * 0.7;
            const hitHeight = height * 0.6; // Smaller factor to ignore the "empty" bottom

            body.setSize(hitWidth, hitHeight);
            body.setOffset(-hitWidth / 2, -hitHeight / 2);

            body.center.x = 0;
            body.center.y = 0;
            console.log(body);
          
        }
    }

    public startFalling() {
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.reset(this.x, this.y);

        this.scene.tweens.add({
            targets: this, // Scale the Container
            scale: this.scaleEnlarge,
            duration: 200, 
            yoyo: true,             
            ease: 'Sine.easeInOut', 
            
            onComplete: () => {
                if (!this.active) return;
                
                this.setupPhysics();

                // 5. The "Hang Time"
                this.scene.time.delayedCall(400, () => {
                    // Safety check
                    if (!this.active) return;
                    
                    const body = this.body as Phaser.Physics.Arcade.Body;

                    if (this.movementStyle === 'balloon_float') {
                        // FLOAT BEHAVIOR
                        body.setVelocityY(this.itemData.speed); // Usually slow
                        body.setAllowGravity(false);            // Don't accelerate
                    } else {
                        // FALL BEHAVIOR
                        body.setVelocityY(this.itemData.speed);
                        body.setAccelerationY(500);             // Gravity ON
                    }
                    
                    // Spin Logic (Only spin item if NOT on a balloon)
                    if (this.itemData.rotationSpeed && !this.isBalloonActive) {
                        this.scene.tweens.add({
                            targets: this.itemSprite, // Spin only the child sprite
                            angle: 360,
                            duration: 2000, 
                            repeat: -1
                        });
                    }
                });
            }
        });
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
        const separationY = this.y - (this.itemSprite.height * 0.4);

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

    public popBalloon(): void {
        if (!this.isBalloonActive || !this.balloonSprite) return;

        this.audioManager.playSFX('balloon-pop');

        // 1. Visual Pop
        this.isBalloonActive = false;
        this.balloonSprite.destroy();
        this.balloonSprite = undefined;
        // Play Pop Sound (Ensure key 'balloon_pop' exists in preload)
        // this.scene.sound.play('balloon_pop'); 

        // 2. Physics Update (Now it falls like a stone)
        this.setupPhysics(); // Resizes hitbox to small item only
        
        const body = this.body as Phaser.Physics.Arcade.Body;
        body.setAllowGravity(true);
        body.setAccelerationY(500); // Gravity kicks in
        body.setVelocityY(300);     // Initial downward push

        // 3. Logic Update
        this.movementStyle = 'fall_straight';
        
        // Stop the floating sway
        this.scene.tweens.killTweensOf(this);
    }

    public stopSpinning(): number {
        // 1. Stop the internal spin tween on the sprite
        this.scene.tweens.killTweensOf(this.itemSprite);
        
        // 2. Return the current visual angle so the Scene can snap it
        return this.itemSprite.angle;
    }

    private playRicochet(): void {
        // this.scene.sound.play('ricochet'); 
        this.scene.tweens.add({
            targets: this.itemSprite,
            x: 5,
            duration: 50,
            yoyo: true,
            repeat: 3
        });
    }

    public getYStart(): number {
        return this.yStart;
    }

    public getIsBaloonActive(): boolean {
        return this.isBalloonActive;
    }
}