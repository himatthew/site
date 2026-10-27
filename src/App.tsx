import React, { useState, useEffect, useRef, useCallback } from 'react';
import initialPostsData from './data/posts.json';
import { PostItem, MediaContent } from './types';
import { WaterBackground } from './components/WaterBackground';
import { FeedItem } from './components/FeedItem';
import { VideoModal } from './components/VideoModal';
import { DailyUpdateModal } from './components/DailyUpdateModal';

const PAGE_SIZE = 20;

export const App: React.FC = () => {
  const [allPosts, setAllPosts] = useState<PostItem[]>(initialPostsData as PostItem[]);
  const [currentPage, setCurrentPage] = useState(1);
  const [waterLoaded, setWaterLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Audio player single-track playback sync
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);

  // Standalone Video Swiper Modal
  const [videoModalVisible, setVideoModalVisible] = useState(false);
  const [activeVideoList, setActiveVideoList] = useState<MediaContent[]>([]);

  // Admin / Daily update modal
  const [adminOpen, setAdminOpen] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  // Attempt to load runtime /data/posts.json if exists and has newer data
  useEffect(() => {
    fetch('/data/posts.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found');
      })
      .then((data: PostItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setAllPosts(data);
        }
      })
      .catch(() => {
        // Fallback to bundled initialPostsData
      });
  }, []);

  const handleWaterLoaded = useCallback(() => {
    setWaterLoaded(true);
    setLoading(false);
  }, []);

  // Check loading completion & safety fallback
  useEffect(() => {
    if (waterLoaded) {
      setLoading(false);
    }
    const safetyTimer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(safetyTimer);
  }, [waterLoaded]);

  // Keyboard shortcut (Ctrl+Shift+U or Cmd+Shift+U) to toggle admin panel
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        setAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight - scrollTop - clientHeight < 300) {
      setCurrentPage((prev) => {
        const maxPage = Math.ceil(allPosts.length / PAGE_SIZE);
        if (prev < maxPage) {
          return prev + 1;
        }
        return prev;
      });
    }
  }, [allPosts.length]);

  const handleTitleClick = () => {
    listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleVideoClick = (videoList: MediaContent[]) => {
    setActiveVideoList(videoList);
    setVideoModalVisible(true);
  };

  const handleAddNewPost = (newPost: PostItem) => {
    setAllPosts((prev) => [newPost, ...prev]);
  };

  const displayedPosts = allPosts.slice(0, currentPage * PAGE_SIZE);

  return (
    <div className="page">
      {/* Water Ripple Frame Animation Background */}
      <WaterBackground onLoaded={handleWaterLoaded} />

      {/* Header Banner */}
      <div
        className="title"
        onClick={handleTitleClick}
        title="点击返回顶部"
        role="button"
        tabIndex={0}
      />

      {/* Scrollable Feed List */}
      <div
        className="list"
        ref={listRef}
        onScroll={handleScroll}
        id="feed-list"
      >
        <div className="wrapper___ynXr2">
          {displayedPosts.map((post, index) => (
            <FeedItem
              key={post.id}
              post={post}
              isLast={index === displayedPosts.length - 1}
              onVideoClick={handleVideoClick}
              playingAudioId={playingAudioId}
              setPlayingAudioId={setPlayingAudioId}
            />
          ))}
        </div>
      </div>

      {/* Standalone Video Swiper Modal */}
      <VideoModal
        visible={videoModalVisible}
        videoList={activeVideoList}
        onClose={() => setVideoModalVisible(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="loadingBox">
          <svg className="loadingSpinner" viewBox="0 0 32 32" fill="none">
            <circle
              cx="16"
              cy="16"
              r="12"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="3"
            />
            <path
              d="M16 4 A12 12 0 0 1 28 16"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      )}

      {/* Admin Toggle Button */}
      <div
        className="adminToggleBtn"
        onClick={() => setAdminOpen(true)}
        title="每日更新管理 (快捷键: Ctrl+Shift+U)"
      >
        ✎
      </div>

      {/* Daily Update Admin Modal */}
      <DailyUpdateModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
        onAddPost={handleAddNewPost}
        currentPosts={allPosts}
      />
    </div>
  );
};
export default App;
