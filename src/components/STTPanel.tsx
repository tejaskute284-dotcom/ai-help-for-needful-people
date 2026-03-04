import { Mic, MicOff, Trash2, Copy } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';
import { motion } from 'framer-motion';

export const STTPanel = () => {
    const { isListening, transcript, startListening, stopListening, resetTranscript, hasRecognitionSupport } = useSpeechToText();

    if (!hasRecognitionSupport) {
        return (
            <div className="p-4 bg-red-500/20 rounded-xl border border-red-500/30 text-center">
                <p className="text-red-200">Speech recognition is not supported in this browser.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Mic className="text-pink-400" size={24} />
                <h3 className="text-lg font-bold">Speech to Text</h3>
            </div>

            <div className="bg-black/20 rounded-xl p-4 min-h-[150px] max-h-[300px] overflow-y-auto border border-white/10">
                {transcript ? (
                    <p className="text-white/90 leading-relaxed">{transcript}</p>
                ) : (
                    <p className="text-white/30 italic text-sm">Transcribed text will appear here…</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={isListening ? stopListening : startListening}
                    className={`col-span-2 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isListening ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'
                        }`}
                >
                    {isListening ? (
                        <>
                            <MicOff size={20} /> Stop Listening
                        </>
                    ) : (
                        <>
                            <Mic size={20} /> Start Listening
                        </>
                    )}
                </motion.button>

                <button
                    onClick={resetTranscript}
                    disabled={!transcript}
                    className="py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
                >
                    <Trash2 size={16} /> Clear
                </button>
                <button
                    onClick={() => navigator.clipboard.writeText(transcript)}
                    disabled={!transcript}
                    className="py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition"
                >
                    <Copy size={16} /> Copy
                </button>
            </div>
        </div>
    );
};
