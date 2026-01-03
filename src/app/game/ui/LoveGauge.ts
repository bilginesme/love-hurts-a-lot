import * as Phaser from 'phaser';
import { DTC } from '../../DTC';

export class LoveGauge extends Phaser.GameObjects.Container {
   private dtc:DTC = new DTC();
   private needle: Phaser.GameObjects.Sprite;
   private readonly MIN_ANGLE = -240; 
   private readonly MAX_ANGLE = 65;
   private currentLoveValue: number = 0;
   
   // State Flags
   private isCritical: boolean = false;
   private isUltraCritical: boolean = false;
   
   // Animation Handlers
   private shakeTween: Phaser.Tweens.Tween | null = null;
   private smokeTimer: Phaser.Time.TimerEvent | null = null;
   
   private posx: number = 0;
   private posy: number = 0;

   constructor(scene: Phaser.Scene, x: number, y: number) {
      super(scene, x, y);
      scene.add.existing(this);

      this.posx = x;
      this.posy = y;

      // 1. BACKGROUND
      const bg = scene.add.sprite(0, 0, 'gauge-back');
      this.add(bg);

      // 2. NEEDLE
      this.needle = scene.add.sprite(0, 0, 'gauge-needle');
      this.needle.setOrigin(0.5, 0.5); 
      this.needle.setAngle(this.MIN_ANGLE); 
      this.add(this.needle);

      // 3. GLASS
      const glass = scene.add.sprite(0, 0, 'gauge-glass');
      glass.setAlpha(0.7); 
      this.add(glass);
   }
    
   public updateValue(deltaValue: number): number {
      this.currentLoveValue += deltaValue;
      
      // Clamp Logic
      if (this.currentLoveValue > 100) this.currentLoveValue = 100;
      if (this.currentLoveValue < 0) this.currentLoveValue = 0;

      // Calculate Angle
      const percentage = this.currentLoveValue / 100; 
      const targetAngle = Phaser.Math.Linear(this.MIN_ANGLE, this.MAX_ANGLE, percentage);

      // Animate Needle
      this.scene.tweens.add({
         targets: this.needle,
         angle: targetAngle,
         duration: 800,
         ease: 'Elastic.easeOut', 
         easeParams: [1.5, 0.5]
      });

      // Update States
      this.checkCriticalState();
      
      return this.currentLoveValue;
   }

   public setValue(theValue:number): void {
      this.currentLoveValue = theValue;
      if(this.currentLoveValue > 100) this.currentLoveValue = 100;
      this.updateValue(0);
   }

   private checkCriticalState() {
      // 1. ULTRA CRITICAL (>= 90)
      if (this.currentLoveValue >= 90) {
         if (!this.isUltraCritical) {
             this.stopCriticalEffects(); // Clear lower level effects first
             this.startUltraCriticalMode();
         }
      } 
      // 2. CRITICAL (>= 80)
      else if (this.currentLoveValue >= 80) {
         if (this.isUltraCritical) {
             this.stopUltraCriticalMode(); // Downgrade
         }
         if (!this.isCritical) {
             this.startCriticalMode();
         }
      } 
      // 3. NORMAL (< 80)
      else {
         this.stopCriticalEffects(); // Stop everything
      }
   }

   // --- SMOKE GENERATOR ---
   // This creates a single puff of smoke that floats up and vanishes
   private spawnParticle(strTexturePrefix: string, numTextureVariations:number, scale: number = 1.0) {
      // Randomize starting position slightly near the center pivot
      const offsetX = Phaser.Math.Between(-5, 5);
      const offsetY = Phaser.Math.Between(-5, 5);

      // Create sprite in the SCENE (not container) so it drifts independently
      // Use this.x/y because those are world coordinates
      const idxSmoke:number = Phaser.Math.Between(1, numTextureVariations);
      const strSmoke:string = strTexturePrefix + '-' + this.dtc.doubleDigit(idxSmoke);
      const puff = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, strSmoke );
      
      puff.setOrigin(0, 0.5);
      puff.setScale(0.1); // Start tiny
      puff.setAlpha(0.8);
      puff.setAngle(Phaser.Math.Between(0, 360)); // Random rotation
      puff.setDepth(this.depth + 1); // On top of the gauge
      puff.setFlipY(Math.random() < 0.5);

