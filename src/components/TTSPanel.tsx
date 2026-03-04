import { Volume2, Play, Square } from 'lucide-react';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { motion } from 'framer-motion';
import { useState } from 'react';

export const TTSPanel = () => {
    const { speak, stop, isSpeaking, voices, selectedVoice, setVoice, rate, setRate } = useTextToSpeech();
    const [text, setText] = useState('');

    const handleSpeak = () => {
        if (text) {
            speak(text);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Volume2 className="text-blue-400" size={24} />
                <h3 className="text-lg font-bold">Text to Speech</h3>
            </div>

            <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type here to speak…"
                className="w-full bg-black/20 rounded-xl p-4 border border-white/10 focus:border-blue-500/50 outline-none resize-none h-[120px] text-white placeholder:text-white/30"
            />

            <div className="space-y-3 p-3 bg-white/5 rounded-xl">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Voice</label>
                    <select
                        value={selectedVoice?.name || ''}
                        onChange={(e) => {
                            const voice = voices.find(v => v.name === e.target.value);
                            if (voice) setVoice(voice);
                        }}
                        className="w-full bg-black/20 rounded-lg p-2 text-sm border border-white/10 outline-none cursor-pointer"
                    >
                        {voices.map(voice => (
                            <option key={voice.name} value={voice.name} className="bg-gray-900">
                                {voice.name.slice(0, 30)}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Speed</label>
                        <span className="text-xs font-bold">{rate}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="2"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full accent-blue-500 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={isSpeaking ? stop : handleSpeak}
                disabled={!text && !isSpeaking}
                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition ${isSpeaking
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
            >
                {isSpeaking ? (
                    <>
                        <Square size={20} fill="currentColor" /> Stop Speaking
                    </>
                ) : (
                    <>
                        <Play size={20} fill="currentColor" /> Speak Text
                    </>
                )}
            </motion.button>
        </div>
    );
};
