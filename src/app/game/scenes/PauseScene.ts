import { TranslateService } from "@ngx-translate/core";
import { DTC } from "src/app/DTC";

export default class PauseScene extends Phaser.Scene {
    private dtc:DTC = new DTC();
    private translate!: TranslateService;
    private buttonResume!: Phaser.GameObjects.Sprite;
    private txtResume!: Phaser.GameObjects.Text;
    private buttonMainMenu!: Phaser.GameObjects.Sprite;
    private txtMainMenu!: Phaser.GameObjects.Text;

    constructor() {
        super('PauseScene');    
    }

    create() {
        this.translate = this.registry.get('translateService'); 

        const veil = this.add.graphics();   // 1. Semi-transparent black veil
        veil.fillStyle(0x000000, 0.7); // 50% opacity black
        veil.fillRect(0, 0, this.scale.width, this.scale.height);

        const strPaused:string = this.translate.instant('PAUSE_SCENE.TITLE');
        this.add.text(this.scale.width / 2, 1200, strPaused, {
            color: '#e0ebf7ff',
            fontSize: '120px',
            fontFamily: this.dtc.strFontFamily,
            fontStyle: 'normal'
        }).setOrigin(0.5);

            
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
                this.scene.stop();
                this.scene.resume('GameScene');
            });
        });
        
        this.buttonResume.on('pointerout', () => {
            this.buttonResume.setTexture('button-green-normal');
            this.buttonResume.setScale(0.8);
        });

        
        this.txtResume = this.add.text(this.scale.width / 2, 
            this.buttonResume.y - 10,
            this.translate.instant('PAUSE_SCENE.RESUME'),
            { 
            fontSize: '80px',
            fontStyle: 'bold',
            color: '#ffffff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily,
        })
        .setOrigin(0.5);


        this.buttonMainMenu = this.add.sprite(this.scale.width / 2, 2500, 'button-green-normal');
        this.buttonMainMenu.setInteractive();
        this.buttonMainMenu.setScale(0.8);

        this.buttonMainMenu.on('pointerdown', () => {
            this.buttonMainMenu.setTexture('button-green-pressed');
            this.buttonMainMenu.setScale(0.75);     // Optional: Add a slight scale down for "juice"
        });

        this.buttonMainMenu.on('pointerup', () => {
            // Immediate visual reset
            this.buttonMainMenu.setTexture('button-green-normal');
            this.buttonMainMenu.setScale(0.8);

            // Short delay so the user SEES the button pop back up before scene change
            this.time.delayedCall(100, () => {
                this.scene.stop('GameScene');
                this.scene.start('MenuScene');
            });
        });

        this.buttonMainMenu.on('pointerout', () => {
            this.buttonMainMenu.setTexture('button-green-normal');
            this.buttonMainMenu.setScale(0.8);
        });

        this.txtMainMenu = this.add.text(this.scale.width / 2, 
            this.buttonMainMenu.y - 10,
            this.translate.instant('PAUSE_SCENE.MAIN_MENU'),
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