      // Animate the Puff
      this.scene.tweens.add({
         targets: puff,
         y: puff.y - 60 - Phaser.Math.Between(0, 20), // Float UP
         x: puff.x + Phaser.Math.Between(-20, 20), // Drift left/right
         scale: scale,      // Grow to target size
         alpha: 0,          // Fade out
         duration: 1500,
         ease: 'Sine.easeOut',
         onComplete: () => {
            puff.destroy(); // Important: Cleanup!
         }
      });
   }

   private spawnBrokenHeart() {
      // Randomize starting position slightly near the center pivot
      const offsetX = Phaser.Math.Between(-5, 5);
      const offsetY = Phaser.Math.Between(-5, 5);

      // Create sprite in the SCENE (not container) so it drifts independently
      // Use this.x/y because those are world coordinates
      const idxSmoke:number = Phaser.Math.Between(1, 3);
      const strSmoke:string = 'broken-heart-' + this.dtc.doubleDigit(idxSmoke);
      const puff = this.scene.add.sprite(this.x + offsetX, this.y + offsetY, strSmoke );
      
      puff.setOrigin(0.5, 0.5);
      puff.setScale(0.2); // Start tiny
      puff.setAlpha(1);
      puff.setAngle(Phaser.Math.Between(-10, 10)); // Random rotation
      puff.setDepth(this.depth + 1); // On top of the gauge

      const scaleFinal:number = 0.5 + Math.random() / 2;

      // Animate the Puff
      this.scene.tweens.add({
         targets: puff,
         y: puff.y + 60 + Phaser.Math.Between(700, 1500), 
         x: puff.x + Phaser.Math.Between(0, 1000), // Drift left/right
         scale: scaleFinal,      // Grow to target size
         alpha: 0,          // Fade out
         duration: 5000,
         ease: 'Sine.easeOut',
         onComplete: () => {
            puff.destroy(); // Important: Cleanup!
         }
      });
   }

   private startCriticalMode(): void {
      this.isCritical = true;
      this.startShake(3); // Mild shake
      
      // Start Smoke Loop: Slow (every 400ms)
      this.startSmokeTimer(800, 1.0);
   }

   private startUltraCriticalMode() {
      this.isUltraCritical = true;
      this.startShake(6); // Violent shake
      
      // Start Smoke Loop: Fast (every 100ms)
      this.startSmokeTimer(400, 1.5); 
   }

   private stopCriticalEffects() {
      this.stopUltraCriticalMode();
      this.stopCriticalMode();
   }

   private stopCriticalMode() {
      this.isCritical = false;
      this.stopShake();
      this.stopSmokeTimer();
   }

   private stopUltraCriticalMode() {
      this.isUltraCritical = false;
      this.stopShake();
      this.stopSmokeTimer();
   }

   private startShake(intensity: number) {
      if (this.shakeTween) this.shakeTween.stop();
      
      this.shakeTween = this.scene.tweens.add({
         targets: this,
         x: `+=${intensity}`, 
         y: `+=${intensity}`,
         duration: 50,
         yoyo: true,
         repeat: -1, 
         ease: 'Sine.easeInOut'
      });
   }

   private stopShake() {
      if (this.shakeTween) {
         this.shakeTween.stop();
         this.shakeTween = null;
         this.x = this.posx; // Reset position
         this.y = this.posy;
      }
   }

   private startSmokeTimer(delay: number, smokeScale: number) {
      // Clear existing timer if any
      this.stopSmokeTimer();

      // Create a looping timer
      this.smokeTimer = this.scene.time.addEvent({
          delay: delay,
          callback: () => this.spawnParticle('smoke', 6, smokeScale),
          loop: true
      });
   }

   private stopSmokeTimer() {
      if (this.smokeTimer) {
          this.smokeTimer.destroy();
          this.smokeTimer = null;
      }
   }

   public getCurrentValue(): number {
      return this.currentLoveValue;
   }

   public spawnParticleLove(): void {
      this.spawnParticle('smoke', 6,1);
      this.spawnParticle('smoke', 6,1.5);  
      this.spawnParticle('smoke', 6,2);
   }

   public spawnParticleEvil(): void {
      this.spawnBrokenHeart();
      this.spawnBrokenHeart();
      this.spawnBrokenHeart();
      this.spawnBrokenHeart();
      this.spawnBrokenHeart();
   }
}