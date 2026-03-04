import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, Info, AlertTriangle, CheckCircle, HandMetal } from 'lucide-react';

type FeedbackType = 'info' | 'success' | 'warning' | 'error' | 'ai';

interface Feedback {
    id: string;
    type: FeedbackType;
    message: string;
    duration?: number;
}

interface AccessibilityContextType {
    announce: (message: string, type?: FeedbackType) => void;
    haptic: (pattern?: number | number[]) => void;
    playAudio: (type: FeedbackType) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within AccessibilityProvider');
    }
    return context;
};

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
    const audioContext = useRef<AudioContext | null>(null);

    const initAudio = useCallback(() => {
        if (!audioContext.current) {
            audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }, []);

    const playAudio = useCallback((type: FeedbackType) => {
        initAudio();
        if (!audioContext.current) return;

        const osc = audioContext.current.createOscillator();
        const gain = audioContext.current.createGain();

        osc.connect(gain);
        gain.connect(audioContext.current.destination);

        const now = audioContext.current.currentTime;

        switch (type) {
            case 'success':
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
                osc.start(now);
                osc.stop(now + 0.2);
                break;
            case 'info':
                osc.frequency.setValueAtTime(660, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
                osc.start(now);
                osc.stop(now + 0.1);
                break;
            case 'ai':
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
                osc.start(now);
                osc.stop(now + 0.4);
                break;
        }
    }, [initAudio]);

    const haptic = useCallback((pattern: number | number[] = 10) => {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }, []);

    const announce = useCallback((message: string, type: FeedbackType = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        // SINGLETON PATTERN: Remove all previous toasts to prevent overlap
        setFeedbacks([{ id, type, message }]);

        // Screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 3000);

        // Audio feedback
        playAudio(type);

        // Haptic feedback
        if (type === 'success' || type === 'error') haptic([20, 10, 20]);
        else haptic(10);

        setTimeout(() => {
            setFeedbacks(prev => prev.filter(f => f.id !== id));
        }, 4000);
    }, [playAudio, haptic]);

    return (
        <AccessibilityContext.Provider value={{ announce, haptic, playAudio }}>
            {children}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex flex-col gap-3 z-[100] w-full max-w-md px-6">
                <AnimatePresence>
                    {feedbacks.map((f) => (
                        <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -20 }}
                            className="glass-panel rounded-2xl p-4 flex items-center gap-4 border border-white/20 shadow-2xl backdrop-blur-3xl"
                        >
                            <div className={`p-2 rounded-xl bg-white/10 ${f.type === 'success' ? 'text-emerald-400' :
                                f.type === 'error' ? 'text-rose-400' :
                                    f.type === 'warning' ? 'text-amber-400' :
                                        f.type === 'ai' ? 'text-brand-primary' : 'text-blue-400'
                                }`}>
                                {f.type === 'success' && <CheckCircle size={20} />}
                                {f.type === 'error' && <AlertTriangle size={20} />}
                                {f.type === 'warning' && <Info size={20} />}
                                {f.type === 'ai' && <HandMetal size={20} />}
                                {f.type === 'info' && <Bell size={20} />}
                            </div>
                            <p className="font-bold text-sm text-white">{f.message}</p>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </AccessibilityContext.Provider>
    );
};
