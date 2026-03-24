import Phaser from 'phaser';
import { TranslateService } from '@ngx-translate/core';
import { DTC } from '../../DTC';
import { Hero } from '../sprites/Hero';
import { Apartment } from '../sprites/Apartment';
import { DistantBuildings } from '../sprites/DistantBuildings';
import { ButtonGun } from '../ui/ButtonGun';
import { ButtonWeaponChoosing } from '../ui/ButtonWeaponChoosing';
import { ButtonPause } from '../ui/ButtonPause';
import Bullet from '../sprites/Bullet';
import Bird from '../sprites/Bird';
import Couple from '../sprites/Couple';
import { FallingItem } from '../sprites/FallingItem';
import { ItemType } from '../types/ItemConfig';
import Clouds from "../sprites/Clouds";
import { Moon } from '../sprites/Moon';
import { AudioManager } from '../managers/AudioManager';
import { LevelManager } from '../managers/LevelManager';
import { BirdSpawnManager } from '../managers/BirdSpawnManager';
import { WeaponData } from '../types/WeaponConfig';
import { LoveGauge } from '../ui/LoveGauge';
import  UpperPill  from '../ui/UpperPill';
import { LEVEL_MANIFEST } from '../types/LevelConfig';
import { Stars } from '../sprites/Stars';
import { CouplePosition } from '../types/CoupleConfig';

export class GameScene extends Phaser.Scene {
    private translate!: TranslateService;
    private dtc:DTC = new DTC();
    private score:number = 0;
    
    public audioManager!: AudioManager; // Public so Hero/Birds can access if needed

    private hero!:Hero;
    private stars!:Stars;
    private ladderBalcony!:Phaser.GameObjects.Sprite;
    private ladderLadder!:Phaser.GameObjects.Sprite;
    private apartment!:Apartment;
    private distantBuildings!:DistantBuildings;
    private buttonGun!:ButtonGun;
    private buttonWeaponChoosing!:ButtonWeaponChoosing;
    private buttonPause!:ButtonPause;
    private txtCurrentGun!:Phaser.GameObjects.Text;

    private bulletsGroup!: Phaser.Physics.Arcade.Group;
    private birdsGroup!: Phaser.Physics.Arcade.Group;
    private fallingItemsGroup!: Phaser.Physics.Arcade.Group;
    private couplesGroup!: Phaser.Physics.Arcade.Group;
    private floor!: Phaser.Physics.Arcade.StaticGroup;
    //private testObject!:Phaser.GameObjects.Sprite;


    private clouds!:Clouds;
    private moon!:Moon;

    private loveGauge!: LoveGauge;
    private upperPill!: UpperPill;

    public birdSpawnManager!: BirdSpawnManager;
    private levelManager!: LevelManager;
    private currentLevelId: number = 1; // Default
    
    init(data: { levelId: number }) {       // 1. RECEIVE LEVEL ID FROM MENU
        this.currentLevelId = data.levelId || 1;
    }

    private COUPLE_POSITIONS: CouplePosition[] = [
        { x: 122, y: 1190,  id: 'top',    type: 'window_couple' }, 
        { x: 269, y: 1612, id: 'middle',   type: 'window_couple' },
        { x: 138, y: 2055, id: 'bottom_left',   type: 'window_couple' },
        { x: 383, y: 2055, id: 'bottom_right',   type: 'window_couple' },

        { x: 477, y:  770, id: 'top_left', type: 'balcony_couple' },
        { x: 546, y: 1320, id: 'top_right', type: 'balcony_couple' },
        { x: 687, y: 1750, id: 'balcony_mid', type: 'balcony_couple' },
        { x: 800, y: 2190, id: 'bar_entrance', type: 'balcony_couple' }
    ];

    constructor() { super('GameScene'); }

    preload() {}

