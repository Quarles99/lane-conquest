/*
  SOUND SYSTEM
  - Web Audio API based procedural sound effects
  - No external audio files needed
*/

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.15; // Reduced volume
  private enabled = true;
  private lastSoundTime: Record<string, number> = {};
  private soundThrottle = 50; // Minimum ms between same sounds

  private getContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  private canPlaySound(soundId: string): boolean {
    const now = Date.now();
    const lastTime = this.lastSoundTime[soundId] || 0;
    if (now - lastTime < this.soundThrottle) return false;
    this.lastSoundTime[soundId] = now;
    return true;
  }

  private playTone(frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3, soundId?: string) {
    if (!this.enabled) return;
    if (soundId && !this.canPlaySound(soundId)) return;
    
    try {
      const ctx = this.getContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }

  private playNoise(duration: number, volume: number = 0.1) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      noise.buffer = buffer;
      noise.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      noise.start(ctx.currentTime);
    } catch (e) {
      console.warn('Noise playback failed:', e);
    }
  }

  // Combat sounds
  arrowShot() {
    if (!this.canPlaySound('arrow')) return;
    this.playTone(800, 0.1, 'sine', 0.15);
  }

  swordHit() {
    if (!this.canPlaySound('sword')) return;
    this.playNoise(0.08, 0.15);
    this.playTone(150, 0.1, 'square', 0.1);
  }

  magicCast() {
    if (!this.canPlaySound('magic')) return;
    this.playTone(1200, 0.2, 'sine', 0.15);
  }

  unitDeath() {
    if (!this.canPlaySound('death')) return;
    this.playTone(200, 0.3, 'sawtooth', 0.15);
  }

  towerAttack() {
    if (!this.canPlaySound('tower')) return;
    this.playTone(400, 0.15, 'triangle', 0.15);
  }

  // UI sounds
  unitSpawn() {
    if (!this.canPlaySound('spawn')) return;
    this.playTone(600, 0.1, 'sine', 0.1);
  }

  goldCollect() {
    this.playTone(1000, 0.08, 'sine', 0.1);
    setTimeout(() => this.playTone(1200, 0.08, 'sine', 0.08), 40);
  }

  techUpgrade() {
    this.playTone(800, 0.15, 'sine', 0.2);
    setTimeout(() => this.playTone(1000, 0.15, 'sine', 0.18), 80);
    setTimeout(() => this.playTone(1200, 0.2, 'sine', 0.15), 160);
  }

  heroRespawn() {
    this.playTone(600, 0.2, 'sine', 0.25);
    setTimeout(() => this.playTone(900, 0.2, 'sine', 0.2), 100);
    setTimeout(() => this.playTone(1200, 0.25, 'sine', 0.18), 200);
  }

  // Game events
  victory() {
    this.playTone(800, 0.3, 'sine', 0.3);
    setTimeout(() => this.playTone(1000, 0.3, 'sine', 0.28), 150);
    setTimeout(() => this.playTone(1200, 0.4, 'sine', 0.25), 300);
  }

  defeat() {
    this.playTone(400, 0.4, 'sawtooth', 0.25);
    setTimeout(() => this.playTone(300, 0.5, 'sawtooth', 0.2), 200);
  }

  buildingDamage() {
    this.playNoise(0.2, 0.25);
    this.playTone(100, 0.3, 'square', 0.2);
  }

  // Volume control
  setVolume(volume: number) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

// Global sound system instance
export const soundSystem = new SoundSystem();
