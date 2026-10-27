import React, { useState } from 'react';
import { PostItem, MediaContent } from '../types';

interface DailyUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPost: (newPost: PostItem) => void;
  currentPosts: PostItem[];
}

export const DailyUpdateModal: React.FC<DailyUpdateModalProps> = ({
  isOpen,
  onClose,
  onAddPost,
  currentPosts,
}) => {
  const getNowString = () => {
    const d = new Date();
    const pad = (n: number) => (n < 10 ? '0' + n : n.toString());
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  const [publishTime, setPublishTime] = useState(getNowString());
  const [desc, setDesc] = useState('');
  const [mediaItems, setMediaItems] = useState<
    Array<{ type: 'image' | 'video' | 'audio'; content: string; cover_image?: string }>
  >([]);

  // Current media input
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [coverUrl, setCoverUrl] = useState('');

  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleAddMedia = () => {
    if (!mediaUrl.trim()) return;
    setMediaItems((prev) => [
      ...prev,
      {
        type: mediaType,
        content: mediaUrl.trim(),
        cover_image: coverUrl.trim() || undefined,
      },
    ]);
    setMediaUrl('');
    setCoverUrl('');
  };

  const handleRemoveMedia = (idx: number) => {
    setMediaItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = Math.max(0, ...currentPosts.map((p) => p.id)) + 1;
    const formattedContent: MediaContent[] = mediaItems.map((m, idx) => ({
      id: newId * 10 + idx,
      posts_id: newId,
      type: m.type,
      content: m.content,
      sort: idx + 1,
      cover_image: m.cover_image,
      download: m.type === 'video' ? m.content : undefined,
    }));

    const newPost: PostItem = {
      id: newId,
      if_comment: 0,
      status: 'published',
      desc: desc || '.',
      publish_time: publishTime,
      content: formattedContent,
      comment_list: [],
    };

    onAddPost(newPost);
    alert('已成功插入新动态到当前页面！你可以立即点击“导出 posts.json”或提交到 GitHub 触发 Vercel 自动部署。');
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentPosts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'posts.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyGitCommand = () => {
    const cmd = `git add . && git commit -m "feat(feed): daily update ${new Date().toISOString().slice(0, 10)}" && git push`;
    navigator.clipboard.writeText(cmd).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="adminModalMask" onClick={onClose}>
      <div className="adminModal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>📝 每日更新管理面板</h3>
          <span style={{ cursor: 'pointer', fontSize: 20, color: '#a1a1aa' }} onClick={onClose}>
            ✕
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#d4d4d8' }}>
              发布时间 (YYYY-MM-DD HH:mm:ss)
            </label>
            <input
              type="text"
              value={publishTime}
              onChange={(e) => setPublishTime(e.target.value)}
              style={{
                width: '100%',
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: 6,
                padding: '8px 10px',
                color: '#fff',
                fontSize: 14,
              }}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#d4d4d8' }}>
              文案描述 (Desc)
            </label>
            <textarea
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="输入今日随笔/文字，支持换行..."
              rows={3}
              style={{
                width: '100%',
                background: '#27272a',
                border: '1px solid #3f3f46',
                borderRadius: 6,
                padding: '8px 10px',
                color: '#fff',
                fontSize: 14,
                resize: 'vertical',
              }}
            />
          </div>

          {/* Media list */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 13, marginBottom: 6, color: '#d4d4d8' }}>
              媒体列表 (已添加 {mediaItems.length} 个)
            </label>

            {mediaItems.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
                {mediaItems.map((m, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#27272a',
                      padding: '6px 10px',
                      borderRadius: 6,
                      fontSize: 12,
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      [{m.type}] {m.content}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(i)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f87171',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
              <select
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as any)}
                style={{
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: 6,
                  color: '#fff',
                  padding: '6px 8px',
                  fontSize: 13,
                }}
              >
                <option value="image">图片 (image)</option>
                <option value="video">视频 (video)</option>
                <option value="audio">音频 (audio)</option>
              </select>
              <input
                type="text"
                placeholder="媒体资源完整 URL (https://...)"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                style={{
                  flex: 1,
                  background: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: 6,
                  padding: '6px 10px',
                  color: '#fff',
                  fontSize: 13,
                }}
              />
            </div>

            {mediaType === 'video' && (
              <div style={{ marginBottom: 6 }}>
                <input
                  type="text"
                  placeholder="视频封面图 URL (可选)"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: 6,
                    padding: '6px 10px',
                    color: '#fff',
                    fontSize: 13,
                  }}
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleAddMedia}
              style={{
                width: '100%',
                background: '#3f3f46',
                border: 'none',
                borderRadius: 6,
                padding: '6px 0',
                color: '#fff',
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              + 添加此项媒体
            </button>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                background: '#e11d48',
                border: 'none',
                borderRadius: 6,
                padding: '10px 0',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🚀 预览此条动态
            </button>
            <button
              type="button"
              onClick={handleExportJson}
              style={{
                flex: 1,
                background: '#2563eb',
                border: 'none',
                borderRadius: 6,
                padding: '10px 0',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              💾 导出 posts.json
            </button>
          </div>
        </form>

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid #27272a' }}>
          <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 8 }}>
            💡 每日更新方式：
          </div>
          <ol style={{ fontSize: 12, color: '#71717a', paddingLeft: 18, lineHeight: 1.6, margin: 0 }}>
            <li>直接修改项目的 <code>src/data/posts.json</code> 或导出本面板生成的 JSON 覆盖文件。</li>
            <li>执行 git 提交并推送至 GitHub，Vercel 监听到提交后将在数十秒内自动重新构建并上线！</li>
            <li>也可以配置内置的 GitHub Actions，每天全自动定时拉取最新动态。</li>
          </ol>
          <button
            type="button"
            onClick={handleCopyGitCommand}
            style={{
              marginTop: 12,
              width: '100%',
              background: '#27272a',
              border: '1px solid #3f3f46',
              borderRadius: 6,
              padding: '8px 0',
              color: '#d4d4d8',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            {copied ? '✅ 已复制 Git 命令！' : '📋 复制一键 Git 提交部署命令'}
          </button>
        </div>
      </div>
    </div>
  );
};
