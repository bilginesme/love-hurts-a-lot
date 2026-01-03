import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class ButtonPause extends Phaser.GameObjects.Sprite {
    private theScene: GameScene;

    constructor(scene: GameScene, texture: string, x: number, y: number) {
        super(scene, x, y, texture);
        this.theScene = scene;
        this.theScene.add.existing(this).setInteractive();

        this.setOrigin(0.5, 0.5); 
        this.setScale(1);

        this.on(Phaser.Input.Events.POINTER_DOWN, this.handlePointerDown, this);
        this.on(Phaser.Input.Events.POINTER_UP, this.handlePointerUp, this);
    }
 
    public override update(time: number, delta: number): void {
    }

    private handlePointerDown(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        this.setTint(0x00ff00); 

         this.scene.tweens.add({
            targets: this,
            scale: 1.8,             // Grow 40% bigger
            duration: 150,          // Fast expansion (150ms)
            yoyo: true,             // Shrink back to 1.0 (150ms)
            ease: 'Sine.easeInOut', // Smooth scaling
            
            // This function runs when the grow/shrink is FINISHED
            onComplete: () => {
                this.clearTint(); 
                this.theScene.pauseGame();
            }
        });
    }
    
    private handlePointerUp(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
        
    }
}