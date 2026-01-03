import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class Apartment extends Phaser.GameObjects.Container {
    private theScene: GameScene;
    private building!: Phaser.GameObjects.Sprite;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);
        this.theScene = scene;
        
        this.building = this.theScene.add.sprite(0, 0, 'apartment');
        this.add(this.building);

        this.building.setOrigin(0, 1.0);
        
        this.theScene.add.existing(this);
    }
 
    public override update(time: number, delta: number): void {
        // Logic to run every frame, e.g., input handling
        // this.handleInput(); 
        
        // Example of playing an animation
        // this.play('idle', true);
    }


}