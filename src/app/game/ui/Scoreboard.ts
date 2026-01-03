// ui/SettingsSlider.ts
import * as Phaser from 'phaser';
import { GameTimer } from './GameTimer';

export class Scoreboard extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Sprite;
    private score:number = 0;
    private level:number = 0;
    private gameTimer!: GameTimer;

    private initialY: number;      // Store the Vertical "Home"
    private isHidden: boolean = false;
    private triggerY: number;      // The height threshold

    constructor(scene: Phaser.Scene, x: number, y: number, level:number) {
        super(scene, x, y);
        
        scene.add.existing(this);
        
        this.initialY = y;
        this.level = level;

        this.bg = scene.add.sprite(x, y, 'scoreboard').setOrigin(0.5, 0.5);
        this.bg.flipX = true;

        this.gameTimer = new GameTimer(this.scene, x + 100, y, 300); // 1. Create and Start the Timer
        this.gameTimer.start();

        // 2. Listen for the "Time's Up" event
        // This is much cleaner than checking "if (time <= 0)" in update loop!
        this.gameTimer.on('timeout', () => {
            this.emit('time-over')
            //this.endGame(false); // Time ran out -> You Lose (Love Wins)
        });

        this.triggerY = this.scene.scale.height * 0.2;
    }

    private updateBoard(): void {

    }

    public checkHeroPosition(heroY: number) {
        // 1. Hero is climbing HIGH (y is small) -> HIDE
        if (heroY < this.triggerY) {
            if (!this.isHidden) {
                this.hide();
            }
        } 
        // 2. Hero is lower down -> SHOW
        else {
            if (this.isHidden) {
                this.show();
            }
        }
    }

    public addScore(additionalScore:number): void {
        this.score += additionalScore;
        this.updateBoard();
    }

    public stopTimer(): void {
        this.gameTimer.stop();
    }

    public hide(): void {
        this.isHidden = true; 
        
        this.scene.tweens.add({
            targets: this.bg,
            y: -200, 
            duration: 400,
            ease: 'Sine.easeInOut'
        });
    }

    public show(): void {
        this.isHidden = false; 
        
        this.scene.tweens.add({
            targets: this.bg,
            y: this.initialY, // Slide back down to "Home"
            duration: 400,
            ease: 'Sine.easeInOut'
        });
    }

}