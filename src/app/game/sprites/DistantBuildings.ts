import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';

export class DistantBuildings extends Phaser.GameObjects.Container {
    private theScene: GameScene;
    private distantBuildingsBG!: Phaser.GameObjects.Sprite;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);
        this.theScene = scene;
        
        this.distantBuildingsBG = this.theScene.add.sprite(0, 0, 'distant-buildings-bg');
        this.add(this.distantBuildingsBG);

        this.distantBuildingsBG.setOrigin(0, 1.0);
        
        this.theScene.add.existing(this);
    }
 
    public override update(time: number, delta: number): void {
    }

}