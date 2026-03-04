import * as Phaser from 'phaser';
import { DTC } from 'src/app/DTC';

export default class PreloaderScene extends Phaser.Scene {
    private dtc:DTC = new DTC();

    constructor() {
        super('PreloaderScene');
    }

    preload() {
        // 1. Setup the Visual Loading Bar
        // (Optional: Create a simple rectangle graphic)
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

        const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
            fontSize: '20px',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 2. Listen for Loader Events
        this.load.on('progress', (value: number) => {
            // value is 0.0 to 1.0
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
        });

        this.load.on('complete', () => {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            
            //this.scene.start('SettingsScene');  // Start the Menu
            //this.scene.start('GameScene', { levelId: 1 });
            //this.scene.start('MenuScene');  // Start the Menu
            //this.scene.start('GameOverScene', { score: 13400, result: false });
            this.scene.start('SuccessScene', { score: 13400, result: true });
        });

        const font = new FontFace(this.dtc.strFontFamily, 'url(assets/fonts/PlaypenSans.ttf)');
        font.load().then(() => {
            (document.fonts as any).add(font);
        }).catch(err => {
            console.error('Font failed to load:', err);
        });
    
        this.load.image('bg', 'assets/images/bg.png');
        this.load.image('stars', 'assets/images/stars.png');
        this.load.image('brick-bg', 'assets/images/brick-bg.png');
        this.load.image('ladder-balcony', 'assets/images/ladder-balcony.png');
        this.load.image('distant-buildings-bg', 'assets/images/distant-buildings/distant-buildings-bg.png');
        this.load.image('ladder-ladder', 'assets/images/ladder-ladder.png');
        for(let i:number=1; i <= 19; i++) {
            let suffix:string = this.dtc.doubleDigit(i);
            this.load.image('window-' + suffix, 'assets/images/distant-buildings/window-' + suffix  + '.png');
        }

        this.load.image('pill', 'assets/images/ui/pill.png');
        this.load.image('slider_fill', 'assets/images/ui/slider_fill.png');
        this.load.image('slider_knob', 'assets/images/ui/slider_knob.png');
        this.load.image('slider_bg', 'assets/images/ui/slider_bg.png');

        this.load.image('hero-male', 'assets/images/hero/hero-male.png');
        
        this.load.image('game-over', 'assets/images/game-over.png');
        this.load.image('wires', 'assets/images/neon-sign/wires.png');
        this.load.image('wires-short', 'assets/images/neon-sign/wires-short.png');
        this.load.image('light', 'assets/images/neon-sign/light.png');

        this.load.image('apartment', 'assets/images/apartment.png');
        
        this.load.image('bullet-small', 'assets/images/bullet-small.png');
        this.load.image('bullet-large', 'assets/images/bullet-large.png');
        this.load.image('bullet-dart', 'assets/images/bullet-dart.png');

        this.load.image('button-gun', 'assets/images/ui/button-gun.png');
        this.load.image('button-weapon-choosing', 'assets/images/ui/button-weapon-choosing.png');
        this.load.image('button-pause', 'assets/images/ui/button-pause.png');        
        this.load.image('button-green-normal', 'assets/images/ui/button-green-normal.png');        
        this.load.image('button-green-pressed', 'assets/images/ui/button-green-pressed.png');        

        this.load.spritesheet('objects-atlas', 'assets/images/objects/objects-atlas.png', { frameWidth: 250, frameHeight: 250 });
        this.load.image('balloon-yellow', 'assets/images/objects/balloon-yellow.png');
        this.load.image('balloon-red', 'assets/images/objects/balloon-red.png');

        this.load.image('couple-balcony', 'assets/images/couple-balcony.png');
        this.load.image('couple-balcony-hit', 'assets/images/couple-balcony-hit.png');
        this.load.image('couple-balcony-love', 'assets/images/couple-balcony-love-potion.png');
        this.load.image('couple-window', 'assets/images/couple-window.png');
        this.load.image('couple-window-hit', 'assets/images/couple-window-hit.png');
        this.load.image('couple-window-love', 'assets/images/couple-window-love-potion.png');

        this.load.image('laser-beam', 'assets/images/laser-beam.png');
        this.load.image('gun-01', 'assets/images/guns/gun-01.png');
        this.load.image('gun-02', 'assets/images/guns/gun-02.png');
        this.load.image('gun-03', 'assets/images/guns/gun-03.png');
        this.load.image('gun-04', 'assets/images/guns/gun-04.png');

        this.load.audio('bullet', 'assets/sounds/bullet.mp3');

        this.load.image('gauge-back', 'assets/images/gauge/gauge-back.png');
        this.load.image('gauge-glass', 'assets/images/gauge/gauge-glass.png');
        this.load.image('gauge-needle', 'assets/images/gauge/gauge-needle.png');
        this.load.image('smoke-01', 'assets/images/gauge/smoke-01.png');
        this.load.image('smoke-02', 'assets/images/gauge/smoke-02.png');
        this.load.image('smoke-03', 'assets/images/gauge/smoke-03.png');
        this.load.image('smoke-04', 'assets/images/gauge/smoke-04.png');
        this.load.image('smoke-05', 'assets/images/gauge/smoke-05.png');
        this.load.image('smoke-06', 'assets/images/gauge/smoke-06.png');

        this.load.image('broken-heart-01', 'assets/images/gauge/broken-heart-01.png');
        this.load.image('broken-heart-02', 'assets/images/gauge/broken-heart-02.png');
        this.load.image('broken-heart-03', 'assets/images/gauge/broken-heart-03.png');

        for(let i:number=1; i <= 121; i++) {
            let suffix:string = this.dtc.tripleDigit(i);
            this.load.image('cloud-' + suffix, 'assets/images/clouds/cloud-' + suffix  + '.png');
        }

        this.load.atlas('stork_atlas', 'assets/images/birds/stork-anim.png', 'assets/images/birds/stork-anim.json');
        this.load.atlas('pelican_atlas', 'assets/images/birds/pelican-anim.png', 'assets/images/birds/pelican-anim.json');
        this.load.atlas('dust_atlas', 'assets/images/dust-anim.png', 'assets/images/dust-anim.json');
        this.load.atlas('lovebird_atlas', 'assets/images/birds/lovebird-anim.png', 'assets/images/birds/lovebird-anim.json');
        this.load.spritesheet('moon', 'assets/images/moon-phases.png', { frameWidth: 800, frameHeight: 800 });
        this.load.spritesheet('neon-letters-menu-atlas', 'assets/images/neon-sign/neon-letters-menu.png', { frameWidth: 250, frameHeight: 250 });
        this.load.spritesheet('neon-letters-game-over-atlas', 'assets/images/neon-sign/neon-letters-game-over.png', { frameWidth: 250, frameHeight: 250 });
        this.load.spritesheet('feathers-atlas', 'assets/images/birds/feathers-atlas.png', { frameWidth: 250, frameHeight: 250 });

        this.load.audio('background-01', 'assets/sounds/background-01.mp3');
        this.load.audio('background-02', 'assets/sounds/background-02.mp3');
        this.load.audio('background-03', 'assets/sounds/background-03.mp3');
        this.load.audio('game-over', 'assets/sounds/game-over.mp3');
        this.load.audio('tick', 'assets/sounds/tick.mp3');
        this.load.audio('hit-ground-01', 'assets/sounds/hit-ground-01.mp3');
        this.load.audio('hit-couple-love', 'assets/sounds/hit-couple-love.mp3');
        this.load.audio('hit-couple-evil', 'assets/sounds/hit-couple-evil.mp3');
        this.load.audio('neon-buzz-01', 'assets/sounds/neon-buzz-01.mp3');
        this.load.audio('neon-buzz-02', 'assets/sounds/neon-buzz-02.mp3');
        this.load.audio('neon-humming-strong', 'assets/sounds/neon-humming-strong.mp3');
        this.load.audio('neon-humming-weak', 'assets/sounds/neon-humming-weak.mp3');
        this.load.audio('balloon-pop', 'assets/sounds/balloon-pop.mp3');
    }
}