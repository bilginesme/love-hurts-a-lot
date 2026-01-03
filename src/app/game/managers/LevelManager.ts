// managers/LevelManager.ts
import * as Phaser from 'phaser';
import { LEVEL_MANIFEST, LevelData, LevelPhase } from '../types/LevelConfig';
import { PlayerData } from './PlayerData'; // We'll make this next

export class LevelManager {
    private scene: Phaser.Scene;
    private currentLevel: LevelData;
    private currentPhase: LevelPhase;
    
    private gameTimer!: Phaser.Time.TimerEvent;
    private secondsPlayed: number = 0;
    private isGameOver: boolean = false;

    // We accept a levelId so we know which config to load
    constructor(scene: Phaser.Scene, levelId: number) {
        this.scene = scene;
        this.currentLevel = LEVEL_MANIFEST.find(l => l.id === levelId) || LEVEL_MANIFEST[0];
        
        // Start with the first phase (Time = 0)
        this.currentPhase = this.currentLevel.phases[0];
    }

    public start() {
        console.log(`Starting Level: ${this.currentLevel.title}`);
        
        // Timer ticks every 1 second
        this.gameTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => this.onSecondTick(),
            loop: true
        });
    }

    private onSecondTick() {
        if (this.isGameOver) return;

        this.secondsPlayed++;

        // 1. CHECK VICTORY (Time Limit Reached)
        /*
        if (this.secondsPlayed >= this.currentLevel.duration) {
            this.handleVictory();
            return;
        }
        */
       
        // 2. CHECK PHASE UPDATE
        // Check if there is a new phase starting at this exact second
        const newPhase = this.currentLevel.phases.find(p => p.startTime === this.secondsPlayed);
        if (newPhase) {
            this.currentPhase = newPhase;
            console.warn(`Phase Updated! Speed: ${newPhase.spawnInterval}ms`);
            
            // Optional: Flash text on screen "SPEED UP!"
        }
    }

    // --- GETTERS (The Spawner calls these) ---
    public getSpawnInterval() { return this.currentPhase.spawnInterval; }
    public getAllowedEvilItems() { return this.currentPhase.allowedItemsEvil; }
    public getAllowedLoveItems() { return this.currentPhase.allowedItemsLove; }
    public getEvilRatio() { return this.currentPhase.evilRatio; }

    // --- END GAME HANDLING ---
    public handleVictory() {
        this.stop();
        console.log("VICTORY!");
        
        // Unlock next level
        PlayerData.unlockLevel(this.currentLevel.id + 1);
        
        // Go to Win Scene (Pass data so we know what to show)
        this.scene.scene.start('WinScene', { 
            levelId: this.currentLevel.id,
            nextLevelId: this.currentLevel.id + 1 
        });
    }

    public handleDefeat() {
        this.stop();
        console.log("DEFEAT");
        
        // Go to Game Over Scene
        this.scene.scene.start('GameOverScene', { 
            retryLevelId: this.currentLevel.id 
        });
    }

    public stop() {
        this.isGameOver = true;
        if (this.gameTimer) this.gameTimer.destroy();
    }
}