    create() {
        console.log('Starting LEVEL ' + this.currentLevelId);

        this.translate = this.registry.get('translateService'); 
        this.cameras.main.setBackgroundColor('#FFFFFF'); // for visibility
        this.input.addPointer(3);
        
        this.audioManager = this.registry.get('audioManager') as AudioManager;
        // 2. DEBUG FAIL-SAFE: If it doesn't exist (because you bypassed Menu), create it!
        if (!this.audioManager) {
            console.warn("Debug Mode: AudioManager not found in registry. Creating a new instance.");
            this.audioManager = new AudioManager(this);
            this.registry.set('audioManager', this.audioManager);
        } else {
            // Normal path: Just update the scene context
            console.log("Reusing existing AudioManager.");
        }

        this.events.once('shutdown', () => { this.audioManager.stopMusic(); });     // THE FIX: Cleanup when scene restarts/stops
        const variations = ['background-01', 'background-02', 'background-03'];
        this.audioManager.playMusicPlaylist(variations, 120000); // Swap every 2 mins

        const bg = this.add.image(0, 0, 'bg').setOrigin(0, 0).setDepth(-20);
        bg.setDisplaySize(this.scale.width, this.scale.height);
        bg.setDisplayOrigin(0, 0);

        this.stars = new Stars(this, 'stars', 0, 0).setInteractive().setDepth(-19);
        this.moon = new Moon(this);
        this.clouds = new Clouds(this).setDepth(-5);
        this.distantBuildings = new DistantBuildings(this, this.scale.width, this.scale.height - 150);
        this.apartment = new Apartment(this, 0, 2736);
        this.birdsGroup = this.physics.add.group({ classType: Bird, maxSize: 10, runChildUpdate: true });
        this.fallingItemsGroup = this.physics.add.group({ classType: FallingItem, runChildUpdate: true });
        this.ladderBalcony = this.add.sprite(990, 350, 'ladder-balcony').setOrigin(0, 0).setDepth(298);
        this.ladderLadder = this.add.sprite(1050, 0, 'ladder-ladder').setOrigin(0, 0).setDepth(299);
        this.hero = new Hero(this, 'hero-male').setDepth(300);
        
        this.bulletsGroup = this.physics.add.group({ classType: Bullet, maxSize: 20, runChildUpdate: true  });  // Important: runs preUpdate() automatically
        this.physics.add.overlap(this.bulletsGroup, this.birdsGroup, this.onHitBulletBird as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, this.callBack, this);

        this.couplesGroup = this.physics.add.group({ classType: Couple, runChildUpdate: true });
        this.COUPLE_POSITIONS.forEach(pos => {
            const couple = new Couple(this, pos.x, pos.y, pos.type);
            this.add.existing(couple);
            this.couplesGroup.add(couple); 
            couple.disableBody(true, true);
        });

        this.physics.add.overlap(this.couplesGroup, this.fallingItemsGroup, this.onItemHitCouple  as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, this.callBack, this);
        this.physics.add.overlap(this.bulletsGroup, this.fallingItemsGroup, this.onHitBulletHitItem  as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, this.callBack, this);

        this.time.addEvent({
            delay: 5000,
            loop: true,
            callback: this.spawnCouple,
            callbackScope: this
        });     // Every n seconds, try to wake up a random window

        this.birdSpawnManager = new BirdSpawnManager(this);

        this.levelManager = new LevelManager(this, this.currentLevelId);
        this.levelManager.start();

        this.createFloor();
        this.scheduleNextSpawnBird();   // 3. START SPAWNING LOOP
        this.createAnims();
        this.createUI();
        this.developmentTools();
    }

    private developmentTools(): void {
        
        // Setup Keyboard Input (Development Helper)
        // The event is 'keydown-SPACE'. It fires once per press (no rapid-fire machine gun if held down).
        this.input.keyboard?.on('keydown-SPACE', () => { this.shootWeapon();  });
        
        let code:any = Phaser.Input.Keyboard.KeyCodes.ONE;
        this.input.keyboard?.on('keydown-ONE', () => { this.switchWeapon();  });
        this.input.keyboard?.on('keydown-TWO', () => { this.switchWeapon();  });
        this.input.keyboard?.on('keydown-THREE', () => { this.switchWeapon();  });

        // DEVELOPMENT
        // Needed for mouse locations for creating another board
        
        /*
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            let x:number =parseInt(pointer.x.toString());
            let y:number =parseInt(pointer.y.toString());
            console.log(`Screen X: ${x}, Screen Y: ${y}`);
            this.testDropItem(x);
        });
        */

        /*
            SKY_LANES.forEach((lane) => {
                console.log(lane);
                this.add.rectangle(0, lane.minY, this.scale.width, (lane.maxY - lane.minY), 0x000000, 0.5).setOrigin(0, 0);
            });
        */
    }

