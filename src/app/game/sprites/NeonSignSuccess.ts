// objects/NeonSign.ts
import * as Phaser from 'phaser';
import { AudioManager } from '../managers/AudioManager';
import { DTC } from 'src/app/DTC';

export class NeonSignSuccess extends Phaser.GameObjects.Container {
   private letters: Phaser.GameObjects.Sprite[] = [];
   private flickers: Phaser.Time.TimerEvent[] = [];
   private audioManager!: AudioManager;
   private dtc:DTC = new DTC();
   private humSound!: Phaser.Sound.BaseSound;

   private letterPositions: { x: number; y: number }[] = [
      {x:-250, y:-145},     // G
      {x: -90, y:-145},     // A
      {x:  90, y:-145},     // M
      {x: 250, y:-145},     // E
      {x:-250, y:106},      // O
      {x: -90, y:106},      // V
      {x:  90, y:106},      // E
      {x: 250, y:106},      // R      
    ] 

    constructor(scene: Phaser.Scene, x: number, y: number, audioManager: AudioManager) {
      super(scene, x, y);
      scene.add.existing(this);
      
      this.audioManager = audioManager;
      this.buildSign();
      
      // 3. START AUDIO WITH DELAY
        // We wait 500ms to give AudioManager time to load settings from storage.
        this.scene.time.delayedCall(500, () => {
            this.initAudioAndFlicker();
        });
    }

    private buildSign() {
      this.audioManager.playSFX('neon-humming-strong');

      const wire = this.scene.add.image(0, 0, 'wires-short').setOrigin(0.5, 0.5);
      this.add(wire) 
      
      for(let idxLetter:number = 0; idxLetter < 8; idxLetter++) {
         const xLetter:number = this.letterPositions[idxLetter].x;
         const yLetter:number = this.letterPositions[idxLetter].y;

         const letterSprite = this.scene.add.sprite(
               xLetter, 
               yLetter, 
               'neon-letters-game-over-atlas', idxLetter
            );

         letterSprite.setBlendMode(Phaser.BlendModes.ADD).setScale(1.0);
         this.add(letterSprite);
         this.letters.push(letterSprite);
      }
    }

    private initAudioAndFlicker() {
        // 1. Setup Volumes
        const masterVol = this.audioManager.getValues().sfx; 
        const humVol = masterVol * 0.4; // Hum starts prominent

        // 2. Start Hum (Silent initially)
        this.humSound = this.scene.sound.add('neon-humming-strong', { 
            loop: true,
            volume: 0 
        });
        this.humSound.play();

        // --- THE CINEMATIC TIMELINE ---
        this.scene.tweens.chain({
            targets: this.humSound,
            tweens: [
                // STEP A: Fade Hum IN (The "Star" moment)
                {
                    volume: humVol,
                    duration: 1000,
                    ease: 'Linear'
                },
                // STEP B: Hold it for 2 seconds (Establish the mood)
                {
                    volume: humVol,
                    duration: 2000
                },
                // STEP C: Fade Hum OUT (Make room for music)
                {
                    volume: 0, // Or 0.05 if you want a tiny background texture
                    duration: 2000,
                    onStart: () => {
                        // START MUSIC while hum is fading out
                        // (Assuming you have a 'menu_theme' key)
                        const variations = ['game-over'];
                        this.audioManager.playMusicPlaylist(variations, 120000); // Swap every 2 mins
                    },
                    onComplete: () => {
                        // Stop the hum loop to save CPU/Memory
                        this.humSound.stop();
                    }
                }
            ]
        });

        // 3. Start Visuals (Keep visuals running!)
        this.startVisualFlickerLoop();
        
        // 4. Broken Bulb Events (Keep the sparks!)
        // Sparks are high-pitched, so they sound cool over music.
        this.scene.time.addEvent({
            delay: 3000,
            loop: true,
            callback: () => {
               if(Phaser.Math.Between(1,3) === 1) { // Reduced freq slightly
                  this.triggerBrokenEffect();
               }
            }
        });
    }

    private startVisualFlickerLoop() {
        // Only modulate Alpha (Visuals), NOT Volume
        this.scene.tweens.add({
            targets: this.letters,
            alpha: { from: 0.9, to: 1.0 },
            duration: 100,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

   private triggerBrokenEffect() {
      if (this.letters.length === 0) return;

      // Clean selection syntax
      const candidates = [this.letters[1], this.letters[7]];
      const victim = Phaser.Math.RND.pick(candidates);

      // SAFETY: Stop any previous flicker on this specific letter immediately
      // This ensures the alpha doesn't jump weirdly if it gets picked twice in a row
      this.scene.tweens.killTweensOf(victim);

      const strSuffixBuzz:string = this.dtc.doubleDigit(Phaser.Math.Between(1, 2));
      this.audioManager.playSFX('neon-buzz-'+ strSuffixBuzz);

      this.scene.tweens.chain({
         targets: victim,
         tweens: [
               // Step 1: Turn off
               { alpha: 0.1, duration: 50 },
               // Step 2: Rapid Strobe
               { alpha: 1, duration: 20, yoyo: true, repeat: 5 },
               // Step 3: Dead bulb (Dim)
               { alpha: 0.2, duration: 400 + Math.random() * 300 },
               // Step 4: Back to full power
               { alpha: 1, duration: 100 }
         ]
      });
   }
}