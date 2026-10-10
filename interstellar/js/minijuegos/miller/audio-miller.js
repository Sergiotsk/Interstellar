// Sintetizador del juego: la clase SynthAudio del prototipo (App.tsx) sin tipos, mas tres sonidos de su gameAudio.
// El original desbloqueaba el audio con listeners globales que nunca quitaba; aca main.js llama a resume() en cada gesto.

export class SynthAudio {
  ctx = null;
  masterGain = null;
  waveRumbleNode = null;
  isMuted = false;


  getCtx() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        void this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    }
    if (typeof window === 'undefined') return null;
    const AudioCtor = window.AudioContext || (window).webkitAudioContext;
    if (!AudioCtor) return null;
    this.ctx = new AudioCtor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
    return this.ctx;
  }

  resume() {
    const ctx = this.getCtx();
    if (ctx && ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  getMuteState() {
    return this.isMuted;
  }

  // Boarding Airlock
  playShipBoard() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554, 659, 880, 1108];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.04);
      gain.gain.setValueAtTime(0.12, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.16);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now + idx * 0.04);
      osc.stop(now + idx * 0.04 + 0.18);
    });
  }

  // Disembark
  playShipDisembark() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(659, now);
    osc.frequency.exponentialRampToValueAtTime(330, now + 0.18);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Classic Galaga-style / Arcade Twin Plasma Blaster
  playArcadeLaser(powerLevel = 1) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const baseFreq = 1650 + (powerLevel - 1) * 180;
    const endFreq = 180;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = powerLevel > 1 ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.09);
    gain.gain.setValueAtTime(0.14 + Math.min(0.1, powerLevel * 0.03), now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Galaga Dive Siren Cue
  playGalagaDive() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.linearRampToValueAtTime(420, now + 0.16);
    osc.frequency.linearRampToValueAtTime(740, now + 0.3);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.33);
  }

  // EMP Screen Clearing Bomb
  playEmpBomb() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Sub-bass drop
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.6);
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.7);

    // High sweep
    const sweep = ctx.createOscillator();
    const sweepGain = ctx.createGain();
    sweep.type = 'sawtooth';
    sweep.frequency.setValueAtTime(100, now);
    sweep.frequency.exponentialRampToValueAtTime(2400, now + 0.35);
    sweepGain.gain.setValueAtTime(0.2, now);
    sweepGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
    sweep.connect(sweepGain);
    sweepGain.connect(this.masterGain || ctx.destination);
    sweep.start(now);
    sweep.stop(now + 0.42);
  }

  // Homing Missiles
  playMissileLaunch() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.18);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Docking Lock Fanfare
  playDockingLock() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);
      gain.gain.setValueAtTime(0.2, now + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.65);
    });
  }

  // Water splash
  playWaterSplash(intensity = 1) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.08 * (0.9 + Math.random() * 0.2);
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.35));

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime((850 + Math.random() * 260) * (intensity > 1 ? 1.2 : 1), now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.08 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  // Jump swoosh
  playJumpSwoosh() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Slide Dash
  playSlideDash() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = 0.22;
    const bufSize = Math.floor(ctx.sampleRate * dur);
    const buffer = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(1200, now + 0.12);
    filter.frequency.exponentialRampToValueAtTime(400, now + dur);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    noise.start(now);
    noise.stop(now + dur);
  }

  // On-foot weapons
  playPulseCarbine() {
    this.playArcadeLaser(1);
  }

  playScatterBlaster() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.2);
    oscGain.gain.setValueAtTime(0.22, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.21);
  }

  playRocketLaunch() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(860, now + 0.22);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.23);
  }

  // Explosion
  playExplosion(isBig = false) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const dur = isBig ? 0.45 : 0.28;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isBig ? 110 : 140, now);
    osc.frequency.exponentialRampToValueAtTime(22, now + dur);
    oscGain.gain.setValueAtTime(isBig ? 0.38 : 0.24, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + dur);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + dur);
  }

  // Enemy Laser
  playEnemyLaser() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(780, now);
    osc.frequency.exponentialRampToValueAtTime(160, now + 0.12);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Pickups
  playPickup(isEnergy = false) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc1.type = 'triangle';
    osc2.type = 'sine';
    const baseFreq = isEnergy ? 660 : 880;
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.1);
    osc2.frequency.setValueAtTime(baseFreq * 2, now + 0.05);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc1.start(now);
    osc2.start(now + 0.05);
    osc1.stop(now + 0.2);
    osc2.stop(now + 0.2);
  }

  // Beacon Sonar
  playBeaconSonar(freqMultiplier = 1.0) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880 * freqMultiplier, now);
    osc.frequency.exponentialRampToValueAtTime(440 * freqMultiplier, now + 0.14);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playBeaconAcquired() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73, 1318.51];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);
      gain.gain.setValueAtTime(0.14, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.22);
      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.24);
    });
  }

  playBannerImpact() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(28, now + 0.28);
    oscGain.gain.setValueAtTime(0.25, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.29);
  }

  playTargetLock() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.setValueAtTime(2200, now + 0.04);
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.11);
  }

  playHitMarker(isCrit = false) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCrit ? 'triangle' : 'sine';
    const freq = isCrit ? 2600 : 2000;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.035);
    gain.gain.setValueAtTime(isCrit ? 0.16 : 0.09, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  }

  playHitStopThud() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(95, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.12);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.13);
  }

  playTallyTick(isBig = false) {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isBig ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isBig ? 1280 : 850, now);
    gain.gain.setValueAtTime(isBig ? 0.09 : 0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.04);
  }

  playRangerThruster() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(55, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 2.0);
    gain.gain.setValueAtTime(0.01, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 1.0);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 2.5);
  }

  playCaseBoost() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(340, now);
    osc.frequency.exponentialRampToValueAtTime(1020, now + 0.24);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  playPlayerHurt() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    osc.connect(gain);
    gain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.19);
  }

  playPlayerDeath() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const oscGain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(24, now + 0.45);
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
    osc.connect(oscGain);
    oscGain.connect(this.masterGain || ctx.destination);
    osc.start(now);
    osc.stop(now + 0.46);
  }

  updateWaveRumble(intensity) {
    if (this.isMuted) {
      if (this.waveRumbleNode) this.stopWaveRumble();
      return;
    }
    const ctx = this.getCtx();
    if (!ctx) return;

    if (!this.waveRumbleNode && intensity > 0.05) {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(36, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(90, ctx.currentTime);
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);
      osc.start();
      this.waveRumbleNode = { osc, filter, gain };
    }

    if (this.waveRumbleNode) {
      const now = ctx.currentTime;
      const targetGain = Math.min(0.24, intensity * 0.24);
      const targetCutoff = 80 + intensity * 200;
      this.waveRumbleNode.gain.gain.setTargetAtTime(targetGain, now, 0.1);
      this.waveRumbleNode.filter.frequency.setTargetAtTime(targetCutoff, now, 0.1);
    }
  }

  stopWaveRumble() {
    if (this.waveRumbleNode) {
      try {
        this.waveRumbleNode.osc.stop();
        this.waveRumbleNode.osc.disconnect();
      } catch (_) {}
      this.waveRumbleNode = null;
    }
  }
  // --- Del gameAudio del helper del Playground: los tres sonidos que usa el juego ---

  blip(at, o) {
    const ctx = this.getCtx();
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = o.type ?? 'square';
    osc.frequency.setValueAtTime(o.freq, at);
    const peak = o.gain ?? 0.15;
    g.gain.setValueAtTime(peak, at);
    g.gain.exponentialRampToValueAtTime(0.0001, at + o.dur);
    osc.connect(g);
    g.connect(this.masterGain || ctx.destination);
    osc.start(at);
    osc.stop(at + o.dur + 0.02);
  }

  vary(amount = 0.05) {
    return 1 + (Math.random() * 2 - 1) * amount;
  }

  playPowerupChime() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const v = this.vary();
    [523.25, 659.25, 783.99, 1046.5, 1318.51].forEach((freq, i) => {
      this.blip(now + i * 0.06, { type: 'sine', freq: freq * v, dur: 0.15, gain: 0.06 });
    });
  }

  playVictoryFanfare() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const v = this.vary();
    const notes = [261.63, 329.63, 392.0, 523.25];
    notes.forEach((freq, i) => {
      this.blip(now + i * 0.1, { type: 'sawtooth', freq: freq * v, dur: 0.4, gain: 0.06 });
      this.blip(now + i * 0.1, { type: 'sine', freq: freq * 0.5 * v, dur: 0.4, gain: 0.04 });
    });
    const chordTime = notes.length * 0.1;
    notes.forEach((freq) => this.blip(now + chordTime, { type: 'triangle', freq: freq * v, dur: 0.8, gain: 0.06 }));
  }

  playDefeatMotif() {
    if (this.isMuted) return;
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const v = this.vary();
    [311.13, 261.63, 246.94, 196.0].forEach((freq, i) => {
      this.blip(now + i * 0.15, { type: 'sawtooth', freq: freq * v, dur: 0.3, gain: 0.08 });
      this.blip(now + i * 0.15, { type: 'sine', freq: freq * 0.5 * v, dur: 0.35, gain: 0.06 });
    });
  }

  // Del port: liberar el AudioContext al desmontar la pagina (swup).
  cerrar() {
    this.stopWaveRumble();
    this.ctx?.close().catch(() => {});
    this.ctx = null;
    this.masterGain = null;
  }
}

// Musica ambiente del original (ocean_abyss_ambience.mp3) en loop, con su propio mute (BGM).
export function crearMusica(url, volumen) {
  const audio = new Audio(url);
  audio.loop = true;
  audio.volume = volumen;
  audio.preload = 'auto';
  let muteada = false;
  let sonando = false;
  return {
    sonar(activa) {
      sonando = activa;
      if (activa && !muteada) audio.play().catch(() => {});
      else audio.pause();
    },
    alternarMute() {
      muteada = !muteada;
      this.sonar(sonando);
      return muteada;
    },
    estaMuteada: () => muteada,
    cerrar() {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    },
  };
}
