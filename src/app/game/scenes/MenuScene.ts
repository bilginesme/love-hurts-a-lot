import { TranslateService } from "@ngx-translate/core";
import { NeonSignMenu } from '../sprites/NeonSignMenu';
import { DTC } from "src/app/DTC";
import { AudioManager } from "../managers/AudioManager";

export default class MenuScene extends Phaser.Scene {
    private dtc: DTC = new DTC();
    private translate!: TranslateService;
    private buttonResume!: Phaser.GameObjects.Sprite;
    private txtResume!: Phaser.GameObjects.Text;
    private buttonSettings!: Phaser.GameObjects.Sprite;
    private txtSettings!: Phaser.GameObjects.Text;
    private audioManager!: AudioManager;
    
    constructor() {
        super('MenuScene');
    }

    create() {
        this.audioManager = this.registry.get('audioManager');
        if (!this.audioManager) {
            // 2. First time arrival: Create it and save it
            this.audioManager = new AudioManager(this);
            this.registry.set('audioManager', this.audioManager);
            console.log("AudioManager created for the first time.");
        } else {
            // 3. Returning from GameScene: Just update the context
            console.log("Reusing existing AudioManager.");
        }
        
        this.translate = this.registry.get('translateService'); 
        this.add.image(0, 0, 'brick-bg').setOrigin(0, 0).setDepth(0);
        const theLight = this.add.image(this.scale.width / 2, 1000, 'light')
            .setOrigin(0.5, 0.5)
            .setDepth(0)
            .setAlpha(0.35)
            .setScale(1.5)
            .setInteractive();

         this.tweens.add({
            targets: theLight,
            alpha: { from: 0.32, to: 0.35 },
            duration: 150,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        const neonSign = new NeonSignMenu(this, this.scale.width / 2, 1000, this.audioManager);

        this.buttonResume = this.add.sprite(this.scale.width / 2, 2250, 'button-green-normal');
        this.buttonResume.setInteractive();
        this.buttonResume.on('pointerdown', () => {
            this.buttonResume.setTexture('button-green-pressed');
            this.buttonResume.setScale(0.95);     // Optional: Add a slight scale down for "juice"
        });
        this.buttonResume.on('pointerup', () => {
            // Immediate visual reset
            this.buttonResume.setTexture('button-green-normal');
            this.buttonResume.setScale(1);

            // Short delay so the user SEES the button pop back up before scene change
            this.time.delayedCall(100, () => {
                this.audioManager.stopMusic();
                this.scene.stop();
                this.scene.start('GameScene', { levelId: 1 });
            });
        });
        
        this.buttonResume.on('pointerout', () => {
            this.buttonResume.setTexture('button-green-normal');
            this.buttonResume.setScale(0.8);
        });

        this.txtResume = this.add.text(this.scale.width / 2, 
            this.buttonResume.y - 10,
            this.translate.instant('MENU_SCENE.PLAY'),
            { 
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily,
        })
        .setOrigin(0.5);

        this.buttonSettings = this.add.sprite(this.scale.width / 2, 2500, 'button-green-normal');
        this.buttonSettings.setInteractive();
        this.buttonSettings.setScale(0.8);

        this.buttonSettings.on('pointerdown', () => {
            this.buttonSettings.setTexture('button-green-pressed');
            this.buttonSettings.setScale(0.75);     // Optional: Add a slight scale down for "juice"
        });

        this.buttonSettings.on('pointerup', () => {
            // Immediate visual reset
            this.buttonSettings.setTexture('button-green-normal');
            this.buttonSettings.setScale(0.8);

            // Short delay so the user SEES the button pop back up before scene change
            this.time.delayedCall(100, () => {
                //this.scene.stop('MenuScene');
                this.scene.start('SettingsScene');
            });
        });

        this.buttonSettings.on('pointerout', () => {
            this.buttonSettings.setTexture('button-green-normal');
            this.buttonSettings.setScale(0.8);
        });

        this.txtSettings = this.add.text(this.scale.width / 2, 
            this.buttonSettings.y - 10,
            this.translate.instant('MENU_SCENE.SETTINGS'),
            { 
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily,
        })
        .setOrigin(0.5);

        // Listen for the shutdown event
        this.events.on('shutdown', () => {
            console.log('triggering shot down');
            neonSign.stopEffects();
        });
    }
}