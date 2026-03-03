import * as Phaser from 'phaser';
import { DTC } from '../../DTC';

export default class UpperPill extends Phaser.GameObjects.Container {
   private dtc: DTC = new DTC();
   private bg: Phaser.GameObjects.Sprite;
   private score:number = 0;
   private level:number = 0;

   private txtTimer: Phaser.GameObjects.Text;
   private txtLevel: Phaser.GameObjects.Text;
   private txtScore: Phaser.GameObjects.Text;
   private countdownText: Phaser.GameObjects.Text | null = null;
   private timeLeft: number;
   private totalTime: number;
   private timerEvent!: Phaser.Time.TimerEvent;
   private isRunning: boolean = false;
   
   constructor(scene: Phaser.Scene, x: number, y: number, level:number) {
      super(scene, x, y);
      
      this.level = level;

      scene.add.existing(this); // Add the empty container to the scene

      this.bg = scene.add.sprite(0, 0, 'pill').setOrigin(0.5, 0.5).setAlpha(0.3);
      this.add(this.bg);

      const durationSeconds = 300;  // TODO: take it from level manifest

      this.totalTime = durationSeconds;
      this.timeLeft = durationSeconds;

      this.txtTimer = scene.add.text(170, 0, '', {
            fontSize: '34px',
            color: '#ff0000', // Red for urgency
            fontStyle: 'bold',
            fontFamily: this.dtc.strFontFamily,
            stroke: '#000000',
            strokeThickness: 4
        })
        .setOrigin(0.0, 0.5)
        .setVisible(true); 
        this.add(this.txtTimer);

      let strLevel:string = 'Level ' + this.level;
      this.txtLevel = scene.add.text(-250, 0, strLevel, {
         fontSize: '34px',
         color: '#cec7c7', 
         fontStyle: 'bold',
         fontFamily: this.dtc.strFontFamily,
         stroke: '#000000',
         strokeThickness: 4
        })
        .setOrigin(0.0, 0.5)
        .setVisible(true); 
      this.add(this.txtLevel);
 
      this.txtScore = scene.add.text(0, 0, '000', {
         fontSize: '48px',
         color: '#ffffff', 
         fontStyle: 'bold',
         fontFamily: this.dtc.strFontFamily,
         stroke: '#000000',
         strokeThickness: 4,
         shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 2, fill: true }
        })
        .setOrigin(0.5, 0.5)
        .setVisible(true); 
      this.add(this.txtScore);
      
      this.startTimer();
   }

  
   public addScore(additionalScore: number): void {
      this.score += additionalScore;
      this.txtScore.setText(this.score.toString().padStart(3, '0'));

      // 1. Background Pulse (Large and fast)
      this.scene.tweens.add({
         targets: this.bg,
         scaleY: 2.0,          // Grow 20%
         alpha: 0.8,          // Temporarily make it more visible
         duration: 200,
         yoyo: true,          // Shrink back
         ease: 'Sine.easeOut',
         onComplete: () => {
               this.bg.setAlpha(0.3); // Return to original ghost alpha
         }
      });

      // 2. Score Text Pulse (Slightly slower for "pop")
      this.scene.tweens.add({
         targets: this.txtScore,
         scale: 1.5,          // Pop the numbers out
         duration: 250,
         yoyo: true,          // Snap back
         ease: 'Back.easeOut' // Adds a little spring to the snap back
      });
   }

   public startTimer() {
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

   public stopTimer(): void {
      if (this.timerEvent) {
         this.timerEvent.remove();
      }
      this.isRunning = false;
      
      if (this.countdownText) 
         this.countdownText.destroy();
   }

   private onTick() {
      if (this.timeLeft > 0) {
         this.timeLeft--;
         this.updateTimerText();
      } else {
         // Time is up!
         this.stopTimer();
         // Emit an event so the Scene knows the game is over
         this.emit('time-over');
      }
    }

   private updateTimerText() {
      const minutes = Math.floor(this.timeLeft / 60);
      const seconds = this.timeLeft % 60;
      const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      
      this.txtTimer.setText(formatted);

      // Optional: Visual Panic Mode
      if (this.timeLeft <= 10) {
         this.txtTimer.setColor('#ff0000'); // Red
         // Pulse effect
         this.scene.tweens.add({
               targets: this,
               scale: 1.2,
               duration: 100,
               yoyo: true
         });
      } else {
         this.txtTimer.setColor('#ffffff'); // White
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