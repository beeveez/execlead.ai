import React from "react";
import { Mic, Square, Loader2, Volume2 } from "lucide-react";

export default function VoiceRecorder({ isListening, isSpeaking, transcript, interimTranscript, onStart, onStop, disabled }) {
  return (
    <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
      {/* Mic button */}
      <div className="flex flex-col items-center mb-4">
        <button
          onClick={isListening ? onStop : onStart}
          disabled={disabled}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all disabled:opacity-30 ${isListening ? "bg-red-500/20 border-2 border-red-500/40" : "bg-indigo-500/10 border-2 border-indigo-500/30 hover:bg-indigo-500/20"}`}
        >
          {isListening ? (
            <>
              <span className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
              <Square size={28} className="text-red-400 relative" />
            </>
          ) : (
            <Mic size={28} className="text-indigo-400" />
          )}
        </button>
        <div className="text-xs text-white/50 mt-3">
          {isSpeaking ? <span className="flex items-center gap-1 text-indigo-400"><Volume2 size={12} className="animate-pulse" /> EXEC™ is speaking…</span>
            : isListening ? <span className="text-red-400">Listening… Speak naturally</span>
            : disabled ? <span className="text-white/30">Waiting for EXEC™ to finish…</span>
            : <span className="text-white/40">Click to start speaking</span>}
        </div>
      </div>

      {/* Live transcript */}
      <div className="bg-white/[0.01] border border-white/[0.03] rounded-lg p-4 min-h-[120px] max-h-[200px] overflow-y-auto">
        {transcript || interimTranscript ? (
          <p className="text-sm text-white/70 leading-relaxed">
            {transcript}
            <span className="text-white/30 italic">{interimTranscript}</span>
          </p>
        ) : (
          <p className="text-white/20 text-sm text-center py-8">Your spoken response will appear here in real-time…</p>
        )}
      </div>

      {transcript && !isListening && (
        <button onClick={onStop} className="hidden">Submit</button>
      )}
    </div>
  );
}