import * as Phaser from 'phaser';

export class PlayerSprite extends Phaser.GameObjects.Sprite {
    // A reference to the Scene this sprite belongs to, for accessing scene utilities
    private theScene: Phaser.Scene;

    constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
        // 1. Call the base Sprite constructor
        super(scene, x, y, texture, frame);

        this.theScene = scene;

        // 2. Add the Sprite to the Scene's display list
        scene.add.existing(this);

        // 3. Perform specific setup (physics, animations, input)
        this.setOrigin(0.5, 0.5); // Center the origin
        this.setScale(1);        // Set initial scale
    }

    public override update(time: number, delta: number): void {
        // Logic to run every frame, e.g., input handling
        // this.handleInput(); 
        
        // Example of playing an animation
        // this.play('idle', true);
    }
}