    private testDropItem(x: number) {
        /*
        // 1. Instantiate the Sprite
        this.testObject = this.add.sprite(x, -50, 'flowerpot');
        
        // 2. Add to Physics System
        this.physics.add.existing(this.testObject);
        const body = this.testObject.body as Phaser.Physics.Arcade.Body;

        // 3. Define Physics Parameters
        body.setGravityY(800);          // Standard heavy fall
        body.setMaxVelocity(0, 1000);   // Prevents "tunneling" through thin hitboxes
        body.setBounce(0.2);            // Slight "thud" feel for Love vs. Evil impact
        
        // 4. Match Hitbox to Visuals
        // If your flowerpot has transparent padding, shrink the body:
        body.setSize(this.testObject.width * 0.8, this.testObject.height * 0.9);
        
        this.physics.add.overlap(
        this.couplesGroup, 
        this.testObject, // Assuming your falling items are in a group
        this.handleCoupleHit, 
        undefined, 
        this
    );

        console.log(`[Test] Dropping ${this.testObject.texture.key} at x: ${x}`);
        */
    }

    private handleCoupleHit(coupleObj: any, itemObj: any) {
    // Cast to your interfaces/classes
    const couple = coupleObj as Couple;
    const item = itemObj as FallingItem; // Or your Sprite/Container wrapper
 

    // 3. Physics Precision: Kill the item so it doesn't multi-hit
    // If it's a Container, destroy the container; if a Sprite, destroy the sprite.
    item.destroy(); 

    // 4. Creative Game Feel: Small Screen Shake on impact
    this.cameras.main.shake(100, 0.005);
}


    override update(time: number, delta: number) {
       
    }

    private createUI(): void {
        this.buttonGun = new ButtonGun(this, 'button-gun', 220, 2525).setDepth(100);
        this.buttonWeaponChoosing = new ButtonWeaponChoosing(this, 'button-weapon-choosing', 590, 2550).setDepth(100);
        this.buttonPause = new ButtonPause(this, 'button-pause', this.scale.width - 120, this.scale.height - 120).setDepth(100);

        this.loveGauge = new LoveGauge(this, 150, 250); 
        this.loveGauge.setScale(0.8); // Adjust size
        this.loveGauge.setValue(50);

        this.upperPill = new UpperPill(this, this.scale.width / 2, 150, this.currentLevelId);
        this.upperPill.on('time-over', () => {
            this.endGame(false);
        });

        this.txtCurrentGun = this.add.text(1000, 2600, 'gun', {
            color: '#e0ebf7ff',
            fontSize: '50px',
            fontFamily: this.dtc.strFontFamily,
            fontStyle: 'normal'
        });
        this.txtCurrentGun.setOrigin(0.5, 0.5);
        this.txtCurrentGun.setText(this.hero.getCurrentWeapon().name)

        this.buttonWeaponChoosing.on('choose-next-weapon', () => {
            this.switchWeapon();
        });

        this.buttonGun.on('fire-gun', () => {
            this.shootWeapon();
        });
    }

