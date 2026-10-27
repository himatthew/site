import React, { useState, useEffect, useRef } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { PostItem, MediaContent } from '../types';

interface FeedItemProps {
  post: PostItem;
  isLast?: boolean;
  onVideoClick: (videoList: MediaContent[]) => void;
  playingAudioId: string | null;
  setPlayingAudioId: (id: string | null) => void;
}

function formatPublishTime(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(' ');
  if (parts.length < 2) return dateStr;
  const [dPart, tPart] = parts;
  const [year, month, day] = dPart.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return `${year}.${month}.${day} ${tPart}`;
}

export const FeedItem: React.FC<FeedItemProps> = ({
  post,
  isLast,
  onVideoClick,
  playingAudioId,
  setPlayingAudioId,
}) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Single video aspect ratio
  const [videoAspect, setVideoAspect] = useState<'h' | 'v' | 's'>('h');
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Audio player state
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioId = useRef(`audio-${post.id}`).current;
  const isAudioPlaying = playingAudioId === audioId;
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Intersection Observer for scroll animation
  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const mediaType = React.useMemo(() => {
    if (!post.content || post.content.length === 0) return 'text';
    if (post.content.every((c) => c.type === 'video')) return 'video';
    if (post.content.every((c) => c.type === 'audio')) return 'audio';
    return 'image';
  }, [post.content]);

  // Video aspect ratio detection
  useEffect(() => {
    if (mediaType === 'video' && post.content.length > 0) {
      const coverUrl = post.content[0].cover_image;
      if (coverUrl) {
        const img = new Image();
        img.src = coverUrl;
        img.onload = () => {
          if (img.width > img.height) {
            setVideoAspect('h');
          } else if (img.width < img.height) {
            setVideoAspect('v');
          } else {
            setVideoAspect('s');
          }
        };
      }
    }
  }, [mediaType, post.content]);

  // Audio pause sync
  useEffect(() => {
    if (!isAudioPlaying && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
    }
  }, [isAudioPlaying]);

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(audioId);
      audioRef.current.play().catch(() => {});
    }
  };

  const formatAudioTime = (sec: number): string => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newRatio = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = newRatio * duration;
  };

  const descAlign = post.desc.trim().length <= 26 ? 'center' : 'justify';

  return (
    <div
      ref={itemRef}
      className={`wrapper___23ssd animate__animated ${isVisible ? 'animate__fadeInUp visible' : ''}`}
      data-id={post.id}
    >
      <div className="date___26X10">{formatPublishTime(post.publish_time)}</div>

      {/* Media Box */}
      {post.content && post.content.length > 0 && (
        <div>
          {/* Standalone Video Post */}
          {mediaType === 'video' && (
            <div
              className={`wrapper___3Kcrb ${videoAspect === 'v' ? 'vv___2Khqc' : ''}`}
              onClick={() => onVideoClick(post.content)}
            >
              <img
                className={
                  videoAspect === 'v'
                    ? 'coverV___1NUUn'
                    : videoAspect === 's'
                    ? 'coverE___zInCz'
                    : 'cover___1V6HY'
                }
                src={post.content[0].cover_image || post.content[0].content}
                alt=""
                loading="lazy"
              />
              <div className="play___oHeej" />
            </div>
          )}

          {/* Audio Player Card */}
          {mediaType === 'audio' && (
            <div className="wrapper___117Fr">
              <audio
                ref={audioRef}
                src={post.content[0].content}
                preload="metadata"
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
                onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime || 0)}
                onEnded={() => {
                  setPlayingAudioId(null);
                  setCurrentTime(0);
                }}
              />
              <div className="audioBox___MRwgj">
                <div className="play___2Zf_G" onClick={toggleAudio}>
                  {isAudioPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  )}
                </div>
                <div className="processBar___2k9TJ" onClick={handleProgressBarClick}>
                  <div
                    className="innerBar____MT2T"
                    style={{
                      width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                    }}
                  />
                </div>
                <div className="processInfo___1XoYu">
                  <span>{formatAudioTime(currentTime)}</span>
                  <span>/</span>
                  <span>{formatAudioTime(duration)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Multi-Media Row (Images & Mixed Videos) with zero gap and uniform height */}
          {mediaType === 'image' && (
            <div className="wrapper___2lOoE">
              <div className="imgList___dYav9">
                <PhotoProvider
                  maskClosable={true}
                  loop={false}
                  bannerVisible={true}
                  onIndexChange={(idx) => setActivePhotoIndex(idx)}
                  onVisibleChange={(visible, idx) => {
                    if (visible && idx !== undefined) setActivePhotoIndex(idx);
                  }}
                >
                  {post.content.map((item, idx) =>
                    item.type === 'video' ? (
                      <PhotoView
                        key={`${idx}-${item.id}`}
                        width={typeof window !== 'undefined' ? window.innerWidth : 430}
                        height={typeof window !== 'undefined' ? window.innerWidth + 60 : 490}
                        render={() =>
                          idx === activePhotoIndex ? (
                            <div className="videoBox___3bdE9" onClick={(e) => e.stopPropagation()}>
                              <video
                                playsInline
                                src={item.content}
                                controls
                                autoPlay
                                poster={item.cover_image}
                                preload="auto"
                              />
                              {item.download && (
                                <a
                                  className="downloadVideo___3Gz7i"
                                  download="download"
                                  href={item.download}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  存
                                </a>
                              )}
                            </div>
                          ) : null
                        }
                      >
                        <div className="imgBox____j4u6 shot">
                          <img
                            src={item.cover_image || item.content}
                            alt=""
                            loading="lazy"
                          />
                          <div className="play___20_cq" />
                        </div>
                      </PhotoView>
                    ) : (
                      <PhotoView key={`${idx}-${item.id}`} src={item.content}>
                        <div className="imgBox____j4u6 shot">
                          <img src={item.content} alt="" loading="lazy" />
                        </div>
                      </PhotoView>
                    )
                  )}
                </PhotoProvider>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Description */}
      {post.desc && (
        <div className="desc___3Fxag" style={{ textAlign: descAlign }}>
          {post.desc}
        </div>
      )}

      {/* Bottom Cover Gradient on last item */}
      {isLast && <div className="cover___khQCH" />}
    </div>
  );
};
