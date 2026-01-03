import { DTC } from "src/app/DTC";

export default class MenuScene extends Phaser.Scene {
    constructor() {
        super('MenuScene');
    }

    create() {
         this.add.image(0, 0, 'brick-bg').setOrigin(0, 0);

        // 1. Title
        this.add.text(this.scale.width / 2, 100, 'LOVE HURTS A LOT', {
            fontSize: '80px',
            color: '#ff69b4', // Hot pink
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 2. Play Button
        const playBtn = this.add.text(this.scale.width / 2, 500, 'PLAY', {
            fontSize: '132px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setInteractive();

        playBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { levelId: 1 });
        });

        // 3. Simple Toggle Switch (Sound)
        const isSoundOn = this.registry.get('sound_enabled') ?? true; // Default true
        const soundText = isSoundOn ? 'SOUND: ON' : 'SOUND: OFF';
        
        const soundBtn = this.add.text(this.scale.width / 2, 1400, soundText, {
            fontSize: '124px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setInteractive();

        soundBtn.on('pointerdown', () => {
            const current = this.registry.get('sound_enabled');
            const newState = !current;
            
            // Save to Global Registry
            this.registry.set('sound_enabled', newState);
            
            // Update Text
            soundBtn.setText(newState ? 'SOUND: ON' : 'SOUND: OFF');
            soundBtn.setColor(newState ? '#ffffff' : '#555555');
        });


 
        // 1. The Title (Hot Pink)
        const title = this.add.text(this.scale.width / 2, 1000, 'LOVE\nHURTS\nA LOT', {
            fontFamily: 'Orbitron', // or your custom font
            fontSize: '80px',
            align: 'center',
            color: '#ffffff',      // White core
            stroke: '#ff0066',     // Hot Pink stroke
            strokeThickness: 6
        }).setOrigin(0.5);

        // 2. The Glow (Stronger than Game Over)
        title.setShadow(0, 0, '#ff0066', 30, true, true);

        // 3. The "Heartbeat" Animation
        // Instead of random flickering, we use a smooth Sine wave
        this.tweens.add({
            targets: title,
            scale: 1.05,        // Grow slightly (5%)
            alpha: 1.0,         // Stay bright
            // Optional: If you use PostFX glow, you can tween the glow intensity here
            duration: 1500,     // 1.5 seconds per beat
            yoyo: true,         // Go back and forth
            repeat: -1,         // Infinite loop
            ease: 'Sine.easeInOut'
        });

        // 4. (Optional) The "Hum"
        // Menu neon shouldn't buzz like a broken light. 
        // It should just have a very faint, steady electric hum (or just silence + music).

            // 2. Play Button
        const settingsBtn = this.add.text(this.scale.width / 2, 2000, 'SETTINGS', {
            fontSize: '132px',
            color: '#FFFFFF'
        }).setOrigin(0.5).setInteractive();

        settingsBtn.on('pointerdown', () => {
            this.scene.start('SettingsScene');
        });
    }
}