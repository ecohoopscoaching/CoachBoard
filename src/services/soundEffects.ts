// Web Audio API procedural synthesizer for basketball sound effects
// Optimized with non-blocking async audio execution for sub-16ms INP

class SoundEffectsService {
  private audioCtx: AudioContext | null = null;
  private isMuted: boolean = false;

  private getAudioContext(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      try {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.audioCtx = new AudioCtxClass();
        }
      } catch {
        return null;
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Non-blocking whistle sound effect
  public playWhistle(): void {
    if (this.isMuted) return;
    setTimeout(() => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc2.type = 'sine';

        osc1.frequency.setValueAtTime(2600, now);
        osc2.frequency.setValueAtTime(2900, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(35, now);
        lfoGain.gain.setValueAtTime(150, now);

        lfo.connect(osc1.frequency);
        lfo.connect(osc2.frequency);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.03);
        gain.gain.setValueAtTime(0.2, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        lfo.start(now);
        osc1.start(now);
        osc2.start(now);

        lfo.stop(now + 0.45);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      } catch {
        // Silent fallback
      }
    }, 0);
  }

  // Non-blocking bounce sound
  public playBounce(): void {
    if (this.isMuted) return;
    setTimeout(() => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.09);
      } catch {
        // Silent fallback
      }
    }, 0);
  }

  // Non-blocking swish sound
  public playSwish(): void {
    if (this.isMuted) return;
    setTimeout(() => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const bufferSize = Math.floor(ctx.sampleRate * 0.2);
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(1200, now);
        bandpass.frequency.linearRampToValueAtTime(2500, now + 0.12);
        bandpass.Q.setValueAtTime(2, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.2, now + 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        noise.connect(bandpass);
        bandpass.connect(gain);
        gain.connect(ctx.destination);

        noise.start(now);
        noise.stop(now + 0.2);
      } catch {
        // Silent fallback
      }
    }, 0);
  }

  // Non-blocking UI button click snap (< 1ms execution time)
  public playClick(): void {
    if (this.isMuted) return;
    setTimeout(() => {
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.025);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 0.025);
      } catch {
        // Silent fallback
      }
    }, 0);
  }
}

export const soundEffects = new SoundEffectsService();
