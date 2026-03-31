'use client';

import { useState } from 'react';
import { Reel, CATEGORY_COLORS, TIPO_COLORS, TIPO_ICONS } from '@/types/reel';

interface ReelCardProps {
  reel: Reel;
  isNew?: boolean;
  onClick: () => void;
}

function getShortcode(link: string): string | null {
  const match = link.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function OverlayIcon({ tipo }: { tipo: Reel['tipo'] }) {
  if (tipo === 'Reel') {
    return (
      <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
    );
  }
  if (tipo === 'Carrusel') {
    return (
      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0-4-4m4 4-4 4M5 11l4-4M5 11l4 4" />
      </svg>
    );
  }
  // Post
  return (
    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function ReelCard({ reel, isNew, onClick }: ReelCardProps) {
  const colors = CATEGORY_COLORS[reel.category] || { bg: 'bg-zinc-700/15', text: 'text-zinc-400', border: 'border-zinc-600/30' };
  const tipoColors = TIPO_COLORS[reel.tipo];
  const initial = reel.handle.replace('@', '')[0]?.toUpperCase() || '?';
  const shortcode = getShortcode(reel.link);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onClick}
      className={`bg-zinc-900 border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:shadow-black/20 group ${
        isNew
          ? 'border-emerald-500/40 ring-1 ring-emerald-500/20 hover:border-emerald-400/60'
          : 'border-zinc-800 hover:border-zinc-600'
      }`}
    >
      {/* Thumbnail */}
      <div className="relative aspect-square bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden">
        {shortcode && !imgError ? (
          <img
            src={`/api/thumbnail?url=${encodeURIComponent(reel.link)}`}
            alt={reel.hook || reel.handle}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {initial}
          </div>
        )}
        {/* Views badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-lg">
          <span className="text-white font-bold text-sm">{reel.views}</span>
          <span className="text-zinc-400 text-xs ml-1">views</span>
        </div>
        {/* Tipo + NEW badges (top left) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          <div className={`px-2 py-0.5 rounded-md border backdrop-blur-sm ${tipoColors.bg} ${tipoColors.border}`}>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${tipoColors.text}`}>
              {TIPO_ICONS[reel.tipo]} {reel.tipo}
            </span>
          </div>
          {isNew && (
            <div className="bg-emerald-500 shadow-lg shadow-emerald-500/30 px-2.5 py-0.5 rounded-md animate-pulse">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider">New</span>
            </div>
          )}
        </div>
        {/* Hover overlay icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
          <div className="w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center">
            <OverlayIcon tipo={reel.tipo} />
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="p-3 space-y-1.5">
        <div className="flex items-center justify-between gap-1">
          <span className="text-sm font-semibold text-white truncate">{reel.handle}</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
            {reel.category}
          </span>
        </div>
        <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{reel.hook}</p>
        <div className="flex items-center justify-between text-[10px] text-zinc-600">
          {reel.date && <span>{reel.date}</span>}
          {reel.engagement && (
            <span className={`font-medium ${
              reel.engagementNum >= 5 ? 'text-emerald-500' :
              reel.engagementNum >= 2 ? 'text-amber-500' : 'text-zinc-500'
            }`}>
              {reel.engagement} eng
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
