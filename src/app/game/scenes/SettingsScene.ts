import { DTC } from "src/app/DTC";
import { TranslateService } from '@ngx-translate/core';
import { SettingsSlider } from '../ui/SettingsSlider';

export default class SettingsScene extends Phaser.Scene {
    private translate!: TranslateService;
    private dtc:DTC = new DTC();
    private buttonMainMenu!: Phaser.GameObjects.Sprite;
    private txtMainMenu!: Phaser.GameObjects.Text;

    constructor() {
        super('SettingsScene');
    }

    create(data: { score: number, result: string }) {
        this.translate = this.registry.get('translateService'); 
        this.add.image(0, 0, 'brick-bg').setOrigin(0, 0);

        this.add.text(this.scale.width / 2, 400, this.translate.instant('SETTINGS_SCENE.TITLE'), 
        { 
            fontSize: '80px',
            fontStyle: 'normal',
            color: '#d1e6fdff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily
        }).setOrigin(0.5);

        // Get current values from Audio Manager
        // (Assuming you pass the gameScene or access it via registry)
        const gameScene = this.scene.get('GameScene') as any; 
        const audioMgr = gameScene.audioManager;

        const currentSettings = audioMgr.getValues();
        
        // --- MUSIC SLIDER ---
        this.add.text(100, 800, this.translate.instant('SETTINGS_SCENE.MUSIC_VOLUME'), 
            { 
                fontSize: '50px', 
                fontStyle: 'normal',
                color: '#d1e6fdff',
                fontFamily: this.dtc.strFontFamily 
            }).setOrigin(0, 0.5);
        const musicSlider = new SettingsSlider(
            this, 
            600, // X position
            800, // Y position
            currentSettings.music, // Initial Value (0.0 - 1.0)
            (newValue) => {
                // Callback: This runs every time the knob moves
                audioMgr.setVolumes(audioMgr.getValues().sfx, newValue);
            }
        );

        // --- SFX SLIDER ---
        this.add.text(100, 1100, this.translate.instant('SETTINGS_SCENE.SFX_VOLUME'), 
            { 
                fontSize: '50px', 
                fontStyle: 'normal',
                color: '#d1e6fdff',
                fontFamily: this.dtc.strFontFamily
            }).setOrigin(0, 0.5);
        const sfxSlider = new SettingsSlider(
            this, 
            600, 
            1100, 
            currentSettings.sfx,
            (newValue) => {
                audioMgr.setVolumes(newValue, audioMgr.getValues().music);
                
                // Optional: Play a test sound when dragging SFX slider
                // But throttle it so it doesn't machine-gun sound
                // this.playTestSound(); 
            }
        );























        this.buttonMainMenu = this.add.sprite(this.scale.width / 2, 2500, 'button-green-normal');
        this.buttonMainMenu.setInteractive();
        this.buttonMainMenu.setScale(0.8);
        this.buttonMainMenu.on('pointerdown', () => {
            this.buttonMainMenu.setTexture('button-green-pressed');
        });
        this.buttonMainMenu.on('pointerup', () => {
              this.tweens.add({
                targets: this.buttonMainMenu,
                duration: 20000,   
                ease: 'Linear',  
                onComplete: () => {
                    this.buttonMainMenu.setTexture('button-green-normal');
                    this.scene.start('MenuScene');
                }
            });
        });

        this.txtMainMenu = this.add.text(this.scale.width / 2, 
            this.buttonMainMenu.y - 10,
            this.translate.instant('SETTINGS_SCENE.MAIN_MENU'),
            { 
            fontSize: '60px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily,
        })
        .setOrigin(0.5);
    }
}