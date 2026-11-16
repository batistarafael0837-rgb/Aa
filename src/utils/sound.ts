class SoundController {
  private ctx: AudioContext | null = null;
  public muted = false;

  private getContext(): AudioContext | null {
    if (this.muted || typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = "sine", gainVal = 0.06, delay = 0) {
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(gainVal, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.playTone(540, 0.05, "triangle", 0.03);
  }

  playStepComplete() {
    this.playTone(523.25, 0.1, "sine", 0.05, 0);
    this.playTone(659.25, 0.14, "sine", 0.05, 0.07);
  }

  playMissionWin() {
    this.playTone(523.25, 0.12, "triangle", 0.06, 0);
    this.playTone(659.25, 0.12, "triangle", 0.06, 0.09);
    this.playTone(783.99, 0.14, "triangle", 0.06, 0.18);
    this.playTone(1046.5, 0.28, "triangle", 0.07, 0.27);
  }

  playError() {
    this.playTone(260, 0.12, "sine", 0.05, 0);
    this.playTone(210, 0.16, "sine", 0.04, 0.09);
  }
}

export const sound = new SoundController();
