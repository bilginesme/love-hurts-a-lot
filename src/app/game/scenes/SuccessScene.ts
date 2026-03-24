import { DTC } from "src/app/DTC";
import { TranslateService } from '@ngx-translate/core';
import { NeonSignSuccess } from "../sprites/NeonSignSuccess";
import { AudioManager } from "../managers/AudioManager";

export default class SuccessScene extends Phaser.Scene {
    private translate!: TranslateService;
    private dtc:DTC = new DTC();
    private subText!: Phaser.GameObjects.Text;
    private flickerTimer!: Phaser.Time.TimerEvent;
    private gameOver!: Phaser.GameObjects.Image;
    private buttonPlayAgain!: Phaser.GameObjects.Sprite;
    private txtPlayAgain!: Phaser.GameObjects.Text;
    private buttonMainMenu!: Phaser.GameObjects.Sprite;
    private txtMainMenu!: Phaser.GameObjects.Text;
    private audioManager!: AudioManager;

    constructor() {
        super('SuccessScene');
    }

    create(data: { score: number, result: string }) {
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

        const sign = new NeonSignSuccess(this, this.scale.width / 2, 1600, this.audioManager);

        let strResultText:string = 'The result of the game';
        let strScore:string = '';

        if(data) {
            if(data.result) {
                strResultText = this.translate.instant('GAME_OVER_SCENE.TITLE_SUCCESS');
            } else {
                strResultText = this.translate.instant('GAME_OVER_SCENE.TITLE_FAILURE');
            }
            
            strScore = data.score.toLocaleString('en-US');
        }

        const imgHeroSuccess = this.add.image(this.scale.width / 2, 1100, 'hero-success')
            .setOrigin(0.5, 0.5);

        // 1. Show Result
        this.add.text(this.scale.width / 2, 350, strResultText, 
        { 
            fontSize: '90px',
                fontStyle: 'bold',
            color: '#d1e6fdff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily 
        }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, 600, this.translate.instant('GAME_OVER_SCENE.SCORE'), 
        { 
            fontSize: '48px',
                fontStyle: 'normal',
            color: '#d1e6fdff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily
        }).setOrigin(0.5);
        this.add.text(this.scale.width / 2, 700, strScore, 
        { 
            fontSize: '100px',
                fontStyle: 'bold',
            color: '#d1e6fdff',
            align: 'center',
            fontFamily: this.dtc.strFontFamily
        }).setOrigin(0.5);

        this.buttonPlayAgain = this.add.sprite(this.scale.width / 2, 2250, 'button-green-normal');
        this.buttonPlayAgain.setInteractive();
        this.buttonPlayAgain.on('pointerdown', () => {
            this.buttonPlayAgain.setTexture('button-green-pressed');
        });
        this.buttonPlayAgain.on('pointerup', () => {
              this.tweens.add({
                targets: this.buttonPlayAgain,
                duration: 20000,   
                ease: 'Linear',  
                onComplete: () => {
                    this.buttonPlayAgain.setTexture('button-green-normal');
                    this.scene.start('GameScene');
                }
            });
        });

        this.txtPlayAgain = this.add.text(this.scale.width / 2, 
            this.buttonPlayAgain.y - 10,
            this.translate.instant('GAME_OVER_SCENE.PLAY_AGAIN'),
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
            this.translate.instant('GAME_OVER_SCENE.MAIN_MENU'),
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