    private createAnims() {
        // Define the 'fly' animation globally
        if (!this.anims.exists('stork_fly')) {
            this.anims.create({
                key: 'stork_fly',
                // Helper to generate frame names: 
                // 'stork_atlas' is the key we loaded in Preloader
                frames: this.anims.generateFrameNames('stork_atlas', { 
                    prefix: '',   // Match your JSON filenames (without numbers)
                    start: 1,           // First frame number
                    end: 10,             // Last frame number (check your file!)
                    zeroPad: 2,         // e.g. "01" needs 2 digits. Use 0 if just "1"
                    suffix: '.png'      // If your JSON has extensions
                }),
                frameRate: 5,          // Speed (frames per second)
                repeat: -1              // Loop forever
            });
        }

        // Define the 'fly' animation globally
        if (!this.anims.exists('lovebird_fly')) {
            this.anims.create({
                key: 'lovebird_fly',
                // Helper to generate frame names: 
                // 'stork_atlas' is the key we loaded in Preloader
                frames: this.anims.generateFrameNames('lovebird_atlas', { 
                    prefix: '',   // Match your JSON filenames (without numbers)
                    start: 1,           // First frame number
                    end: 12,             // Last frame number (check your file!)
                    zeroPad: 2,         // e.g. "01" needs 2 digits. Use 0 if just "1"
                    suffix: '.png'      // If your JSON has extensions
                }),
                frameRate: 5,          // Speed (frames per second)
                repeat: -1               // Loop forever
            });
        }

        // Define the 'fly' animation globally
        if (!this.anims.exists('pelican_fly')) {
            this.anims.create({
                key: 'pelican_fly',
                // Helper to generate frame names: 
                // 'stork_atlas' is the key we loaded in Preloader
                frames: this.anims.generateFrameNames('pelican_atlas', { 
                    prefix: '',   // Match your JSON filenames (without numbers)
                    start: 1,           // First frame number
                    end: 9,             // Last frame number (check your file!)
                    zeroPad: 2,         // e.g. "01" needs 2 digits. Use 0 if just "1"
                    suffix: '.png'      // If your JSON has extensions
                }),
                frameRate: 5,          // Speed (frames per second)
                repeat: -1               // Loop forever
            });
        }

        // Define the 'dust' animation globally
        if (!this.anims.exists('dust-explosion')) {
            this.anims.create({
                key: 'dust-explosion',
                // Helper to generate frame names: 
                // 'stork_atlas' is the key we loaded in Preloader
                frames: this.anims.generateFrameNames('dust_atlas', { 
                    prefix: '',   // Match your JSON filenames (without numbers)
                    start: 1,           // First frame number
                    end: 16,             // Last frame number (check your file!)
                    zeroPad: 2,         // e.g. "01" needs 2 digits. Use 0 if just "1"
                    suffix: '.png'      // If your JSON has extensions
                }),
                frameRate: 10,          // Speed (frames per second)
                repeat: 0              // Loop forever
            });
        }
    }

    private createFloor(): void {
        this.floor = this.physics.add.staticGroup();    // 1. Create a Static Physics Group for the floor
        const yPos = this.scale.height - 50;            // Create the actual floor object x: center of screen, y: near bottom (adjust 50 to match your background art)
        const pavement = this.add.rectangle(this.scale.width / 2, yPos, this.scale.width, 30, 0x000000, 0);     // We use a Rectangle instead of a Sprite so we don't need a texture
        this.floor.add(pavement);                       // Add it to physics
        this.physics.add.collider(this.fallingItemsGroup,  this.floor,  this.onItemHitsFloor as  Phaser.Types.Physics.Arcade.ArcadePhysicsCallback , this.callBack, this);
    }

    private callBack(): boolean {
    return true; 
}
    
    private spawnCouple() {
        // 1. Get all couples that are currently "Asleep" (not busy)
        const availableCouples = this.couplesGroup.getChildren().filter(
            (c) => !(c as Couple).isBusy
        ) as Couple[];

        if (availableCouples.length > 0) {
            // 2. Pick a random one and wake it up
            const randomCouple = Phaser.Math.RND.pick(availableCouples);
            randomCouple.wakeUp();
        }
    }

    private scheduleNextSpawnBird() {
        const delay = this.levelManager.getSpawnInterval(); // Ask Manager: "How fast should I spawn right now?"

        this.time.addEvent({
            delay: delay,
            callback: () => {
                this.birdSpawnManager.spawnTick(this.levelManager, this.birdsGroup, this.couplesGroup);
                this.scheduleNextSpawnBird();       // RECURSION: Schedule the next one immediately after
            }
        });
    }   // THE RECURSIVE SPAWNER
 
