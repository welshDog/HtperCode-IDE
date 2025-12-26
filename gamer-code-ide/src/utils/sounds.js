// Sound effects using Web Audio API for better performance
class SoundManager {
  constructor() {
    this.audioContext = null;
    this.sounds = {};
    this.isMuted = false;
    this.volume = 0.5;
  }

  // Initialize audio context on first user interaction
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  // Load a sound
  async loadSound(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.sounds[name] = audioBuffer;
    } catch (error) {
      console.error(`Error loading sound ${name}:`, error);
    }
  }

  // Play a loaded sound
  playSound(name, volume = null) {
    if (this.isMuted || !this.audioContext) return;

    const sound = this.sounds[name];
    if (!sound) return;

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    gainNode.gain.value = volume !== null ? volume : this.volume;
    source.buffer = sound;
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start(0);

    return source;
  }

  // Toggle mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  // Set volume (0 to 1)
  setVolume(level) {
    this.volume = Math.max(0, Math.min(1, level));
  }
}

// Create a single instance
export const soundManager = new SoundManager();

// Initialize on first user interaction
const initOnInteraction = () => {
  soundManager.init();
  window.removeEventListener('click', initOnInteraction);
  window.removeEventListener('keydown', initOnInteraction);
};

window.addEventListener('click', initOnInteraction, { once: true });
window.addEventListener('keydown', initOnInteraction, { once: true });

// Sound effects
const soundFiles = {
  levelUp: '/sounds/level-up.mp3',
  xpGain: '/sounds/xp-gain.mp3',
  codeSave: '/sounds/save.mp3',
  codeRun: '/sounds/run.mp3',
};

// Load all sounds
export const loadSounds = async () => {
  soundManager.init();
  const loadPromises = Object.entries(soundFiles).map(([name, url]) => 
    soundManager.loadSound(name, url)
  );
  await Promise.all(loadPromises);
};

// Export individual sound effects
export const playLevelUp = () => soundManager.playSound('levelUp', 0.4);
export const playXpGain = () => soundManager.playSound('xpGain', 0.3);
export const playCodeSave = () => soundManager.playSound('codeSave', 0.3);
export const playCodeRun = () => soundManager.playSound('codeRun', 0.3);

export default {
  playLevelUp,
  playXpGain,
  playCodeSave,
  playCodeRun,
  toggleMute: () => soundManager.toggleMute(),
  setVolume: (level) => soundManager.setVolume(level),
  isMuted: () => soundManager.isMuted,
};
