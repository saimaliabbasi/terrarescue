// Web Speech API Voice Synthesis (Text-to-Speech) and Speech Recognition (Voice Input)

let synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
let currentUtterance = null;

/** Speak text aloud using natural browser voice */
export function speakText(text, lang = 'en', onEnd) {
  if (!synth) return false;

  // Stop any current speech
  stopSpeaking();

  // Strip HTML tags for clean voice reading
  const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/[*_#•]/g, ' ');

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  // Try to pick a natural voice if available
  const voices = synth.getVoices();
  if (voices && voices.length > 0) {
    const targetVoice = voices.find(v => v.lang.startsWith(lang === 'ur' ? 'ur' : 'en'));
    if (targetVoice) utterance.voice = targetVoice;
  }

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  currentUtterance = utterance;
  synth.speak(utterance);
  return true;
}

/** Stop any active speech output */
export function stopSpeaking() {
  if (synth && (synth.speaking || synth.pending)) {
    synth.cancel();
  }
  currentUtterance = null;
}

export function isSpeaking() {
  return synth ? synth.speaking : false;
}

/** Voice Input using Web Speech Recognition */
export function createSpeechRecognizer(lang = 'en', onResult, onError, onEnd) {
  const SpeechRecognitionClass = 
    typeof window !== 'undefined' 
      ? (window.SpeechRecognition || window.webkitSpeechRecognition) 
      : null;

  if (!SpeechRecognitionClass) return null;

  const recognition = new SpeechRecognitionClass();
  recognition.lang = lang === 'ur' ? 'ur-PK' : 'en-US';
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    if (event.results && event.results[0] && event.results[0][0]) {
      const transcript = event.results[0][0].transcript;
      if (onResult) onResult(transcript);
    }
  };

  recognition.onerror = (event) => {
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}
