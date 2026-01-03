import { DTC } from "src/app/DTC";
import { TranslateService } from '@ngx-translate/core';

export default class GameOverScene extends Phaser.Scene {
    private translate!: TranslateService;
    private dtc:DTC = new DTC();
    private subText!: Phaser.GameObjects.Text;
    private flickerTimer!: Phaser.Time.TimerEvent;
    private gameOver!: Phaser.GameObjects.Image;
    private buttonPlayAgain!: Phaser.GameObjects.Sprite;
    private txtPlayAgain!: Phaser.GameObjects.Text;
    private buttonMainMenu!: Phaser.GameObjects.Sprite;
    private txtMainMenu!: Phaser.GameObjects.Text;

    constructor() {
        super('GameOverScene');
    }

    create(data: { score: number, result: string }) {
        this.translate = this.registry.get('translateService'); 
        this.add.image(0, 0, 'brick-bg').setOrigin(0, 0);
        this.gameOver = this.add.image(this.scale.width / 2, this.scale.height / 2, 'game-over')
            .setOrigin(0.5, 0.5);

        let strResultText:string = 'The result of the game';
        let strScore:string = '0000';
        console.log(data);

        if(data) {
            console.log('game over resulted');
            
            if(data.result) {
                strResultText = this.translate.instant('GAME_OVER_SCENE.TITLE_SUCCESS');
            } else {
                strResultText = this.translate.instant('GAME_OVER_SCENE.TITLE_FAILURE');
            }
            
            strScore = data.score.toString();
        }

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


        this.startFlicker();




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

    private startFlicker() {
        // This function calls itself recursively with random delays
        // to simulate erratic electrical failure.
        
        const isGlitch = Phaser.Math.RND.between(0, 100) > 90; // 10% chance of a "major" glitch
        const delay = isGlitch ? Phaser.Math.Between(20, 100) : Phaser.Math.Between(100, 500);
        
        this.flickerTimer = this.time.delayedCall(delay, () => {
            
            // Randomly pick an intensity:
            // 90% chance: High Intensity (0.8 - 1.0) -> The light is working
            // 10% chance: Low Intensity (0.1 - 0.3)  -> The light dips/fails
            
            const flickerState = Math.random() > 0.1; 
            const newAlpha = flickerState ? Phaser.Math.FloatBetween(0.9, 1.0) : Phaser.Math.FloatBetween(0.1, 0.3);

            this.gameOver.setAlpha(newAlpha);
            
            // If you have a glow effect (PostFX), you can jitter that too:
            // this.neonText.setShadowBlur(flickerState ? 20 : 5);

            // Optional: Play a short "Buzz" sound when it lights up strongly
            // if (newAlpha > 0.8 && Math.random() > 0.8) this.sound.play('neon_buzz', { volume: 0.1 });

            this.startFlicker(); // Loop
        });
    }
}