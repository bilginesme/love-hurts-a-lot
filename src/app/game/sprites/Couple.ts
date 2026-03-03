import { COUPLE_MANIFEST, CoupleData, CoupleType } from "../types/CoupleConfig";
import { ItemData } from "../types/ItemConfig";
import { FallingItem } from "./FallingItem";

export default class Couple extends Phaser.Physics.Arcade.Sprite {
    public isBusy: boolean = false; // To prevent double-spawning
    public coupleData:CoupleData;
    private timerEvent!: Phaser.Time.TimerEvent;

    constructor(scene: Phaser.Scene, x: number, y: number, coupleType: CoupleType) {
        super(scene, x, y, 'couple');

        this.coupleData = COUPLE_MANIFEST[coupleType];

        this.updateTexture();

        // Start completely hidden and disabled
        this.setAlpha(0);
        this.setOrigin(0.5, 1.0);
    }

    private updateTexture(): void {
        this.setTexture(this.coupleData.textureNormal);
    }

    wakeUp() {
        if (this.isBusy) return;
        this.isBusy = true;
        
        this.updateTexture();

        // 1. Enable Physics immediately (so they can be hit)
        // Note: enableBody(reset, x, y, enableGameObject, showGameObject)
        this.enableBody(false, 0, 0, true, true); 
        
        // 2. Fade In Animation
        this.scene.tweens.add({
            targets: this,
            alpha: 1,
            duration: 1000,
            onComplete: () => {
                // 3. Start the "Stay Timer" (e.g., stay for n seconds)
                this.timerEvent = this.scene.time.delayedCall(20000, () => {
                    this.fadeOut();
                });
            }
        });
    }

    fadeOut() {
        // Cancel timer if we force-called this (e.g. game over)
        if (this.timerEvent) this.timerEvent.remove();

        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            duration: 500,
            onComplete: () => {
                // Go back to sleep
                this.disableBody(true, true);
                this.isBusy = false;
            }
        });
    }
    
    public hitByFlyingObject() {
        this.setTexture(this.coupleData.textureHit);
        // Maybe wait 1 second then fade out?
        this.scene.time.delayedCall(500, () =>
        {
            this.fadeOut();
            this.setTexture(this.coupleData.textureNormal);
        });
    }

    public hitByLovePotion() {
        this.setTexture(this.coupleData.textureLove);
        this.scene.time.delayedCall(500, () =>
        {
            this.fadeOut();
            this.setTexture(this.coupleData.textureNormal);
        } 
        );
    }

    public canBeHitBy(item: FallingItem): boolean {
        let canBeHit: boolean = false;

        if(this.coupleData.vulnerableTo === item.itemData.movementStyle)
            canBeHit = true;

        if (item.itemData.movementStyle == 'balloon_float' 
            && item.getIsBaloonActive() == false
            && this.coupleData.id == 'window_couple') {
                canBeHit = false;
            }

        if(item.y < this.y) {
            console.log('THIS SOULD NOT BE HAPPENING');
            canBeHit = false;
        }
  
        return canBeHit;
    }

    public getPosition() : {x:number, y:number} {
        return {x: this.x, y: this.y};
    }
}