// ui/SettingsSlider.ts
import * as Phaser from 'phaser';

export class SettingsSlider extends Phaser.GameObjects.Container {
    private bg: Phaser.GameObjects.Sprite;
    private fill: Phaser.GameObjects.Sprite;
    private knob: Phaser.GameObjects.Sprite;
    
    private trackLength: number;
    private currentValue: number; // 0.0 to 1.0
    private onValueChange: (value: number) => void;
    private lastClickX: number = 0;

    private minDragX: number; // Left limit
    private maxDragX: number; // Right limit
    private dragRange: number; // The distance between Min and Max

    constructor(
        scene: Phaser.Scene, 
        x: number, 
        y: number, 
        initialValue: number = 0.5,
        callback: (value: number) => void
    ) {
        super(scene, x, y);
        scene.add.existing(this);
        
        this.currentValue = initialValue;
        this.onValueChange = callback;

        // 1. Setup Background
        // Origin (0, 0.5) makes math easier: X=0 is the start of the bar
        this.bg = scene.add.sprite(0, 0, 'slider_bg').setOrigin(0, 0.5);
        
        // 2. Setup Fill (The Orange Fluid)
        // It sits exactly on top of the BG
        this.fill = scene.add.sprite(0, 0, 'slider_fill').setOrigin(0, 0.5)
        
        // 3. Setup Knob
        this.knob = scene.add.sprite(0, 0, 'slider_knob').setOrigin(0.5, 0.5);
        this.knob.setInteractive({ cursor: 'pointer', draggable: true });

        // Add to container
        this.add([this.bg, this.fill, this.knob]);

        // Calculate Track Physics
        // We assume the track is the width of the background image
        this.trackLength = this.bg.width;
   
        // 1. DEFINE BOTH LIMITS
        // Example: 10% padding on Left, 90% limit on Right
        this.minDragX = this.bg.width * 0.15; 
        this.maxDragX = this.bg.width * 0.85; 
        
        // Calculate the total draggable distance
        this.dragRange = this.maxDragX - this.minDragX;

        // INITIALIZE VISUALS
        this.updateVisuals();

        // --- INTERACTION LOGIC ---

        // A. Handle Dragging
        this.knob.on('drag', (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
            // 2. CLAMP TO BOTH SIDES
            const clampedX = Phaser.Math.Clamp(dragX, this.minDragX, this.maxDragX);
            
            this.knob.x = clampedX;
            this.updateValueFromPosition(clampedX);

            if (Math.abs(this.knob.x - this.lastClickX) > 30) {
            this.scene.sound.play('tick', { volume: 0.2, rate: 2.0 }); // High pitch tick
            this.lastClickX = this.knob.x;
        }
        });

        // B. Handle Clicking
        this.bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            const localX = pointer.x - this.x; 
            const clampedX = Phaser.Math.Clamp(localX, this.minDragX, this.maxDragX);
            
            this.knob.x = clampedX;
            this.updateValueFromPosition(clampedX);
        });

    }

    private updateValueFromPosition(x: number) {
        // 3. NORMALIZE THE VALUE
        // We subtract minDragX so that "0%" starts at the left margin, not at pixel 0
        const relativeX = x - this.minDragX;
        
        this.currentValue = relativeX / this.dragRange;
        
        // Safety clamp
        this.currentValue = Phaser.Math.Clamp(this.currentValue, 0, 1);
        
        this.updateFillCrop();
        
        if (this.onValueChange) {
            this.onValueChange(this.currentValue);
        }
    }

    private updateVisuals() {
        // 4. MAP VALUE BACK TO POSITION
        // Start at minDragX, then add the relative distance
        const xPos = this.minDragX + (this.currentValue * this.dragRange);
        
        this.knob.x = xPos;
        this.updateFillCrop();
    }

    private updateFillCrop() {
        // 5. CROP LOGIC
        // We just want the orange bar to end exactly where the knob is.
        // So we can simply use the knob's current X position as the width.
        this.fill.setCrop(0, 0, this.knob.x, this.fill.height);
    }
    
    // Allow setting value externally (e.g. from loaded save data)
    public setValue(val: number) {
        this.currentValue = Phaser.Math.Clamp(val, 0, 1);
        this.updateVisuals();
    }
}