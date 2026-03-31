export type ContentType = 'Reel' | 'Carrusel' | 'Post';

export interface Reel {
  handle: string;
  name: string;
  followers: string;
  followersNum: number;
  category: string;
  views: string;
  viewsNum: number;
  hook: string;
  format: string;
  link: string;
  date: string;
  likes: string;
  likesNum: number;
  comments: string;
  commentsNum: number;
  engagement: string;
  engagementNum: number;
  tipo: ContentType;
}

export type SortMode = 'views' | 'alpha' | 'date' | 'engagement';

export const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'AI Automation': { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
  'Vibe Coding': { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  'AI Tools': { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
};

export const TIPO_COLORS: Record<ContentType, { bg: string; text: string; border: string }> = {
  Reel: { bg: 'bg-violet-500/15', text: 'text-violet-400', border: 'border-violet-500/30' },
  Carrusel: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  Post: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
};

export const TIPO_ICONS: Record<ContentType, string> = {
  Reel: '🎬',
  Carrusel: '📸',
  Post: '🖼️',
};
