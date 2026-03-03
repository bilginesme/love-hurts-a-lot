import * as Phaser from 'phaser';
import { GameScene } from '../scenes/GameScene';
import { DTC } from 'src/app/DTC';

export class DistantBuildings extends Phaser.GameObjects.Container {
    private dtc: DTC = new DTC();
    private readonly alphaWindow: number = 1.0;
    
    // The "ideal" number of lights to keep on
    private readonly TARGET_ACTIVE_COUNT = 15;

    private windowLocations: {x: number, y: number}[] = [
        {x:700, y:2077},    //  1
        {x:858, y:1997},    //  2
        {x:803, y:2046},    //  3   
        {x:837, y:2101},    //  4
        {x:856, y:2101},    //  5
        {x:608, y:2421},    //  6
        {x:634, y:2421},    //  7
        {x:698, y:2324},    //  8
        {x:773, y:2337},    //  9
        {x:780, y:2490},    // 10
        {x:816, y:2438},    // 11
        {x:901, y:2446},    // 12
        {x:924, y:2402},    // 13
        {x:981, y:2380},    // 14
        {x:1040, y:2278},   // 15
        {x:1208, y:2242},   // 16
        {x:1245, y:2320},   // 17
        {x:1180, y:2408},   // 18
        {x:1245, y:2476},   // 19
    ];
    
    // Fixed typo: 'winodws' -> 'windows'
    private windows: Phaser.GameObjects.Sprite[] = [];

    constructor(scene: GameScene, x: number, y: number) {
        super(scene, x, y);
        scene.add.existing(this);

        this.buildBackground();
        this.buildWindows();

        this.queueNextToggle(); // Start the organic flicker loop
    }

    private buildBackground(): void {
        const distantBuildingsBG = this.scene.add.sprite(0, 0, 'distant-buildings-bg').setOrigin(1.00, 1.0);
        this.add(distantBuildingsBG);
    }

    private buildWindows(): void {
        // 1. Create ALL windows initially (hidden)
        for (let i = 0; i < this.windowLocations.length; i++) {
            let strTexture: string = 'window-' + this.dtc.doubleDigit(i + 1);
            
            // Your logic for local position is correct
            const localX = this.windowLocations[i].x - this.x;
            const localY = this.windowLocations[i].y - this.y;

            const window = this.scene.add.sprite(localX, localY, strTexture)
                .setOrigin(0.5, 0.5)
                .setVisible(false) // Start hidden
                .setAlpha(this.alphaWindow);

            this.add(window);
            this.windows.push(window);
        }

        // 2. Randomly turn on exactly 15 windows to start
        // Add 'as number[]' to satisfy TypeScript ---
        const indices = Phaser.Utils.Array.NumberArray(0, this.windowLocations.length - 1) as number[];
        Phaser.Utils.Array.Shuffle(indices);

        // Turn on the first 15 from the shuffled list
        for(let i=0; i < this.TARGET_ACTIVE_COUNT; i++) {
            const index = indices[i];
            this.windows[index].setVisible(true);
        }
    }

    /**
     * Recursive function that schedules the next light change.
     * Uses random delays so it doesn't look like a robotic clock.
     */
    private queueNextToggle() {
        // Random time between toggles (0.2s to 1.2s)
        // Faster time = busier looking city
        const delay = Phaser.Math.Between(1000, 4000);

        this.scene.time.delayedCall(delay, () => {
            // Check if object is still alive (prevent crash if scene changed)
            if (this.active) {
                this.performToggle();
                this.queueNextToggle(); // Loop
            }
        });
    }

    /**
     * The Logic:
     * Decides whether to turn a light ON or OFF based on how close we are to 15.
     */
    private performToggle() {
        // Separate current state
        const visibleWindows = this.windows.filter(w => w.visible);
        const hiddenWindows = this.windows.filter(w => !w.visible);
        const currentCount = visibleWindows.length;

        let turnOn = false;

        // GRAVITY LOGIC:
        if (currentCount < this.TARGET_ACTIVE_COUNT) {
            // If we have fewer than 15, bias heavily towards turning ON (80%)
            turnOn = Math.random() < 0.8;
        } 
        else if (currentCount > this.TARGET_ACTIVE_COUNT) {
            // If we have more than 15, bias heavily towards turning OFF (80%)
            turnOn = Math.random() < 0.2;
        } 
        else {
            // If we have exactly 15, flip a coin (50/50).
            // This allows the count to drift naturally to 14 or 16 briefly.
            turnOn = Math.random() < 0.5;
        }

        // EXECUTE
        if (turnOn && hiddenWindows.length > 0) {
            // Pick a random dark window and light it up
            const victim = Phaser.Math.RND.pick(hiddenWindows);
            victim.setVisible(true);
        } 
        else if (!turnOn && visibleWindows.length > 0) {
            // Pick a random lit window and turn it off
            const victim = Phaser.Math.RND.pick(visibleWindows);
            victim.setVisible(false);
        }
    }
}