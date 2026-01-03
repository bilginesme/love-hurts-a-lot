import * as Phaser from 'phaser';
import { DTC } from '../../DTC';

export default class Clouds extends Phaser.GameObjects.Container {
    private numCloudTypes: number = 121;
    private dtc: DTC = new DTC();
    private readonly numInitialClouds: number = 6;
    private readonly maxNumClouds: number = 9;

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0);
        
        // Best Practice: Define depth inside the class if it's intrinsic to the object
        // this.setDepth(-5); 
        
        scene.add.existing(this); // Add the empty container to the scene

        for (let i: number = 0; i < this.numInitialClouds; i++) {
            this.addCloud(true);
        }

        scene.time.addEvent({
            delay: 15000,
            callback: this.addCloud,
            callbackScope: this,
            loop: true
        });
    }

    private addCloud(isInitial: boolean = false): void { // Default false for safety
        const cloudNo: number = Math.ceil(Math.random() * this.numCloudTypes);
        const strCloudName: string = 'cloud-' + this.dtc.tripleDigit(cloudNo);
        const startY = Phaser.Math.Between(50, 1000);
        const duration = Phaser.Math.Between(55000, 180000);

        let startX = 2500;
        if (isInitial) {
            startX = Phaser.Math.Between(100, 1500);
        }

        // --- THE FIX ---
        // Create the object directly. DO NOT use scene.add.sprite()
        const cloud = new Phaser.GameObjects.Sprite(this.scene, startX, startY, strCloudName);
        
        // Configure it
        const theScale = Phaser.Math.Between(5, 6);
        cloud.setScale(theScale);
        cloud.setOrigin(0.5, 0.5);
        cloud.setAlpha(0.7);
        //cloud.setTint(0xffccff); // Make it bright MAGENTA

        // Add to Container (This is what makes it render!)
        this.add(cloud);

        // Start Tween
        this.scene.tweens.add({
            targets: cloud,
            x: -1000,
            duration: duration,
            ease: 'Linear',
            onComplete: (tween, targets) => {
                const completedCloud = targets[0] as Phaser.GameObjects.Sprite;
                
                // Destroying a child automatically removes it from the Container
                completedCloud.destroy();

                // Check simple count logic
                if (this.list.length < this.maxNumClouds) {
                    this.addCloud(false);
                }
            }
        });
    }
}