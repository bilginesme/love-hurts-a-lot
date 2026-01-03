// types/GameSettings.ts
export interface GameSettings {
    sfxVolume: number;
    musicVolume: number;
    isMuted: boolean;
}

export const DEFAULT_SETTINGS: GameSettings = {
    sfxVolume: 0.8,
    musicVolume: 0.5,
    isMuted: false
};