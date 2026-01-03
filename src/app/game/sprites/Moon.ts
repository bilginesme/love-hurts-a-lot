import * as Phaser from 'phaser';

export class Moon extends Phaser.GameObjects.Sprite {
    
    // Total crossing time: 5 Minutes (300,000 ms)
    // We split this into your 3 "legs" to keep the nice arc.
    // Ratio was roughly: 3 : 6 : 13
    private durPrimary: number = 40 * 1000;   // 40 sec rising
    private durSecondary: number = 80 * 1000; // 80 sec high in sky
    private durTertiary: number = 180 * 1000; // 180 sec setting
    
    // Multiplier for testing (set to 0.1 to see it move fast)
    private timeScale: number = 1.0; 

    constructor(scene: Phaser.Scene) {
        super(scene, 0, 0, 'moon');

        scene.add.existing(this);
        
        // 1. SETUP VISUALS
        this.setAlpha(0); // Fade in during the first leg
        this.setScale(0.6);
        this.setScrollFactor(0); 
        this.setDepth(-10); // Behind everything

        // 2. PICK ONE PHASE FOR THE WHOLE GAME
        const randomPhase = Phaser.Math.Between(0, 9);
        this.setFrame(randomPhase);
        
        // Random Rotation for variety
        this.setRotation(Phaser.Math.FloatBetween(-Math.PI / 6, Math.PI / 6));

        // 3. START IMMEDIATELY
        this.startJourney();
    }

    private applyScale(duration: number): number {
        return duration * this.timeScale;
    }

    private startJourney() {
        // Start Position (Bottom Left-ish)
        this.x = 0;
        this.y = 700;
        
        // VISUALS: Start slightly transparent, fully visible as it rises
        this.setAlpha(0.6); 

        // THE ARC
        this.scene.tweens.chain({
            targets: this,
            tweens: [
                // Leg 1: Rising (0 -> 137)
                {
                    x: 137,
                    y: 500,
                    alpha: 1, // Fade to full brightness
                    duration: this.applyScale(this.durPrimary),
                    ease: 'Quad.easeOut' // Slow down as it reaches peak
                },
                // Leg 2: Crossing High (137 -> 700)
                {
                    x: 700,
                    y: 300,
                    duration: this.applyScale(this.durSecondary),
                    ease: 'Linear'
                },
                // Leg 3: Setting (700 -> 1200)
                {
                    x: 1200,
                    y: 100, // Or drop down to y=600 if you want it to set into the horizon
                    alpha: 0.5, // Fade out slightly as it sets
                    duration: this.applyScale(this.durTertiary),
                    ease: 'Quad.easeIn', // Accelerate as it leaves
                    onComplete: () => {
                        // Optional: destroy or just leave it off-screen
                        this.setVisible(false);
                    }
                }
            ]
        });
    }
}