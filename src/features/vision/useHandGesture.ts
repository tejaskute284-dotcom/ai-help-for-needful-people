import { useState, useEffect, useRef, useCallback } from 'react';
import { GestureRecognizer, DrawingUtils } from '@mediapipe/tasks-vision';
import { createGestureRecognizer } from '../../lib/mediapipe-init';
import { detectASLGesture } from './aslHeuristics';

export function useHandGesture() {
    const [isInitializing, setIsInitializing] = useState(true);
    const [gestureOutput, setGestureOutput] = useState<{ gesture: string; confidence: number }>({
        gesture: 'None',
        confidence: 0,
    });
    const [error, setError] = useState<string | null>(null);

    const recognizerRef = useRef<GestureRecognizer | null>(null);
    const drawingUtilsRef = useRef<DrawingUtils | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setIsInitializing(true);
                recognizerRef.current = await createGestureRecognizer();
                setIsInitializing(false);
            } catch (err: unknown) {
                console.error('Error initializing MediaPipe:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize gesture recognition');
                setIsInitializing(false);
            }
        };

        init();
    }, []);

    const predictWebcam = useCallback((video: HTMLVideoElement, canvas: HTMLCanvasElement) => {
        if (!recognizerRef.current) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const recognizer = recognizerRef.current;

        // Check if video is playing and has data
        if (video.videoWidth === 0 || video.videoHeight === 0) return;

        // Set canvas dimensions to match video
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            // Re-initialize drawing utils when canvas size changes
            drawingUtilsRef.current = new DrawingUtils(ctx);
        }

        if (!drawingUtilsRef.current) {
            drawingUtilsRef.current = new DrawingUtils(ctx);
        }

        try {
            const results = recognizer.recognizeForVideo(video, Date.now());

            // Draw results
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const drawingUtils = drawingUtilsRef.current;

            if (results.landmarks) {
                for (const landmarks of results.landmarks) {
                    drawingUtils.drawConnectors(landmarks, GestureRecognizer.HAND_CONNECTIONS, {
                        color: "#00FF00",
                        lineWidth: 3
                    });
                    drawingUtils.drawLandmarks(landmarks, {
                        color: "#FF0000",
                        lineWidth: 1
                    });
                }
            }
            ctx.restore();

            // Process gesture results
            let finalGesture = 'None';
            let finalConfidence = 0;

            // 1. Check standard MediaPipe gestures
            if (results.gestures.length > 0 && results.gestures[0].length > 0) {
                const primary = results.gestures[0][0];
                finalGesture = primary.categoryName;
                finalConfidence = primary.score;
            }

            // 2. Override/Augment with custom ASL heuristics
            if (results.landmarks && results.landmarks.length > 0) {
                const aslMatch = detectASLGesture(results.landmarks[0]);

                // FORCE PRIORITY for numbers 1, 2, 3
                if (aslMatch) {
                    finalGesture = aslMatch.gesture;
                    finalConfidence = aslMatch.confidence;
                }
            }

            // Only update state if gesture changed or confidence shifted significantly
            setGestureOutput(prev => {
                const confidenceDiff = Math.abs(prev.confidence - finalConfidence);
                if (prev.gesture !== finalGesture || confidenceDiff > 0.05) {
                    return {
                        gesture: finalGesture,
                        confidence: finalConfidence
                    };
                }
                return prev;
            });

        } catch (err) {
            console.warn('Prediction error (usually frame timing):', err);
        }
    }, []);

    return {
        isInitializing,
        gestureOutput,
        error,
        predictWebcam
    };
}
