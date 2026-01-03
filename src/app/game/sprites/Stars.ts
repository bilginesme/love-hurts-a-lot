import * as Phaser from 'phaser';

export class Stars extends Phaser.GameObjects.Image {

    constructor(scene: Phaser.Scene, texture: string, x: number, y: number) {
        super(scene, x, y, texture);
        
        scene.add.existing(this);
        this.setOrigin(0, 0); 
        this.setScale(1);
        
        // 1. Start INVISIBLE (Wait for Moon to rise)
        this.setAlpha(0);

        // 2. Wait 10 Seconds, then start the loop
        scene.time.delayedCall(10000, () => {
            this.startTwinkleLoop();
        });
    }

    private startTwinkleLoop(): void {
        // Safety Check: If scene switched or stars destroyed, stop the loop
        if (!this.scene || !this.active) return;

        // 3. Pick RANDOM values for this specific "breath"
        // Target Alpha: Somewhere between 0.1 (faint) and 0.65 (bright)
        const targetAlpha = Phaser.Math.FloatBetween(0.1, 0.65);
        
        // Duration: Slow and gentle (e.g., 2 to 5 seconds)
        const duration = Phaser.Math.Between(5000, 9000);

        this.scene.tweens.add({
            targets: this,
            alpha: targetAlpha,
            duration: duration,
            ease: 'Sine.easeInOut', // The smoothest "breathing" ease
            onComplete: () => {
                // 4. RECURSION: When done, trigger the next random change
                this.startTwinkleLoop();
            }
        });
    }
}