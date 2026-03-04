import { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { RefreshCw, Hand, Maximize2, Minimize2, CheckCircle2, Sparkles, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccessibility } from '../context/AccessibilityContext';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';
import { detectASLGesture } from '../features/vision/aslHeuristics';

export default function SignLanguageMode({ onBack }: { onBack: () => void }) {
    const { announce: accessibilityAnnounce, haptic, playAudio } = useAccessibility();
    const webcamRef = useRef<Webcam>(null);
    const [recognizer, setRecognizer] = useState<GestureRecognizer | null>(null);
    const [gesture, setGesture] = useState<string>('None');
    const [confidence, setConfidence] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'error'>('prompt');
    const [isFullscreen, setIsFullscreen] = useState(false);

    const lastVideoTime = useRef(-1);
    const requestRef = useRef<number>(0);
    const lastSpokenRef = useRef<string>('');
    const lastSpokenTimeRef = useRef<number>(0);
    const gestureHoldStartRef = useRef<number>(0);
    const currentStableGestureRef = useRef<string>('None');

    // Smoothing buffer for gesture results
    const gestureBuffer = useRef<string[]>([]);
    const BUFFER_SIZE = 3; // Reduced for faster response

    useEffect(() => {
        const init = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                setPermissionState('granted');

                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const recognizer = await GestureRecognizer.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
                        delegate: "CPU" // Switched to CPU for greater stability cross-browser
                    },
                    runningMode: "VIDEO",
                    numHands: 1
                });
                setRecognizer(recognizer);
                setIsProcessing(true);
                accessibilityAnnounce("Gesture Studio ready. Start signing.", "success");
            } catch (error: any) {
                console.error("Sign Mode Init Error:", error);
                setPermissionState(error.name?.includes('Allowed') ? 'denied' : 'error');
                accessibilityAnnounce("System initialization failed.", "error");
            }
        };
        init();
    }, [accessibilityAnnounce]);

    const announce = useCallback((text: string) => {
        const now = Date.now();
        // Prevent repeated announcements within a short window unless it's a different gesture
        if (text === lastSpokenRef.current && now - lastSpokenTimeRef.current < 4000) return;
        if (now - lastSpokenTimeRef.current < 1500) return;

        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 1.0; // Slightly slower for clarity
            window.speechSynthesis.speak(utterance);
        }

        playAudio('ai');
        haptic(20);
        accessibilityAnnounce(text, 'ai');

        lastSpokenRef.current = text;
        lastSpokenTimeRef.current = now;
    }, [accessibilityAnnounce, playAudio, haptic]);

    const predict = useCallback(() => {
        if (webcamRef.current && webcamRef.current.video && recognizer) {
            const video = webcamRef.current.video;
            if (video.currentTime !== lastVideoTime.current) {
                lastVideoTime.current = video.currentTime;
                const result = recognizer.recognizeForVideo(video, performance.now());

                let rawDetectedGesture = 'None';
                let rawDetectedConfidence = 0;

                if (result.gestures.length > 0) {
                    const category = result.gestures[0][0];
                    rawDetectedGesture = category.categoryName;
                    rawDetectedConfidence = category.score;
                }

                if (result.landmarks && result.landmarks.length > 0) {
                    const aslResult = detectASLGesture(result.landmarks[0]);
                    if (aslResult && aslResult.confidence > rawDetectedConfidence) {
                        rawDetectedGesture = aslResult.gesture;
                        rawDetectedConfidence = aslResult.confidence;
                    }
                }

                // Temporal Smoothing: Push to buffer and find most frequent
                gestureBuffer.current.push(rawDetectedGesture);
                if (gestureBuffer.current.length > BUFFER_SIZE) {
                    gestureBuffer.current.shift();
                }

                const counts = gestureBuffer.current.reduce((acc: any, val) => {
                    acc[val] = (acc[val] || 0) + 1;
                    return acc;
                }, {});

                const smoothedGesture = Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b);

                // Throttled UI Updates: Only update state if gesture changed or periodically
                if (smoothedGesture !== gesture || Math.random() < 0.1) {
                    setGesture(smoothedGesture);
                    setConfidence(rawDetectedConfidence);
                }

                if (smoothedGesture !== currentStableGestureRef.current) {
                    currentStableGestureRef.current = smoothedGesture;
                    gestureHoldStartRef.current = Date.now();
                } else if (smoothedGesture !== 'None' && smoothedGesture !== 'none') {
                    const holdTime = Date.now() - gestureHoldStartRef.current;
                    // Gesture must be stable for 350ms before announcing (optimized for faster response)
                    if (holdTime > 350 && rawDetectedConfidence > 0.65) {
                        announce(smoothedGesture);
                    }
                }
            }
        }
        requestRef.current = requestAnimationFrame(predict);
    }, [recognizer, gesture, announce]);

    useEffect(() => {
        if (isProcessing && recognizer) {
            requestRef.current = requestAnimationFrame(predict);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isProcessing, recognizer, predict]);

    if (permissionState === 'denied') {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] glass-panel rounded-[3.5rem] p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <Hand size={48} className="text-rose-500" />
                </div>
                <h3 className="text-4xl font-black text-text-main">Gestures Blocked</h3>
                <p className="text-text-muted text-lg font-medium max-w-md"> Please enable camera access to use Gesture Studio. </p>
                <button onClick={onBack} className="px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-bold shadow-2xl"> Go Back </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {!recognizer && permissionState === 'prompt' && (
                    <LoadingOverlay message="Configuring Hand Studio" subMessage="Calibrating neural spatial sensors…" />
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center gap-4">
                <button onClick={onBack} className="p-5 glass-panel rounded-2xl hover:bg-white/10 border border-white/20 transition-all">
                    <RefreshCw size={24} className="rotate-180" />
                </button>
                <div className="flex-1 glass-panel h-14 flex items-center px-6 rounded-2xl border border-white/10">
                    <Activity size={18} className="text-emerald-400 mr-3 animate-pulse" />
                    <span className="font-black text-xs uppercase tracking-widest text-text-main">Spatial Recognition Active</span>
                </div>
                <button
                    onClick={() => setIsFullscreen(!isFullscreen)}
                    className={`p-5 rounded-2xl transition-all border ${isFullscreen ? 'bg-brand-primary text-white' : 'glass-panel text-text-muted border-white/20'}`}
                >
                    {isFullscreen ? <Minimize2 size={24} /> : <Maximize2 size={24} />}
                </button>
            </div>

            <div className={`relative transition-all duration-500 ease-in-out ${isFullscreen ? 'fixed inset-0 z-[100] bg-black p-4' : 'clay-card aspect-video rounded-[3.5rem] overflow-hidden border border-white/10 shadow-2xl bg-black'}`}>
                <Webcam
                    ref={webcamRef}
                    className="w-full h-full object-cover grayscale-[0.1] rounded-[2.5rem]"
                    mirrored
                />

                <AnimatePresence>
                    {gesture !== 'None' && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="absolute bottom-10 left-1/2 -translate-x-1/2 glass-panel px-10 py-6 rounded-[2.5rem] border border-brand-primary/40 flex items-center gap-6 shadow-2xl backdrop-blur-3xl z-20"
                        >
                            <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                                <Sparkles size={32} />
                            </div>
                            <div>
                                <p className="text-brand-primary text-[10px] font-black uppercase tracking-[0.2em] mb-1">Human Intent</p>
                                <p className="text-4xl font-black text-white tracking-tight"> {gesture} </p>
                            </div>
                            <div className="h-12 w-[2px] bg-white/10 mx-2" />
                            <div className="text-right">
                                <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-1">Confidence</p>
                                <p className="text-2xl font-black text-emerald-400"> {Math.round(confidence * 100)}% </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-8 rounded-[2.5rem] flex items-start gap-6 border border-white/10 group hover:border-emerald-400/30 transition-all">
                    <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-text-main mb-2">Optimal Lighting</h4>
                        <p className="text-text-muted font-medium leading-relaxed">
                            Clear, direct light ensures the AI can distinguish finger segments with 99% accuracy.
                        </p>
                    </div>
                </div>
                <div className="glass-panel p-8 rounded-[2.5rem] flex items-start gap-6 border border-white/10 group hover:border-brand-primary/30 transition-all">
                    <div className="p-4 bg-brand-primary/10 rounded-2xl text-brand-primary group-hover:scale-110 transition-transform">
                        <Hand size={32} />
                    </div>
                    <div>
                        <h4 className="text-xl font-black text-text-main mb-2">Spatial Range</h4>
                        <p className="text-text-muted font-medium leading-relaxed">
                            Position your hands within the neutral zone for maximum interpretation speed.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
