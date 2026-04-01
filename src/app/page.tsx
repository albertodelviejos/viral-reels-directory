import { fetchReels } from '@/lib/sheets';
import { Reel } from '@/types/reel';
import StatsBar from './components/StatsBar';
import ReelGrid from './components/ReelGrid';

export const revalidate = 300;

export default async function Home() {
  let reels: Reel[] = [];
  let error: string | null = null;

  try {
    reels = await fetchReels();
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Failed to fetch reels:', e);
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Viral Reels Directory
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Tracking viral Instagram content from AI creators · Añade reels al pipeline con el botón <span className="text-zinc-400">+</span>
          </p>
        </div>

        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-400 text-sm">Error loading data: {error}</p>
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500">No reels found</p>
          </div>
        ) : (
          <>
            <StatsBar reels={reels} />
            <ReelGrid reels={reels} />
          </>
        )}
      </div>
    </main>
  );
}