    public spawnFallingObject(x:number, y:number, payload:ItemType) {
        const item = new FallingItem(this, x, y, payload, this.audioManager);
        this.fallingItemsGroup.add(item); // ADD IT TO THE GROUP manually
        item.startFalling();
    }

    public spawnDust(x: number, y: number, scale: number = 1.0) {
        // Spawn at the coordinates
        const dust = this.add.sprite(x, y, 'dust_atlas');
        
        // 1. Visual Variation
        dust.setScale(scale * Phaser.Math.FloatBetween(0.8, 1.2)); // Random size
        dust.setOrigin(0.5, 1); // Center)
      
        //dust.setAngle(Phaser.Math.Between(0, 360));                // Random rotation
        dust.setDepth(this.fallingItemsGroup.getFirstAlive()?.depth || 5); // Behind items?
        
        dust.setAlpha(Phaser.Math.FloatBetween(0.4, 0.8));
        dust.setFlipX(Math.random() < 0.5);
        dust.setTint(this.getRandomSlightTint());
        dust.play('dust-explosion');

        // 3. Cleanup
        dust.once('animationcomplete', () => {
            dust.destroy();
        });
    }
    
    private getRandomSlightTint(): number {
        // Pick a random value for Red, Green, and Blue individually
        // Keeping it above 200 ensures it stays "pastel" or "light"
        const r = Phaser.Math.Between(200, 255);
        const g = Phaser.Math.Between(200, 255);
        const b = Phaser.Math.Between(200, 255);

        // Phaser helper to combine R,G,B into a single number (e.g. 0xDDEEFF)
        return Phaser.Display.Color.GetColor(r, g, b);
    }   // Generates a random color between a min brightness and white,  e.g. min=200 makes it vary between Light Grey (0xC8C8C8) and White (0xFFFFFF)

    private shootWeapon() {
        const bullet = this.bulletsGroup.get();     // Get a "dead" bullet from the pool

        if (bullet) {
            const x = this.hero.x;
            const y = this.hero.getYPosGunshot();
            const direction = -1; // Right to left
            
            // Fire with the specific physics of the chosen weapon
            const gun:WeaponData = this.hero.getCurrentWeapon();
            bullet.setBulletTexture(gun.bulletTexture);
            bullet.fire(x, y, direction, gun);

             if (gun.bulletSound) {
                // Detune: Randomly shift pitch up or down by 100 cents (semitone)
                // This makes every impact sound slightly unique!
                this.audioManager.playSFX(gun.bulletSound, {
                    detune: Phaser.Math.Between(-200, 200),
                    volume: 0.1 // Or vary volume based on falling speed?
                });
            }
        }
    }
 
    private switchWeapon() {
        let weaponsOfThisLevel = LEVEL_MANIFEST[0].weapons;
        this.hero.selectNextWeapon(weaponsOfThisLevel);
        this.txtCurrentGun.setText(this.hero.getCurrentWeapon().name)
        this.buttonWeaponChoosing.changeBulletImage();
    }

    private onHitBulletBird(bullet: Bullet, bird: Bird) {
        const weaponData = bullet.getWeaponData();      // Get the weapon type from the bullet
        if (bullet.hasAlreadyHit(bird)) {   // Has this bullet already dealt with this specific bird?
            return; 
        }

        // Ask the bird: "Are you hurt by this weapon?"
        // (Using the logic we defined in Bird.ts earlier)
        const wasSuccessfulHit = bird.takeHit(weaponData);

        // Handle the Bullet
        if (wasSuccessfulHit) {
            bullet.setActive(false);
            bullet.setVisible(false);
            bullet.disableBody(true, true);
        } else {
            this.showImmuneText(bird.x, bird.y);
        }
    }

    private showImmuneText(x: number, y: number) {
        const text = this.add.text(x, y - 100, this.translate.instant('GAME_SCENE.IMMUNE'), 
        {
            fontFamily: this.dtc.strFontFamily,
            fontSize: '70px', 
            color: '#fff' 
        }).setOrigin(0.5);
            
        this.tweens.add({
            targets: text, y: y - 200, alpha: 0, duration: 1000,
            onComplete: () => text.destroy()
        });
    }

