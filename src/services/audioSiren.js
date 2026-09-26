// Web Audio API Emergency Siren & Device Haptic Synthesizer

let sirenAudioContext = null;
let sirenOscillator = null;
let sirenGain = null;
let sirenInterval = null;

export function startEmergencySiren() {
  stopEmergencySiren(); // Ensure clean state

  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;

    sirenAudioContext = new AudioCtx();
    sirenOscillator = sirenAudioContext.createOscillator();
    sirenGain = sirenAudioContext.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(600, sirenAudioContext.currentTime);

    sirenGain.gain.setValueAtTime(0.2, sirenAudioContext.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(sirenAudioContext.destination);

    sirenOscillator.start();

    // Dual-tone siren pitch shift (600Hz <-> 950Hz)
    let highPitch = false;
    sirenInterval = setInterval(() => {
      if (sirenAudioContext && sirenOscillator) {
        const freq = highPitch ? 600 : 950;
        sirenOscillator.frequency.exponentialRampToValueAtTime(
          freq,
          sirenAudioContext.currentTime + 0.35
        );
        highPitch = !highPitch;
      }
    }, 400);

    // Haptic Vibration Pattern
    vibrateEmergencyPattern();

  } catch (e) {
    console.warn('Audio Siren playback notice:', e.message);
  }
}

export function stopEmergencySiren() {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }
  if (sirenAudioContext) {
    try {
      sirenAudioContext.close();
    } catch (e) {}
    sirenAudioContext = null;
  }
}

export function vibrateEmergencyPattern() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate([500, 250, 500, 250, 500, 250, 1000]);
  }
}
