import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import  Bird  from '../sprites/Bird';
import  Couple  from '../sprites/Couple';
import { BIRD_MANIFEST, BirdData, BirdNature, BirdType, DropCapability } from '../types/BirdConfig';
import { LEVEL_MANIFEST } from '../types/LevelConfig';
import { ITEM_MANIFEST, ItemType } from '../types/ItemConfig';
import { LevelManager } from './LevelManager';

interface FlightLane {
    id: string;      // "roof", "mid_gap", "street_level"
    minY: number;    // Top boundary of this lane
    maxY: number;    // Bottom boundary of this lane
}

// These numbers depend on your specific Background Art pixels!
export const SKY_LANES: FlightLane[] = [
    { 
        id: 'above_balcony', 
        minY: 290, 
        maxY: 390, 
    },
    { 
        id: 'third-floor', 
        minY: 800, 
        maxY: 900 
    },
    { 
        id: 'second-floor', 
        minY: 1330, 
        maxY: 1430 
    },
    { 
        id: 'first-floor', 
        minY: 1750, 
        maxY: 1850 
    }
];

export class BirdSpawnManager {
   private scene: GameScene;
   private laneBag: FlightLane[] = [];
   private levelManager!: LevelManager;
   private birdsGroup!: Phaser.Physics.Arcade.Group;
   private couplesGroup!: Phaser.Physics.Arcade.Group;

   // Dependencies we need to do our job
   constructor(scene: GameScene) {
      this.scene = scene;
   }

   // The only public method the Scene needs to call
   public spawnTick(levelManager: LevelManager, birdsGroup: Phaser.Physics.Arcade.Group, couplesGroup: Phaser.Physics.Arcade.Group): void {
      this.levelManager = levelManager;
      this.birdsGroup = birdsGroup;
      this.couplesGroup = couplesGroup;

      const evilRatio = levelManager.getEvilRatio();
      const wantLoveBird = Math.random() > evilRatio;

      if (wantLoveBird) {
         const success = this.trySpawnLoveBird();
         if (success) return;
      }

      this.spawnEvilBird();
   }
    
   /**
   * INTELLIGENT SPAWNER
   * Scans the board for a valid Tuple: { Couple, Lane, Item }
   */
   private trySpawnLoveBird(): boolean {
      const MIN_DROP_DISTANCE = 300; // Your safety threshold
      const candidates: any[] = [];

      const activeCouples = this.couplesGroup.getChildren() as Couple[];
      const loveItems = this.levelManager.getAllowedLoveItems();

      // PHASE 1: FIND ALL VALID CANDIDATES
      // Iterate ALL couples to find who can be hit
      for (const couple of activeCouples) {
         if (!couple.active || !couple.visible) continue;

         // 1. What move style does this couple need? (e.g., 'balloon_float')
         const reqMoveStyle = couple.coupleData.vulnerableTo;

         // 2. Do we have a matching item in this level's allowed list?
         const validItems = loveItems.filter((key: ItemType) => {
            return ITEM_MANIFEST[key].movementStyle === reqMoveStyle;
         });
         
         if (validItems.length === 0) continue; // Skip: No valid ammo for this couple

         // 3. Find Lanes that are high enough for this specific couple
         for (const lane of SKY_LANES) {
            // Check the lane's LOWEST point vs Couple
            // (being conservative ensures safety)
            const heightDiff = couple.y - lane.maxY; 
            
            if (heightDiff >= MIN_DROP_DISTANCE) {
               // FOUND A MATCH!
               candidates.push({
                     couple: couple,
                     lane: lane,
                     validItems: validItems,
                     coupleType: couple.coupleData.id
               });
            }
         }
      }

      // PHASE 2: EXECUTE
      if (candidates.length === 0) return false; // Fail gracefully

      // Pick a random valid scenario
      const choice = Phaser.Math.RND.pick(candidates);
      
      // Setup Data
      var dropCapability: DropCapability = 'standard';
      if(choice.coupleType == 'window_couple') {
         dropCapability = 'balloon';
      }
      const birdData = this.getRandomBird(BirdNature.LOVE, dropCapability);
      const payload = Phaser.Math.RND.pick(choice.validItems);
      
      // Random Y within the VALID lane
      const laneY = Phaser.Math.Between(choice.lane.minY, choice.lane.maxY);
      const speed = Phaser.Math.Between(birdData!.speed - 50, birdData!.speed + 50);
      const direction = Phaser.Math.RND.pick([1, -1]);

      // Spawn
      const bird = this.birdsGroup.get();
      if (bird) {
            bird.spawn(laneY, speed, direction, birdData, payload, choice.couple.x);
            return true;
      }
      
      return false;
   }
    
   /**
   * STANDARD SPAWNER
   * Uses "Fair Lane" logic
   */
   private spawnEvilBird() {
      const birdData = this.getRandomBird(BirdNature.EVIL, 'standard');
      if (!birdData) return;

      const bird = this.birdsGroup.get();
      if (!bird) return;

      // Use Shuffle Bag for fairness
      const lane = this.getFairLane(); 
      const laneY = Phaser.Math.Between(lane.minY, lane.maxY);
      
      const evilItems = this.levelManager.getAllowedEvilItems();
      const payload = Phaser.Math.RND.pick(evilItems);

      const speed = Phaser.Math.Between(birdData.speed - 50, birdData.speed + 50);
      const direction = Phaser.Math.RND.pick([1, -1]);

      // Evil birds usually don't target specific X, or they target random couples?
      // Let's assume they target random X or player position
      // If you want them to target couples too, you can use similar logic to above,
      // but usually Evil birds just creating chaos is fine.
      const targetX = Phaser.Math.Between(200, 1600); // Or specific logic

      bird.spawn(laneY, speed, direction, birdData, payload, targetX);
   }
    
   private getFairLane(): any {
      // 1. Refill if empty
      if (this.laneBag.length === 0) {
            // Create a shallow copy of all lanes
            this.laneBag = [...SKY_LANES]; 
            // Shuffle them (Phaser's shuffle is great)
            Phaser.Utils.Array.Shuffle(this.laneBag);
      }
      // 2. Take the next one
      return this.laneBag.pop();
   }

   private getRandomBird(nature: BirdNature, requiredCapability: DropCapability): BirdData | null {
      const currentLevel = LEVEL_MANIFEST[0];
      const currentPhase = currentLevel.phases[0];
      
      // Filter valid keys
      const allowedKeys = currentPhase.allowedBirds;
      const candidates = allowedKeys.filter((key: BirdType) => {
         const bird = BIRD_MANIFEST[key];
         return bird.nature === nature && 
               (bird.capability === requiredCapability || bird.capability === 'all');
      });

      if (candidates.length === 0) 
         return null;
      
      const selectedKey = Phaser.Math.RND.pick(candidates);    // Pick a key
      return BIRD_MANIFEST[selectedKey];     // Return the DATA object directly
   }
}