    private checkGameState() {
        const currentLove = this.loveGauge.getCurrentValue();
        if (currentLove <= 0) {
            this.loveGauge.updateValue(0);
            this.endGame(true);
        } else if (currentLove >= 100) {
            this.loveGauge.updateValue(100);
            this.endGame(false);
        }
    }

    private onItemHitCouple(couple: Couple, item: FallingItem) {
        if (item.isConsumed) {
            return; // Stop here! Do not run logic again.
        }

        // 1. CHECK COMPATIBILITY
        if (!couple.canBeHitBy(item)) {
            // Mismatch! (e.g., Safe hitting a Window)
            // Item passes through (ignore collision)
            return; 
        }

        if(item.itemData.movementStyle == 'balloon_float' 
            && item.getIsBaloonActive() == false
            && couple.coupleData.id == 'window_couple') {
            console.error('Should not harm the couple');
        }

        const body = item.body as Phaser.Physics.Arcade.Body;

        item.isConsumed = true;
        body.enable = false;      // DISABLE PHYSICS IMMEDIATELY - This removes it from the physics calculation for the rest of the frame

        const deltaValue = item.itemData.effectValue;
        this.loveGauge.updateValue(deltaValue);

        if (deltaValue < 0) {   // Visual Feedback
            // DAMAGE logic
            this.showFloatingText(item.x, item.y, `${Math.abs(deltaValue)}`, '#00ff00'); 
            couple.hitByFlyingObject();
            const shakeIntensity = deltaValue * 0.0005; // 20 * 0.001 = 0.02 (Strong), 5 * 0.001 = 0.005 (Weak)
            this.cameras.main.shake(100, shakeIntensity);
            this.loveGauge.spawnParticleEvil();

            let points = Math.abs(deltaValue * 10);
            this.upperPill.addScore(points);
        } else {
            this.showFloatingText(item.x, item.y, `${deltaValue}`, '#ff0000'); 
            couple.hitByLovePotion();
            this.loveGauge.spawnParticleLove();
        }

        if (item.itemData.soundHitCouple) {
            this.audioManager.playSFX(item.itemData.soundHitCouple, {
                detune: Phaser.Math.Between(-200, 200),
                volume: 1.0 // Or vary volume based on falling speed?
            });
        }

        item.destroy();

        const currentLove = this.loveGauge.getCurrentValue();   // Check Win Condition
        if (currentLove <= 0) {
            console.log('You won');
            this.loveGauge.updateValue(0);
            this.endGame(true);
        }  
        else if (currentLove >= 100) {
            console.log('You lost');
            this.loveGauge.updateValue(100);
            this.endGame(false);
        }
    }

