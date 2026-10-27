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

  // Preload all frames actively using new Image()
  useEffect(() => {
    let loadedCount = 0;

    frames.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedCount++;
        // Once the first 3 frames are in memory, notify ready
        if (loadedCount >= 3 && onLoaded) {
          onLoaded();
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 3 && onLoaded) {
          onLoaded();
        }
      };
    });

    const fallbackTimer = setTimeout(() => {
      onLoaded?.();
    }, 600);

    return () => clearTimeout(fallbackTimer);
  }, [frames, onLoaded]);

  // Animation frame ticker at 140ms
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
      {/* Base stationary frame: ensures zero black flash on initial load */}
      <img
        src={frames[0]}
        alt=""
        className="bgImg baseFrame"
        loading="eager"
        decoding="sync"
      />
      {/* 57 Sequence Frames: rendered as native <img> elements matching official site */}
      {frames.map((src, index) => (
        <img
          key={src}
          src={src}
          alt=""
          className={`bgImg ${index === currentFrame ? 'active' : ''}`}
          loading="eager"
          decoding="async"
        />
      ))}
    </div>
  );
};
