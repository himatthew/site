import React, { useState, useEffect, useRef } from 'react';

const TOTAL_FRAMES = 57;
const FRAME_INTERVAL = 140; // ms

export const getWaterFrames = (): string[] => {
  const frames: string[] = [];
  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const num = i < 10 ? '0' + i : i.toString();
    frames.push(`/imgs23/water/water_000${num}.jpg`);
  }
  return frames;
};

interface WaterBackgroundProps {
  onLoaded?: () => void;
}

export const WaterBackground: React.FC<WaterBackgroundProps> = ({ onLoaded }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const frames = useRef(getWaterFrames()).current;
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    let loadedCount = 0;
    const preloadTarget = 10; // once first 10 frames are loaded, can start smoothly

    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        if (loadedCount >= preloadTarget && onLoaded) {
          onLoaded();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= preloadTarget && onLoaded) {
          onLoaded();
        }
      };
    });

    // Fallback if cached or fast
    const timeout = setTimeout(() => {
      onLoaded?.();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [frames, onLoaded]);

  useEffect(() => {
    timerRef.current = window.setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % TOTAL_FRAMES);
    }, FRAME_INTERVAL);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return (
    <div className="bgList" aria-hidden="true">
      {frames.map((src, index) => (
        <div
          key={src}
          className={`bgImg ${index === currentFrame ? 'active' : ''}`}
          style={{ backgroundImage: `url(${src})` }}
        />
      ))}
    </div>
  );
};
