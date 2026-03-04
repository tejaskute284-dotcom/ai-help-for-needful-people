import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Webcam from 'react-webcam';
import { ChevronLeft, Eye, EyeOff, AlertCircle, Box, Type } from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { useAccessibility } from '../context/AccessibilityContext';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

interface BlindModeProps {
    onBack: () => void;
}

export default function BlindMode({ onBack }: BlindModeProps) {
    const { announce: accessibilityAnnounce, playAudio, haptic } = useAccessibility();
    const [isScanning, setIsScanning] = useState(false);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [predictions, setPredictions] = useState<cocoSsd.DetectedObject[]>([]);
    const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'error'>('prompt');
    const [showVisuals, setShowVisuals] = useState(true);
    const [lastAnnouncement, setLastAnnouncement] = useState('');

    const webcamRef = useRef<Webcam>(null);
    const requestRef = useRef<number | null>(null);
    const lastSpokenTime = useRef<number>(0);
    const detectionCountRef = useRef<{ [key: string]: number }>({});

    // Text-to-Speech Helper integrated with Accessibility Context
    const announce = useCallback((text: string, force = false, type: 'info' | 'success' | 'error' | 'ai' = 'info') => {
        const now = Date.now();

        if (!force && (now - lastSpokenTime.current < 4000)) return; // 4s Gap between ANY object
        if (!force && (text === lastAnnouncement) && (now - lastSpokenTime.current < 8000)) return; // 8s Gap for SAME object
        if (!force && window.speechSynthesis.speaking) return;

        if (!('speechSynthesis' in window)) return;

        if (force) window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;

        // Trigger accessibility feedback
        playAudio(type);
        haptic(type === 'error' ? [50, 50, 50] : 10);
        accessibilityAnnounce(text, type);

        window.speechSynthesis.speak(utterance);
        lastSpokenTime.current = now;
        setLastAnnouncement(text);
    }, [lastAnnouncement, accessibilityAnnounce, playAudio, haptic]);

    // Initial Permission & Model Load
    useEffect(() => {
        const checkPermissionsAndLoad = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());
                setPermissionState('granted');

                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);

                announce('Visual cortex ready. I can now see objects around you.', true, 'success');
                setIsScanning(true);
            } catch (err: any) {
                console.error("Initialization error:", err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setPermissionState('denied');
                    announce("Camera access denied. Please enable camera permissions.", true, 'error');
                } else {
                    setPermissionState('error');
                    setLastAnnouncement(err.message || "Failed to initialize AI.");
                    announce("System error. Please check connection and refresh.", true, 'error');
                }
            }
        };
        checkPermissionsAndLoad();
    }, [announce]);

    // Detection Loop
    const detect = useCallback(async () => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && model && isScanning) {
            const video = webcamRef.current.video;
            const preds = await model.detect(video);
            setPredictions(preds);

            if (preds.length > 0) {
                // LOWERED THRESHOLD: 0.55 (More sensitive detection)
                const candidates = preds.filter(p => p.score > 0.55);

                if (candidates.length > 0) {
                    const best = candidates.reduce((prev, curr) => (prev.score > curr.score) ? prev : curr);
                    const count = (detectionCountRef.current[best.class] || 0) + 1;
                    detectionCountRef.current = { [best.class]: count };

                    // REQUIRE 3 CONSECUTIVE FRAMES (Faster response)
                    if (count >= 3) {
                        // Calculate object position (left, center, right)
                        const videoWidth = video.videoWidth;
                        const objectCenterX = best.bbox[0] + best.bbox[2] / 2;
                        const relativeX = objectCenterX / videoWidth;

                        let position = 'ahead';
                        if (relativeX < 0.35) position = 'on your left';
                        else if (relativeX > 0.65) position = 'on your right';

                        // Estimate distance based on bounding box size
                        const boxArea = (best.bbox[2] * best.bbox[3]) / (videoWidth * video.videoHeight);
                        let distance = '';
                        if (boxArea > 0.3) distance = 'very close, ';
                        else if (boxArea > 0.15) distance = 'nearby, ';
                        else if (boxArea < 0.03) distance = 'in the distance, ';

                        announce(`I see a ${best.class} ${distance}${position}`, false, 'ai');
                        detectionCountRef.current[best.class] = -15; // Refractory period
                    }
                } else {
                    detectionCountRef.current = {};
                }
            } else {
                detectionCountRef.current = {};
            }
        }
        requestRef.current = requestAnimationFrame(detect);
    }, [model, isScanning, announce]);

    useEffect(() => {
        if (isScanning && model) {
            requestRef.current = requestAnimationFrame(detect);
        } else if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isScanning, model, detect]);

    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    if (permissionState === 'denied') {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] glass-panel rounded-[3.5rem] p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center animate-pulse">
                    <EyeOff className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-4xl font-black text-text-main">Camera Required</h3>
                <p className="text-text-muted text-lg font-medium max-w-md">
                    We need your camera to help you see the world. Please enable access in your settings.
                </p>
                <button onClick={onBack} className="px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-bold shadow-2xl shadow-brand-primary/20">
                    Go Back
                </button>
            </div>
        );
    }

    if (permissionState === 'error') {
        return (
            <div className="flex flex-col items-center justify-center h-[600px] glass-panel rounded-[3.5rem] p-8 text-center space-y-8">
                <div className="w-24 h-24 bg-rose-500/10 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-rose-500" />
                </div>
                <h3 className="text-4xl font-black text-text-main">System Error</h3>
                <p className="text-text-muted text-lg font-medium max-w-md">
                    {lastAnnouncement}
                </p>
                <button onClick={() => window.location.reload()} className="px-12 py-5 bg-brand-primary text-white rounded-[1.5rem] font-bold">
                    Retry Calibration
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8 relative">
            <AnimatePresence>
                {!model && permissionState === 'prompt' && (
                    <LoadingOverlay message="Activating Vision" subMessage="Charging Neural Pulse…" />
                )}
            </AnimatePresence>

            <div className="flex justify-between items-center gap-4">
                <button onClick={onBack} className="p-5 glass-panel rounded-2xl hover:bg-white/10 transition-all border border-white/20">
                    <ChevronLeft size={24} />
                </button>
                <div className="flex-1 glass-panel h-14 flex items-center px-6 rounded-2xl border border-white/10">
                    <div className={`w-3 h-3 rounded-full mr-4 ${isScanning ? 'bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/20'}`} />
                    <span className="font-black text-xs uppercase tracking-widest text-text-main">
                        {isScanning ? "Neural Stream Active" : "Vision Paused"}
                    </span>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowVisuals(!showVisuals)}
                        className={`p-5 rounded-2xl transition-all border ${showVisuals ? 'bg-brand-primary text-white border-brand-primary shadow-xl shadow-brand-primary/20' : 'glass-panel text-text-muted border-white/10'}`}
                    >
                        <Box size={24} />
                    </button>
                    <button
                        onClick={() => setIsScanning(!isScanning)}
                        className={`p-5 rounded-2xl transition-all border ${isScanning ? 'bg-rose-500 text-white border-rose-500 shadow-xl shadow-rose-500/20' : 'bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20'}`}
                    >
                        {isScanning ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                </div>
            </div>

            <div className="clay-card aspect-[4/3] rounded-[3.5rem] overflow-hidden relative shadow-2xl border border-white/20 bg-black">
                <Webcam
                    ref={webcamRef}
                    audio={false}
                    className="w-full h-full object-cover grayscale-[0.2] brightness-110"
                    videoConstraints={{ facingMode: "environment" }}
                />

                {showVisuals && predictions.map((pred, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute border-2 border-brand-primary/60 bg-brand-primary/5 rounded-2xl backdrop-blur-[2px] pointer-events-none"
                        style={{
                            left: pred.bbox[0],
                            top: pred.bbox[1],
                            width: pred.bbox[2],
                            height: pred.bbox[3],
                        }}
                    >
                        <div className="absolute top-0 left-0 -translate-y-full pb-2">
                            <span className="px-3 py-1 bg-brand-primary text-white text-[10px] font-black uppercase tracking-widest rounded-lg shadow-xl">
                                {pred.class} {Math.round(pred.score * 100)}%
                            </span>
                        </div>
                    </motion.div>
                ))}

                {/* Scanning Line Animation */}
                {isScanning && (
                    <motion.div
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-brand-primary to-transparent opacity-50 z-10 pointer-events-none"
                    />
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-white/10">
                    <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
                        <Box size={28} />
                    </div>
                    <div>
                        <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-1">Stream Content</p>
                        <p className="text-2xl font-black text-text-main">{predictions.length} Objects</p>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-3xl flex items-center gap-5 border border-white/10">
                    <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-400">
                        <Type size={28} />
                    </div>
                    <div>
                        <p className="text-text-muted text-xs font-black uppercase tracking-widest mb-1">Focus Target</p>
                        <p className="text-lg font-black text-text-main truncate max-w-[120px]">
                            {predictions.length > 0 ? predictions[0].class : 'Calibrating…'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
