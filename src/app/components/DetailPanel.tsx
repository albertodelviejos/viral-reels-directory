'use client';

import { useState } from 'react';
import { Reel, CATEGORY_COLORS, TIPO_COLORS, TIPO_ICONS } from '@/types/reel';

interface DetailPanelProps {
  reel: Reel | null;
  onClose: () => void;
}

function formatCompact(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

function getShortcode(link: string): string | null {
  const match = link.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
}

function ThumbnailOverlay({ tipo }: { tipo: Reel['tipo'] }) {
  if (tipo === 'Reel') {
    return (
      <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
      </svg>
    );
  }
  if (tipo === 'Carrusel') {
    return (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0-4-4m4 4-4 4M5 11l4-4M5 11l4 4" />
      </svg>
    );
  }
  // Post
  return (
    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2 1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

export default function DetailPanel({ reel, onClose }: DetailPanelProps) {
  const [imgError, setImgError] = useState(false);

  if (!reel) return null;

  const colors = CATEGORY_COLORS[reel.category] || { bg: 'bg-zinc-700/15', text: 'text-zinc-400', border: 'border-zinc-600/30' };
  const tipoColors = TIPO_COLORS[reel.tipo];
  const shortcode = getShortcode(reel.link);
  const ctaLabel = `Ver ${reel.tipo} en Instagram →`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto animate-slide-in">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-semibold text-white">{reel.handle}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Thumbnail grande */}
          {shortcode && !imgError ? (
            <a href={reel.link} target="_blank" rel="noopener noreferrer" className="block relative rounded-xl overflow-hidden border border-zinc-800 group cursor-pointer">
              <img
                src={`/api/thumbnail?url=${encodeURIComponent(reel.link)}`}
                alt={reel.hook || reel.handle}
                className="w-full object-cover max-h-[500px]"
                onError={() => setImgError(true)}
              />
              {/* Overlay icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center group-hover:bg-white/25 transition-colors">
                  <ThumbnailOverlay tipo={reel.tipo} />
                </div>
              </div>
              <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs text-white">
                Toca para ver en Instagram
              </div>
            </a>
          ) : (
            <div className="rounded-xl overflow-hidden border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center h-48">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {reel.handle.replace('@', '')[0]?.toUpperCase()}
              </div>
            </div>
          )}

          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-pink-500 flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
              {reel.handle.replace('@', '')[0]?.toUpperCase()}
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">{reel.name}</h3>
              <p className="text-sm text-zinc-400">{reel.handle}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Views</p>
              <p className="text-xl font-bold text-white">{reel.views}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Seguidores</p>
              <p className="text-xl font-bold text-white">{reel.followers}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Fecha</p>
              <p className="text-base font-bold text-white">{reel.date || '—'}</p>
            </div>
          </div>

          {/* Engagement metrics */}
          {(reel.likes || reel.comments || reel.engagement) && (
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Engagement</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{reel.likesNum ? formatCompact(reel.likesNum) : '—'}</p>
                  <p className="text-[10px] text-zinc-500">❤️ Likes</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-white">{reel.commentsNum ? formatCompact(reel.commentsNum) : '—'}</p>
                  <p className="text-[10px] text-zinc-500">💬 Comments</p>
                </div>
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
                  <p className={`text-lg font-bold ${
                    reel.engagementNum >= 5 ? 'text-emerald-400' :
                    reel.engagementNum >= 2 ? 'text-amber-400' : 'text-white'
                  }`}>{reel.engagement || '—'}</p>
                  <p className="text-[10px] text-zinc-500">📊 Engagement</p>
                </div>
              </div>
            </div>
          )}

          {/* Tipo + Category */}
          <div className="flex flex-wrap gap-3">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Tipo</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${tipoColors.bg} ${tipoColors.text} ${tipoColors.border}`}>
                {TIPO_ICONS[reel.tipo]} {reel.tipo}
              </span>
            </div>
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Categoría</p>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                {reel.category}
              </span>
            </div>
          </div>

          {/* Hook */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Hook / Tema</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{reel.hook}</p>
          </div>

          {/* Format */}
          <div>
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Por qué funciona (Formato)</p>
            <p className="text-sm text-zinc-300 leading-relaxed">{reel.format}</p>
          </div>

          {/* CTA */}
          <a
            href={reel.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-gradient-to-r from-violet-600 to-pink-500 hover:from-violet-500 hover:to-pink-400 text-white font-semibold py-3 rounded-lg transition-all"
          >
            {ctaLabel}
          </a>
        </div>
      </div>
    </>
  );
}
