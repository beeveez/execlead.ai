import { useState, useRef, useEffect, useCallback } from "react";

/**
 * useVoiceControls — manages browser Web Speech API for STT,
 * SpeechSynthesis for TTS, and MediaRecorder for audio playback.
 */
export function useVoiceControls(settings) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const [error, setError] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = settings?.transcriptLanguage || "en-US";

    recognition.onresult = (event) => {
      let final = "";
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      if (final) setTranscript((prev) => prev + final);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error !== "no-speech" && event.error !== "aborted") {
        setError(event.error);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    return () => { try { recognition.stop(); } catch (e) {} };
  }, [settings?.transcriptLanguage]);

  const startListening = useCallback(async () => {
    if (!recognitionRef.current) { setError("Speech recognition not supported"); return; }
    setError(null);
    setTranscript("");
    setInterimTranscript("");
    setAudioUrl(null);
    setIsListening(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = mr;
      mr.start();
    } catch (e) {
      setError("Microphone access denied. Please allow microphone permissions.");
      setIsListening(false);
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (e) {
      // already started
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch (e) {} }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const speak = useCallback((text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !settings?.voicePlayback) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = settings?.speakingSpeed || 1.0;
      if (settings?.voiceURI) {
        const voices = window.speechSynthesis.getVoices();
        const voice = voices.find((v) => v.voiceURI === settings.voiceURI);
        if (voice) utterance.voice = voice;
      }
      utterance.onend = () => { setIsSpeaking(false); resolve(); };
      utterance.onerror = () => { setIsSpeaking(false); resolve(); };
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    });
  }, [settings?.voicePlayback, settings?.speakingSpeed, settings?.voiceURI]);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const getVoices = useCallback(() => {
    if (!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices().map((v) => ({ uri: v.voiceURI, name: v.name, lang: v.lang }));
  }, []);

  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }, []);

  return {
    isListening, isSpeaking, transcript, interimTranscript, supported, error, audioUrl,
    startListening, stopListening, speak, stopSpeaking, getVoices,
  };
}