export class AudioOwnerManager {
  private static instance: AudioOwnerManager | null = null;

  private currentOwner: string | null = null;
  private revokeCurrentOwner: (() => void) | null = null;

  static getInstance(): AudioOwnerManager {
    if (!AudioOwnerManager.instance) {
      AudioOwnerManager.instance = new AudioOwnerManager();
    }

    return AudioOwnerManager.instance;
  }

  claim(cardId: string, onRevoked: () => void): void {
    if (this.currentOwner && this.currentOwner !== cardId) {
      const previousRevoke = this.revokeCurrentOwner;
      this.currentOwner = null;
      this.revokeCurrentOwner = null;

      try {
        previousRevoke?.();
      } catch {
        // Keep manager stable even if consumer cleanup throws.
      }
    }

    this.currentOwner = cardId;
    this.revokeCurrentOwner = onRevoked;
  }

  release(cardId: string): void {
    if (this.currentOwner !== cardId) {
      return;
    }

    this.currentOwner = null;
    this.revokeCurrentOwner = null;
  }

  getCurrentOwner(): string | null {
    return this.currentOwner;
  }
}

const audioOwnerManager = AudioOwnerManager.getInstance();

export default audioOwnerManager;
