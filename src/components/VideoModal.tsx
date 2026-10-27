import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MediaContent } from '../types';

interface VideoModalProps {
  visible: boolean;
  videoList: MediaContent[];
  onClose: () => void;
}

export const VideoModal: React.FC<VideoModalProps> = ({
  visible,
  videoList,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    if (visible) {
      setCurrentIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [visible]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videoList.length - 1));
  }, [videoList.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < videoList.length - 1 ? prev + 1 : 0));
  }, [videoList.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, onClose, handlePrev, handleNext]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 40) {
      handleNext();
    } else if (diff < -40) {
      handlePrev();
    }
  };

  if (!visible || !videoList || videoList.length === 0) {
    return null;
  }

  const currentItem = videoList[currentIndex] || videoList[0];

  return (
    <div className="wrapper___3Hk1c">
      {/* Background Mask */}
      <div className="mask___24i5V" onClick={onClose} />

      {/* Close button */}
      <div
        className="closeModalBtn"
        onClick={onClose}
        style={{
          position: 'absolute',
          top: '0.2rem',
          right: '0.25rem',
          zIndex: 100,
          color: '#ffffff',
          fontSize: '0.32rem',
          cursor: 'pointer',
          width: '0.44rem',
          height: '0.44rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: 0.85,
          userSelect: 'none',
        }}
        title="关闭"
      >
        ✕
      </div>

      {/* Pre Arrow (Desktop) */}
      {videoList.length > 1 && (
        <div className="pre___2ETld" onClick={handlePrev}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M31.7 5.1L13.5 22.7a2 2 0 0 0 0 2.8l18.2 17.6"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Swiper Container */}
      <div
        className="swiper___2rtlH"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === 'DIV') {
            onClose();
          }
        }}
      >
        <div className="swiperItem___1c8QI">
          <div>
            <video
              key={currentItem.id || currentItem.content}
              playsInline
              className="video___3Gg40"
              src={currentItem.content}
              poster={currentItem.cover_image}
              controls
              autoPlay
            />
            {currentItem.download && (
              <a
                className="downloadVideo___29VEQ"
                download="download"
                href={currentItem.download}
                target="_blank"
                rel="noopener noreferrer"
              >
                存
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Next Arrow (Desktop) */}
      {videoList.length > 1 && (
        <div className="next___1ZSTa" onClick={handleNext}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
            <path
              d="M17.4 5.1l18.2 17.6a2 2 0 0 1 0 2.8L17.4 43.1"
              stroke="#ffffff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      )}

      {/* Indicator */}
      {videoList.length > 1 && (
        <div className="indicator___3f0Zw">
          {currentIndex + 1}/{videoList.length}
        </div>
      )}

      {/* Dots List (Mobile) */}
      {videoList.length > 1 && (
        <div className="dotsList___1hsob">
          {videoList.map((_, i) => (
            <div
              key={i}
              className={`dot___fbPyN ${i === currentIndex ? 'dotActive___cry5N' : ''}`}
              onClick={() => setCurrentIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
