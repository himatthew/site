export interface MediaContent {
  id: number;
  posts_id: number;
  type: 'image' | 'video' | 'audio';
  content: string;
  sort: number;
  cover_image?: string;
  download?: string;
}

export interface CommentItem {
  id: number;
  user_info?: {
    nick: string;
  };
  content?: string;
  images?: string[];
}

export interface PostItem {
  id: number;
  if_comment?: number;
  status: string;
  desc: string;
  publish_time: string;
  content: MediaContent[];
  comment_list?: CommentItem[];
}
