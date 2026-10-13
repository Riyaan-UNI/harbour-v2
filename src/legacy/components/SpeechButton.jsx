import { useEffect, useState } from "react";
import { Icon } from "./Icons.jsx";
import { toast } from "./Toast.jsx";

/* Optional spoken output; the visible phrase always remains available as text. */
export default function SpeechButton({ text, language = "zh-HK", label = "Listen to Cantonese pronunciation" }) {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  function toggleSpeech() {
    if (!text?.trim()) return;
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      toast("Speech playback is not available in this browser.", { tone: "warning" });
      return;
    }

    const speech = window.speechSynthesis;
    if (speaking) {
      speech.cancel();
      setSpeaking(false);
      return;
    }

    speech.cancel();
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.88;
    utterance.voice = speech.getVoices().find(voice => /^(yue|zh-HK)$/i.test(voice.lang)) || null;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      toast("Could not play speech on this device.", { tone: "warning" });
    };
    speech.speak(utterance);
  }

  return (
    <button
      type="button"
      className={`translate-speak speech-button ${speaking ? "is-speaking" : ""}`}
      onClick={toggleSpeech}
      aria-label={speaking ? "Stop Cantonese speech" : label}
      aria-pressed={speaking}
    >
      <Icon name={speaking ? "pause" : "volume"} size={18} />
      <span>{speaking ? "Stop" : "Listen"}</span>
    </button>
  );
}