    private onItemHitsFloor(obj1: any, obj2: any) {
        const fallingItem = obj1 as FallingItem;

        // --- THE FIX ---
        // Cast the body explicitly so TypeScript knows it is a Dynamic Body
        const body = fallingItem.body as Phaser.Physics.Arcade.Body;

        // 1. Stop Physics (Now using our typed 'body' variable)
        body.stop();
        body.checkCollision.none = true;
        body.enable = false;

        // 2. Stop the internal Sprite spin & get its angle
        const currentAngle = fallingItem.stopSpinning(); 
        
        // 3. Calculate Snap Angle
        let targetAngle = Math.round(currentAngle / 90) * 90;

        const isPotion = fallingItem.itemData.isPotion;

        // --- THE "NO UPSIDE DOWN" FIX ---
        if (isPotion && Math.abs(targetAngle) === 180) {
            targetAngle = (currentAngle > 0) ? 90 : -90;
        }

        // 4. Calculate Volume
        let linearRatio = (this.scale.height - fallingItem.getYStart()) / this.scale.height;
        linearRatio = Phaser.Math.Clamp(linearRatio, 0, 1);
        const curve = Math.pow(linearRatio, 2); 
        const minVol = 0.2;
        const finalVolume = minVol + (curve * (1 - minVol));

        // 5. Sound Trigger
        if (fallingItem.itemData.soundHitFloor) {
            this.audioManager.playSFX(fallingItem.itemData.soundHitFloor, {
                detune: Phaser.Math.Between(-200, 200),
                volume: finalVolume
            });
        }

        // --- DUST POSITION ---
        // Use the 'body' variable here too for cleaner code
        const impactY = body.bottom; 

        // IMPACT 1: BIG DUST
        this.spawnDust(fallingItem.x, impactY, 1.0);
        
        // 6. Animation Chain
        this.tweens.chain({
            targets: fallingItem,
            tweens: [
                // STEP A: Bounce UP & Snap Angle
                {
                    y: fallingItem.y - 40,
                    angle: targetAngle, 
                    duration: 150,
                    ease: 'Quad.easeOut'
                },
                // STEP B: Fall DOWN
                {
                    y: fallingItem.y, 
                    duration: 150,
                    ease: 'Quad.easeIn',
                    onComplete: () => {
                        // IMPACT 2: SMALL DUST
                        this.spawnDust(fallingItem.x, impactY, 0.4);
                    }
                },
                // STEP C: Fade Out
                {
                    alpha: 0,
                    duration: 1000,
                    delay: 500,
                    ease: 'Linear'
                }
            ],
            onComplete: () => {
                fallingItem.destroy();
            }
        });
    }

    private onHitBulletHitItem(bullet: Bullet, item: FallingItem) {
        // 1. Ask the item to check WHERE it was hit
        // We pass the global Y of the bullet
        const wasHit = item.checkHitCoordinates(bullet);

        // 2. Destroy the bullet if not balloon
        if(item.movementStyle != 'balloon_float')
            bullet.destroy();
        else
            console.log('BALLOON HIT');

        // 3. Note: We don't destroy the item here!
        // If wasHit === true, the item called popBalloon() internally.
        // If wasHit === false, the item called playRicochet() internally.
    }

    public pauseGame(): void {
        this.scene.pause();
        this.scene.launch('PauseScene');
    }

    private endGame(victory: boolean) {
        this.upperPill.stopTimer(); // Stop the clock!
        let strScene:string = '';

        if(victory) {
            strScene = 'SuccessScene';
        }
        else {
            strScene = 'GameOverScene';
        }
        
        this.scene.start(strScene, {
            score: this.score, 
            result: victory 
        });
    }

    public showFloatingText(startX:number, startY:number, txtValue:string, txtColor:string) {
        // Start Position: Near the Love Bar 
        // (Assuming Love Bar is Top-Left or Top-Center. Adjust these coords!)

        // 2. Create the Text
        const text = this.add.text(startX, startY, txtValue, {
            fontFamily: this.dtc.strFontFamily, 
            fontSize: '150px',
            fontStyle: 'bold',
            color: txtColor, 
            stroke: '#ffffff',
            strokeThickness: 6
        }).setOrigin(0.5).setScrollFactor(0); // Stick to camera (UI layer)

        // The "Sway" Animation
        // We want it to drift towards the center but slightly irregularly
        const targetX = this.scale.width / 2;
        const targetY = this.scale.height / 2;

        this.tweens.add({
            targets: text,
            
            // MOVEMENT: Move to center
            x: targetX,
            y: targetY,
            
            // ROTATION: Give it a slight spin as it falls (looks like debris)
            angle: { from: 0, to: Phaser.Math.Between(-20, 20) },
            
            // FADE: Visible at first, ghost at the end
            alpha: { from: 1, to: 0 },
            
            // SCALE: Shrink slightly as it goes away
            scale: { from: 1.5, to: 0.5 },
            
            duration: 1500, // 1.5 seconds flight time
            ease: 'Quad.easeIn', // Start slow, accelerate into the void
            
            onComplete: () => {
                text.destroy();
            }
        });
    }

    public getCurrentWeapon(): WeaponData {
        return this.hero.getCurrentWeapon();
    }
}
