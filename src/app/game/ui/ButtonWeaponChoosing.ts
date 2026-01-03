import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { WeaponData } from '../types/WeaponConfig';

// 1. Extend Container, not Sprite
export class ButtonWeaponChoosing extends Phaser.GameObjects.Container {
    private theScene: GameScene;
    private bgSprite: Phaser.GameObjects.Sprite; // The green button background
    private bulletIcon: Phaser.GameObjects.Image; // The weapon icon

    constructor(scene: GameScene, texture: string, x: number, y: number) {
        super(scene, x, y);
        this.theScene = scene;
        scene.add.existing(this); // Add container to scene

        // 2. Create the Background Sprite
        // Add it to 'this' (the container), not the scene
        this.bgSprite = scene.add.sprite(0, 0, texture); 
        this.bgSprite.setInteractive(); // Interaction goes on the sprite
        this.add(this.bgSprite);

        // 3. Create the Bullet Icon
        // Position is (0,0) because it's relative to the container center
        this.bulletIcon = scene.add.image(0, 0, '');
        this.bulletIcon.setScale(1);
        this.bulletIcon.setAlpha(1);
        this.bulletIcon.setOrigin(0.5, 0.5);
        this.bulletIcon.flipX = true;

        this.add(this.bulletIcon); // Add to container

        // Initialize
        this.changeBulletImage();

        // 4. Input Listeners (On the background sprite)
        this.bgSprite.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        this.bgSprite.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
        this.bgSprite.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerUp, this);
    }
     
    private handlePointerDown(): void {
        this.bgSprite.setTint(0xffff00); 

        this.scene.tweens.add({
            targets: this,          // SCALE THE WHOLE CONTAINER
            scale: 1.2,             // Now the icon scales with the button!
            duration: 150,          
            yoyo: true,             
            ease: 'Sine.easeInOut', 
            onComplete: () => {
                this.bgSprite.clearTint(); 
                this.emit('choose-next-weapon'); 
                
                // OPTIONAL: Immediate feedback
                // If your Scene updates logic instantly, you can update visuals here too
                // this.changeBulletImage(); 
            }
        });
    }
    
    private handlePointerUp(): void {
        this.bgSprite.clearTint(); 
        // We don't need setScale(1) because the tween yoyo handles it, 
        // but if you want to be safe:
        this.setScale(1); 
    }

    // MAKE THIS PUBLIC so the Scene can call it
    public changeBulletImage(): void {
        const weapon: WeaponData = this.theScene.getCurrentWeapon();

        this.bulletIcon.setTexture(weapon.bulletTexture);
        
        const wMax:number = 100;
        let w:number = this.bulletIcon.texture.getSourceImage().width;
        let scaleFix:number = wMax / w;

        this.bulletIcon.setScale(scaleFix);

        this.bulletIcon.preFX?.clear();

        // 2. Apply Black & White (Grayscale)
        // The value 1.0 means 100% grayscale. 0.0 means full color.
        this.bulletIcon.preFX!.addColorMatrix().grayscale(1.0);
        
        // Optional: If you want it slightly brighter/darker while B/W
        this.bulletIcon.preFX!.addColorMatrix().brightness(0.8);
    }
}