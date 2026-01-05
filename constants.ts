import { Question } from './types';

export const DEFAULT_QUESTIONS: Question[] = [];

// Updated sound assets per request
export const SOUNDS = {
  // Cute playful background music loop (nhạc dạo dễ thương)
  BGM: 'https://assets.mixkit.co/music/preview/mixkit-cat-walk-371.mp3', 
  
  CORRECT: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3',
  WRONG: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
  
  // Alarm/Bell for timeout - CHANGED to a bell sound
  ALARM: 'https://assets.mixkit.co/active_storage/sfx/1461/1461-preview.mp3', 
  CLAP: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3',

  // Countdown voices (3...2...1)
  COUNT_3: 'https://assets.mixkit.co/active_storage/sfx/2578/2578-preview.mp3', // Voice 'Three' or beep
  COUNT_2: 'https://assets.mixkit.co/active_storage/sfx/2577/2577-preview.mp3', // Voice 'Two'
  COUNT_1: 'https://assets.mixkit.co/active_storage/sfx/2576/2576-preview.mp3', // Voice 'One'
};