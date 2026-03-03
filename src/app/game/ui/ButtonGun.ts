import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class ButtonGun extends Phaser.GameObjects.Sprite {
    private theScene: GameScene;

    constructor(scene: GameScene, texture: string, x: number, y: number) {
        super(scene, x, y, texture);
        this.theScene = scene;
        this.theScene.add.existing(this).setInteractive();

        this.setOrigin(0.5, 0.5); 
        this.setScale(1.0);
        this.setAlpha(0.8);

        this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        this.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
        this.on(Phaser.Input.Events.POINTER_OUT, this.handlePointerUp, this);
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        this.setTint(0xffff00); 

        this.scene.tweens.add({
            targets: this,
            scale: 1.2,             // Grow 40% bigger
            duration: 150,          // Fast expansion (150ms)
            yoyo: true,             // Shrink back to 1.0 (150ms)
            ease: 'Sine.easeInOut', // Smooth scaling
            
            // This function runs when the grow/shrink is FINISHED
            onComplete: () => {
                this.clearTint(); 
                this.emit('fire-gun'); 
            }
        });
    }
 
    private handlePointerUp(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        this.clearTint(); 
        this.setScale(1);
        //this.theScene.events.emit(GUN_EVENTS.GUN_SHOT, 'ok');
    }
}