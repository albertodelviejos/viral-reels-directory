'use client';

import { Reel } from '@/types/reel';

export default function StatsBar({ reels }: { reels: Reel[] }) {
  const total = reels.length;
  const topReel = reels.reduce((max, r) => (r.viewsNum > max.viewsNum ? r : max), reels[0]);
  
  const reelCount = reels.filter(r => r.tipo === 'Reel').length;
  const carruselCount = reels.filter(r => r.tipo === 'Carrusel').length;
  const postCount = reels.filter(r => r.tipo === 'Post').length;

  const withEngagement = reels.filter(r => r.engagementNum > 0);
  const avgEngagement = withEngagement.length > 0
    ? (withEngagement.reduce((sum, r) => sum + r.engagementNum, 0) / withEngagement.length).toFixed(1)
    : '—';
  
  const topEngagement = withEngagement.length > 0
    ? withEngagement.reduce((max, r) => r.engagementNum > max.engagementNum ? r : max, withEngagement[0])
    : null;

  const breakdownParts: string[] = [];
  if (reelCount > 0) breakdownParts.push(`${reelCount} reels`);
  if (carruselCount > 0) breakdownParts.push(`${carruselCount} carruseles`);
  if (postCount > 0) breakdownParts.push(`${postCount} posts`);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Contenidos</p>
        <p className="text-2xl font-semibold text-white">{total}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{breakdownParts.join(' · ')}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Top Viewed</p>
        <p className="text-2xl font-semibold text-white">{topReel?.views || '—'}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{topReel?.handle || ''}</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Avg Engagement</p>
        <p className="text-2xl font-semibold text-white">{avgEngagement}%</p>
        <p className="text-xs text-zinc-600 mt-0.5">{withEngagement.length} con datos</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Top Engagement</p>
        <p className="text-2xl font-semibold text-emerald-400">{topEngagement?.engagement || '—'}</p>
        <p className="text-xs text-zinc-600 mt-0.5">{topEngagement?.handle || ''}</p>
      </div>
    </div>
  );
}
