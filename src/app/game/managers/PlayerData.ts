export class PlayerData {
    private static readonly STORAGE_KEY = 'love_hurts_save_v1';

    // Get the highest unlocked level (Default: 1)
    static getMaxLevel(): number {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        return saved ? parseInt(saved, 10) : 1;
    }

    // Unlock a new level (only if it's higher than current)
    static unlockLevel(levelId: number) {
        const currentMax = this.getMaxLevel();
        if (levelId > currentMax) {
            localStorage.setItem(this.STORAGE_KEY, levelId.toString());
        }
    }
}