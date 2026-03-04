import { useEffect, useRef, useState, useCallback } from 'react';
import { useHandGesture } from '../../features/vision/useHandGesture';
import { Camera, RefreshCw } from 'lucide-react';

export function GestureDetection() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const { isInitializing, gestureOutput, error, predictWebcam } = useHandGesture();
    const requestRef = useRef<number | null>(null);
    const lastSpokenRef = useRef<string>('');
    const lastSpokenTimeRef = useRef<number>(0);

    const announce = useCallback((text: string) => {
        const now = Date.now();
        // Debounce: don't repeat same gesture within 3 seconds, or any gesture within 1 second
        if (text === lastSpokenRef.current && now - lastSpokenTimeRef.current < 3000) return;
        if (now - lastSpokenTimeRef.current < 1000) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.2;
        window.speechSynthesis.speak(utterance);

        lastSpokenRef.current = text;
        lastSpokenTimeRef.current = now;
    }, []);

    // Voice output effect
    useEffect(() => {
        if (isCameraActive && gestureOutput.gesture !== 'None' && gestureOutput.confidence > 0.8) {
            announce(gestureOutput.gesture);
        }
    }, [gestureOutput, isCameraActive, announce]);

    const loopRef = useRef<() => void>(() => {});

    const loop = useCallback(() => {
        if (videoRef.current && canvasRef.current && isCameraActive) {
            predictWebcam(videoRef.current, canvasRef.current);
            requestRef.current = requestAnimationFrame(() => loopRef.current());
        }
    }, [isCameraActive, predictWebcam]);

    useEffect(() => {
        loopRef.current = loop;
    }, [loop]);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480 }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setIsCameraActive(true);
                };
            }
        } catch (err) {
            console.error('Error accessing camera:', err);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsCameraActive(false);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        }
    };

    // Keep looping as long as camera is active
    useEffect(() => {
        if (isCameraActive) {
            requestRef.current = requestAnimationFrame(loop);
        }
        return () => {
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
        };
    }, [isCameraActive, loop]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, []);

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>

            {/* Controls */}
            <div style={{ marginBottom: '24px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <button
                    className="btn-clay"
                    onClick={isCameraActive ? stopCamera : startCamera}
                    disabled={isInitializing}
                    style={{
                        background: isCameraActive ? '#EF4444' : '#10B981',
                        color: 'white',
                        border: 'none',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        fontWeight: 600,
                        cursor: isInitializing ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                >
                    {isInitializing ? (
                        <>
                            <RefreshCw size={20} className="animate-spin" /> Loading AI...
                        </>
                    ) : isCameraActive ? (
                        <>
                            <Camera size={20} /> Stop Camera
                        </>
                    ) : (
                        <>
                            <Camera size={20} /> Start Gesture
                        </>
                    )}
                </button>

                {isInitializing && (
                    <span style={{ color: '#6B7280', fontSize: '14px' }}>
                        Initializing computer vision model...
                    </span>
                )}

                {error && (
                    <span style={{ color: '#EF4444', fontSize: '14px', fontWeight: 600 }}>
                        ❌ {error}
                    </span>
                )}
            </div>

            {/* Camera View */}
            <div className="card-clay" style={{
                position: 'relative',
                width: '640px',
                maxWidth: '100%',
                height: '480px',
                background: '#000',
                borderRadius: '24px',
                overflow: 'hidden',
                margin: '0 auto',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
                {!isCameraActive && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        color: '#6B7280'
                    }}>
                        <Camera size={64} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <p>Camera is off</p>
                    </div>
                )}

                <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    autoPlay
                    playsInline
                    muted
                />
                <canvas
                    ref={canvasRef}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%'
                    }}
                />

                {/* HUD Overlay */}
                {isCameraActive && (
                    <div style={{
                        position: 'absolute',
                        bottom: '20px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '12px 24px',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                margin: 0,
                                fontSize: '12px',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Detected Gesture
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: 800,
                                color: '#6366F1'
                            }}>
                                {gestureOutput.gesture}
                            </p>
                        </div>

                        <div style={{ height: '30px', width: '1px', background: '#E5E7EB' }} />

                        <div style={{ textAlign: 'center' }}>
                            <p style={{
                                margin: 0,
                                fontSize: '12px',
                                color: '#6B7280',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}>
                                Confidence
                            </p>
                            <p style={{
                                margin: 0,
                                fontSize: '24px',
                                fontWeight: 800,
                                color: gestureOutput.confidence > 0.7 ? '#10B981' : '#F59E0B'
                            }}>
                                {(gestureOutput.confidence * 100).toFixed(0)}%
                            </p>
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}
