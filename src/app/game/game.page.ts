import { Component, OnInit } from '@angular/core';
import Phaser from 'phaser';
import { GameScene } from './scenes/GameScene';
import PauseScene from './scenes/PauseScene';
import MenuScene from './scenes/MenuScene';
import BootScene from './scenes/BootScene';
import PreloaderScene  from './scenes/PreloaderScene';
import GameOverScene from './scenes/GameOverScene';
import { TranslateService } from '@ngx-translate/core';
import SettingsScene from './scenes/SettingsScene';
import SuccessScene from './scenes/SuccessScene';


@Component({
  selector: 'app-game',
  templateUrl: './game.page.html',
  styleUrls: ['./game.page.scss'],
  standalone: false,
})
export class GamePage implements OnInit {
  phaserGame!: Phaser.Game;
  resizeTimeout: any;

  constructor(private translate: TranslateService) { }

  ngOnInit() {
  }

  ngAfterViewInit(): void {
    // Delay so Ionic finishes layout inside WebView
    setTimeout(() => {
      const initialWidth = window.innerWidth; 
      const initialHeight = window.innerHeight;  
     
      const config: Phaser.Types.Core.GameConfig = { 
        type: Phaser.AUTO, 
        parent: 'phaser-container', 
        backgroundColor: '#FFFFFF', 
        
        // --- Crucial addition for initial size --- 
        width: initialWidth, height: 
        initialHeight, // ---------------------------------------- 
        
        scale: { 
          mode: Phaser.Scale.FIT, // This maintains aspect ratio (letterboxing if needed) 
          autoCenter: Phaser.Scale.CENTER_BOTH, // Define a reference size for your game world 
          height: 2736,
          width: 1260,  
        }, 
        physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0 }, // No global gravity (we handle it per object if needed)
            debug: true              // Set to TRUE to see hitboxes (very helpful for prototyping!)
        }
        },
        scene: [BootScene, PreloaderScene, GameScene, PauseScene, MenuScene, SettingsScene, GameOverScene, SuccessScene], 
        render: { 
          antialiasGL: true, 
          antialias: true, 
          pixelArt: false, 
        }, 
        callbacks: {
          postBoot: (game) => {
            // KEY STEP: Put the Angular Service into the Phaser Registry
            game.registry.set('translateService', this.translate);
          }
        }
      };
  
      const game = new Phaser.Game(config);
     
      game.scale.on('resize', (gameSize: Phaser.Structs.Size, baseSize: Phaser.Structs.Size) => { 
        // This event fires when the browser window/container is resized. 
        // Use this to update the camera or scene elements if necessary. 
        // Example: If you have a specific UI element in your scene, you might move it:
         // this.cameras.main.setViewport(0, 0, gameSize.width, gameSize.height); 
        });
    }, 100);
  }
   
  ngOnDestroy() {
    if (this.phaserGame) {
      this.phaserGame.destroy(true); // true = destroy Canvas and Audio too
      console.log('Phaser Game Destroyed');
    }
  }
}
