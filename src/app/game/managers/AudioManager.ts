// managers/AudioManager.ts
import * as Phaser from 'phaser';
import { Preferences } from '@capacitor/preferences'; // <--- IMPORT THIS
import { GameSettings, DEFAULT_SETTINGS } from '../types/GameSettings';

export class AudioManager {
    private scene: Phaser.Scene;
    private currentMusic: Phaser.Sound.BaseSound | null = null;

    // State
    private sfxVolume: number = 0;
    private musicVolume: number = 0;
    private isMuted: boolean = false;
    
    // Key for storage
    private readonly STORAGE_KEY = 'love_hurts_settings';

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        
        // 1. Initialize immediately with defaults (so game doesn't crash)
        this.applyGlobalMute();

        // 2. Load saved data asynchronously
        this.loadSettings();
    }

    private async loadSettings() {
        const { value } = await Preferences.get({ key: this.STORAGE_KEY });
        
        if (value) {
            // A. User has saved settings
            const savedSettings = JSON.parse(value) as GameSettings;
            this.sfxVolume = savedSettings.sfxVolume;
            this.musicVolume = savedSettings.musicVolume;
            this.isMuted = savedSettings.isMuted;
        } else {
            // B. First time playing (No save)
            // We must manually apply the defaults now
            this.sfxVolume = DEFAULT_SETTINGS.sfxVolume;
            this.musicVolume = DEFAULT_SETTINGS.musicVolume;
            this.isMuted = DEFAULT_SETTINGS.isMuted;
        }

        // C. APPLY THE VOLUME
        // Now that we know the "Real" volume, apply it.
        this.applyGlobalMute();
        
        if (this.currentMusic && this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
            // Optional: Add a tiny fade-in for extra polish
            this.scene.tweens.add({
                targets: this.currentMusic,
                volume: this.musicVolume,
                duration: 500 // Fade in over 0.5 seconds
            });
            // Or just set it instantly:
            // (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
        }
    }

    /**
     * SAVE: Write to Capacitor Preferences
     */
    private async saveSettings() {
        const settings: GameSettings = {
            sfxVolume: this.sfxVolume,
            musicVolume: this.musicVolume,
            isMuted: this.isMuted
        };

        await Preferences.set({
            key: this.STORAGE_KEY,
            value: JSON.stringify(settings)
        });
    }

    public playSFX(key: string | undefined, extraConfig: Phaser.Types.Sound.SoundConfig = {}) {
        if (this.isMuted || !key || key === 'none') return;
        if (!this.scene.cache.audio.exists(key)) return;

        // 1. Calculate the final volume
        // Default to 1.0 (Full Master Volume) if no specific volume is requested
        const requestedScale = extraConfig.volume !== undefined ? extraConfig.volume : 1.0;
        
        // The actual volume is Master Setting * Requested Scale
        const finalVolume = this.sfxVolume * requestedScale;

        // 2. Create the final config
        const config: Phaser.Types.Sound.SoundConfig = {
            ...extraConfig,     // Apply other settings (detune, loop, etc.) first
            volume: finalVolume // Ensure our calculated volume wins
        };

        // console.log(`Playing ${key}: Master(${this.sfxVolume}) * Scale(${requestedScale}) = ${finalVolume}`);

        this.scene.sound.play(key, config);
    }

    public playMusic(key: string) {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }

        // Start playing immediately, but use the current 'musicVolume'
        // If settings haven't loaded yet, this will be 0 (Silent).
        // When settings finish loading (100ms later), the code above will fade it up.
        if (this.scene.cache.audio.exists(key)) {
            this.currentMusic = this.scene.sound.add(key, {
                volume: this.musicVolume, // Starts at 0, then ramps up
                loop: true
            });
            
            if (!this.isMuted) {
                this.currentMusic.play();
            }
        }
    }

    public stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
    }

    /**
     * Toggle Mute and SAVE
     */
    public toggleMute(): boolean {
        this.isMuted = !this.isMuted;
        this.applyGlobalMute();
        this.saveSettings(); // <--- Auto Save
        return this.isMuted;
    }

    private applyGlobalMute() {
        this.scene.sound.mute = this.isMuted;
        
        // Edge case: If we unmute, ensure music starts playing if it was paused
        if (!this.isMuted && this.currentMusic && !this.currentMusic.isPlaying) {
             this.currentMusic.play();
        }
    }

    /**
     * Set specific volumes (e.g. from a Slider in Settings Menu)
     */
    public setVolumes(sfx: number, music: number) {
        this.sfxVolume = sfx;
        this.musicVolume = music;
        
        // Apply to currently playing music
        if (this.currentMusic && this.currentMusic instanceof Phaser.Sound.WebAudioSound) {
            (this.currentMusic as Phaser.Sound.WebAudioSound).setVolume(this.musicVolume);
        }

        this.saveSettings(); // <--- Auto Save
    }
    
    // Getters for UI
    public getValues() {
        return {
            sfx: this.sfxVolume,
            music: this.musicVolume,
            muted: this.isMuted
        };
    }
}