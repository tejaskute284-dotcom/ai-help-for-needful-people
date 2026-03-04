## 2025-05-15 - [Real-time Gesture Detection Optimizations]
**Learning:** High-frequency animation loops in React (60fps+) can cause significant performance degradation if state updates are triggered on every frame, even with unchanged data. Caching utility objects like `DrawingUtils` in a `useRef` and throttling `setState` calls based on a "significance threshold" (e.g., > 5% confidence change) drastically reduces GC pressure and re-renders.

**Action:** Always use `useRef` to cache objects created within `requestAnimationFrame` and implement state update throttling for high-frequency data streams.
