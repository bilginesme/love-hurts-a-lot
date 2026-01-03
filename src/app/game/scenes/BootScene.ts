import * as Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // Load only the assets for the Preloader (e.g., logo, bar background)
        // If you don't have these, you can leave this empty for now.
        this.load.image('logo', 'assets/logo.png'); 
    }

    create() {
        // Set any global registry data here if needed
        // Then, immediately start the loader
        this.scene.start('PreloaderScene');
    }
}