import * as Phaser from 'phaser';
import { DTC } from 'src/app/DTC';

export class GameTimer extends Phaser.GameObjects.Text {
    private countdownText: Phaser.GameObjects.Text | null = null;
    private timeLeft: number;
    private totalTime: number;
    private timerEvent!: Phaser.Time.TimerEvent;
    private isRunning: boolean = false;
    private dtc:DTC = new DTC();

    constructor(scene: Phaser.Scene, x: number, y: number, durationSeconds: number) {
        // 1. Initialize the Text Object
        super(scene, x, y, '00:00', {
            fontSize: '32px',
            color: '#ff0000', // Red for urgency
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        });

        this.setOrigin(0.5, 0); // Center alignment
        this.setScrollFactor(0); // Fix to camera (HUD)
        
        this.totalTime = durationSeconds;
        this.timeLeft = durationSeconds;

        // 2. Add to Scene
        scene.add.existing(this);
        
        // 3. Update the text initially
        this.updateTimerText();
    }

    public start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        
        // Create a looping internal timer
        this.timerEvent = this.scene.time.addEvent({
            delay: 1000, // 1 second
            callback: this.onTick,
            callbackScope: this,
            loop: true
        });
    }

    public stop() {
        if (this.timerEvent) {
            this.timerEvent.remove();
        }
        this.isRunning = false;
        if (this.countdownText) this.countdownText.destroy();
    }

    private onTick() {
        if (this.timeLeft > 0) {
            this.timeLeft--;
            this.updateTimerText();
        } else {
            // Time is up!
            this.stop();
            // Emit an event so the Scene knows the game is over
            this.emit('timeout');
        }
    }
 
    private updateTimerText() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        this.setText(formatted);

        // Optional: Visual Panic Mode
        if (this.timeLeft <= 10) {
            this.setColor('#ff0000'); // Red
            // Pulse effect
            this.scene.tweens.add({
                targets: this,
                scale: 1.2,
                duration: 100,
                yoyo: true
            });
        } else {
            this.setColor('#ffffff'); // White
        }

        // TRIGGER THE FINAL COUNTDOWN (Last 10 seconds)
        if (this.timeLeft <= 10 && this.timeLeft > 0) {
            this.showBigCountdown(this.timeLeft);
        } else if (this.timeLeft <= 0) {
            if (this.countdownText) this.countdownText.destroy();
        }
    }

  
    private showBigCountdown(seconds: number) {
        // 1. Create the text if it doesn't exist
        if (!this.countdownText) {
            this.countdownText = this.scene.add.text(
                this.scene.scale.width / 2, 
                this.scene.scale.height / 2, 
                '', 
                {
                    fontSize: '250px',
                    fontFamily: this.dtc.strFontFamily,
                    fontStyle: 'bold',
                    color: '#ff0000',
                    stroke: '#ffffff',
                    strokeThickness: 6
                }
            ).setOrigin(0.5).setAlpha(0.3).setScrollFactor(0); // 30% Opacity (Ghost Mode)
        }

        // 2. Update the number
        this.countdownText.setText(seconds.toString());

        // 3. Add a "Heartbeat" Tween (Scale Up and Fade Out)
        // This makes it pulse with every second
        this.scene.tweens.add({
            targets: this.countdownText,
            scale: { from: 0.5, to: 1.5 },
            alpha: { from: 0.8, to: 0.0 }, // Fade out completely by the next tick
            duration: 900,
            ease: 'Sine.easeOut'
        });
        
        // 4. Audio Cue (Optional but recommended)
        // this.scene.sound.play('tick_sound');
    }


    // Helper for your Game Logic to check remaining time
    public getRemainingSeconds(): number {
        return this.timeLeft;
    }
}