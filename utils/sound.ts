import { SOUNDS } from '../constants';

class SoundManager {
  private sounds: Record<string, HTMLAudioElement> = {};

  constructor() {
    this.preloadSounds();
  }

  private preloadSounds() {
    // Preload game sounds
    this.sounds['correct'] = new Audio(SOUNDS.CORRECT);
    this.sounds['wrong'] = new Audio(SOUNDS.WRONG);
    this.sounds['bgm'] = new Audio(SOUNDS.BGM);
    this.sounds['alarm'] = new Audio(SOUNDS.ALARM);
    this.sounds['clap'] = new Audio(SOUNDS.CLAP);
    
    // Countdown sounds
    this.sounds['count3'] = new Audio(SOUNDS.COUNT_3);
    this.sounds['count2'] = new Audio(SOUNDS.COUNT_2);
    this.sounds['count1'] = new Audio(SOUNDS.COUNT_1);
    
    // Configure sounds
    this.sounds['bgm'].loop = true;
    this.sounds['bgm'].volume = 0.5; 
    this.sounds['alarm'].volume = 1.0;
  }

  play(key: string) {
    const sound = this.sounds[key];
    if (sound) {
      sound.currentTime = 0;
      sound.loop = false;
      sound.play().catch(e => console.warn("Audio play failed:", e));
    }
  }

  playLoop(key: 'bgm') {
    const sound = this.sounds[key];
    if (sound) {
      sound.currentTime = 0;
      sound.loop = true;
      sound.play().catch(e => console.warn("Audio loop failed:", e));
    }
  }

  stop(key: string) {
    const sound = this.sounds[key];
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }
}

export const soundManager = new SoundManager();