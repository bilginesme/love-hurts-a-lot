
import { GameScene } from "../scenes/GameScene";
import { BirdData, BirdNature, BirdType } from "../types/BirdConfig";
import { ITEM_MANIFEST, ItemType } from "../types/ItemConfig";
import { WeaponData } from "../types/WeaponConfig";

export default class Bird extends Phaser.Physics.Arcade.Sprite {
    // You can store the "item" it is carrying as a property
    private dropTargetX: number | null = null;
    private hasDropped: boolean = false;
    private theScene!: GameScene;
    private payload!:ItemType;
    public birdData!: BirdData;
    private isEscaping: boolean = false; // Flag to stop movement logic if escaping

    // NEW: The Visual Representation of the cargo
    private cargoSprite: Phaser.GameObjects.Sprite;

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y, 'stork_atlas', '01.png');
        this.theScene = scene;

        this.setDepth(10);
        // 1. Create the Cargo Sprite (No Physics, purely visual)
        this.cargoSprite = scene.add.sprite(x, y, '');
        this.cargoSprite.setVisible(false);
        
        // IMPORTANT: Cargo must be rendered *behind* the bird? 
        // Or in front? Usually behind looks better for holding items.
        this.cargoSprite.setDepth(this.depth - 1);
    }
 
    spawn(y: number, speed: number, direction: number, birdData: BirdData, payload:ItemType, targetX?: number) {
        this.payload = payload;
        this.birdData = birdData;

        // 1. Assign the Mission
        this.dropTargetX = targetX !== undefined ? targetX : null;
        this.hasDropped = false;

        // 1. Determine Start X based on direction
        // If direction is 1 (Right), start at -50. If -1 (Left), start at ScreenWidth + 50
        const startX = direction === 1 ? -50 : this.scene.scale.width + 50;
 
        this.setTexture(birdData.texture, birdData.frame);
        const width = this.width;   // Get the original dimensions of the texture
        const height = this.height;
        const hitWidth = width * birdData.physics.hitWidthFactor; 
        const hitHeight = height * birdData.physics.hitHeightFactor;
        (this.body as Phaser.Physics.Arcade.Body).setSize(hitWidth, hitHeight);
        const offsetX = (width - hitWidth) / 2;
        const offsetY = height * birdData.physics.offsetYFactor;
        (this.body as Phaser.Physics.Arcade.Body).setOffset(offsetX, offsetY);
        this.body!.reset(startX, y);

        if(birdData.tint)
            this.setTint(birdData.tint);    
        this.play(birdData.animKey); 

        this.setActive(true);
        this.setVisible(true);
        this.setVelocityX(speed * direction);
        this.setFlipX(direction === 1); // Face the way we are flying
        
        this.updateCargoVisuals();      // --- NEW: SETUP CARGO VISUALS ---
        this.setDepth(302);

        // (Optional) Randomize start time so birds don't flap perfectly in sync
        //this.anims.play('stork_fly', true, Phaser.Math.Between(1, 100));
    }

    
    private updateCargoVisuals() {
        // 1. Check if we are carrying nothing
        if (this.payload === 'none') {
            this.cargoSprite.setVisible(false);
            return;
        }

        // 2. Get the texture from your Manifest
        const itemData = ITEM_MANIFEST[this.payload];
        if (itemData) {
            this.cargoSprite.setTexture(itemData.texture);
            this.cargoSprite.setVisible(true);
            this.cargoSprite.setActive(true);
            
            // Scale it down so it looks like a package
            this.cargoSprite.setScale(0.5); 
            
            // Reset rotation (in case it was spinning from a previous life)
            this.cargoSprite.setRotation(0);
        }
    }
    
    private dropItem() {
        if(this.payload !== 'none' && !this.hasDropped) {
            this.hasDropped = true;
            this.dropTargetX = null; 
            
            // 1. Spawn the Real Physics Item
            this.theScene.spawnFallingObject(this.x, this.y + 30, this.payload);
            
            // 2. Hide the Fake Cargo (It has "fallen")
            this.cargoSprite.setVisible(false);
        }
        
        // Bird flies away
        this.setVelocityY(-900); 
    }

    override preUpdate(time: number, delta: number) {
        super.preUpdate(time, delta);

        // Auto-kill logic
        if (this.x > this.scene.scale.width + 100 || this.x < -100 || this.y < -100) {
            this.setActive(false);
            this.setVisible(false);
            this.cargoSprite.setVisible(false); // Hide cargo too
        }

        // --- NEW: SYNC CARGO POSITION ---
        if (this.cargoSprite.visible) {
            // "Glue" the cargo to the bird's feet
            // Adjust the '+ 40' Y-offset to match your stork art
            this.cargoSprite.setPosition(this.x, this.y + 40);
            
            // Optional: Swing effect?
            // this.cargoSprite.setRotation(Math.sin(time / 200) * 0.2);
        }

        // Drop Trigger Check
        if (this.dropTargetX !== null && !this.hasDropped) {
            const distance = Math.abs(this.x - this.dropTargetX);
            if (distance < 10) { 
                this.dropItem();
            }
        }
    }
    
    // IMPORTANT: When bird is destroyed/killed, clean up the sprite
    override destroy(fromScene?: boolean) {
        this.cargoSprite.destroy();
        super.destroy(fromScene);
    }

    public getPayload():string {
        return this.payload;
    }

    public takeHit(weaponData: WeaponData): boolean {
        // A. CHECK THE LIST
        // "Does my vulnerableTo list include this weapon?"
        if (!this.birdData.vulnerableTo.includes(weaponData.id)) {
            return false; // Result: IMMUNE
        }

        // B. APPLY DAMAGE
        if (this.birdData.hitReaction === 'drop_escape') {
            this.dropItem(); // Witch behavior
        } else {
            this.dropItem();          // Standard behavior
            //this.explode();           // Stork/Seagull behavior
        }

        return true; // Result: HIT
    }
}