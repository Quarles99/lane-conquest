/*
  SOUND SYSTEM
  - Web Audio API based procedural sound effects
  - No external audio files needed
*/

class SoundSystem {
  private audioContext: AudioContext | null = null;
  private masterVolume = 0.1; // Further reduced volume
  private enabled = true;
  private lastSoundTime: Record<string, number> = {};
  private soundThrottle = 100; // Increased throttling to 100ms
  private noiseBuffer: AudioBuffer | null = null;

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

  private getNoiseBuffer(): AudioBuffer {
    if (!this.noiseBuffer) {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 0.1; // Pre-generate 0.1s of noise
      this.noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }
    return this.noiseBuffer;
  }

  private playNoise(duration: number, volume: number = 0.1) {
    if (!this.enabled) return;
    
    try {
      const ctx = this.getContext();
      const noise = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      noise.buffer = this.getNoiseBuffer(); // Use pre-generated buffer
      noise.connect(gainNode);
      gainNode.connect(ctx.destination);

      gainNode.gain.setValueAtTime(volume * this.masterVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

      noise.start(ctx.currentTime);
      noise.stop(ctx.currentTime + duration);
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
    if (!this.canPlaySound('gold')) return;
    this.playTone(1000, 0.08, 'sine', 0.1);
  }

  techUpgrade() {
    if (!this.canPlaySound('upgrade')) return;
    this.playTone(800, 0.2, 'sine', 0.2);
  }

  heroRespawn() {
    if (!this.canPlaySound('respawn')) return;
    this.playTone(600, 0.3, 'sine', 0.25);
  }

  // Game events
  victory() {
    this.playTone(1000, 0.5, 'sine', 0.3);
  }

  defeat() {
    this.playTone(300, 0.6, 'sawtooth', 0.25);
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
