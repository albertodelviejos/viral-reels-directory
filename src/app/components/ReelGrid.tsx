'use client';

import { useState, useMemo, useEffect } from 'react';
import { Reel, SortMode, ContentType } from '@/types/reel';
import FilterBar from './FilterBar';
import ReelCard from './ReelCard';
import DetailPanel from './DetailPanel';

const STORAGE_KEY = 'viral-reels-seen';

const MONTH_MAP: Record<string, number> = {
  ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
  jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  jan: 0, apr: 3, aug: 7, dec: 11,
};

function parseDateStr(s: string): number {
  if (!s) return 0;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s).getTime();
  const parts = s.toLowerCase().split(/\s+/);
  if (parts.length >= 3) {
    const month = MONTH_MAP[parts[0]];
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);
    if (month !== undefined && day && year) return new Date(year, month, day).getTime();
  }
  return 0;
}

function getSeenLinks(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const data = JSON.parse(raw);
    return new Set(data.links || []);
  } catch {
    return new Set();
  }
}

function saveSeenLinks(links: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      links,
      updatedAt: Date.now(),
    }));
  } catch {}
}

export default function ReelGrid({ reels }: { reels: Reel[] }) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortMode>('views');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<ContentType[]>([]);
  const [selectedReel, setSelectedReel] = useState<Reel | null>(null);
  const [newLinks, setNewLinks] = useState<Set<string>>(new Set());

  // Detect new reels on mount
  useEffect(() => {
    const seen = getSeenLinks();
    const currentLinks = reels.map(r => r.link).filter(Boolean);

    if (seen.size === 0) {
      // First visit — mark all current as seen, nothing is "new"
      saveSeenLinks(currentLinks);
      return;
    }

    // Find links not in seen
    const unseen = new Set(currentLinks.filter(link => !seen.has(link)));
    setNewLinks(unseen);

    // Save all current links as seen (after 5s so user sees the badges)
    const timer = setTimeout(() => {
      saveSeenLinks(currentLinks);
    }, 30000); // Mark as seen after 30 seconds

    return () => clearTimeout(timer);
  }, [reels]);

  const newCount = newLinks.size;

  const categories = useMemo(() => [...new Set(reels.map(r => r.category))].sort(), [reels]);
  const formats = useMemo(
    () => [...new Set(reels.map(r => r.format))].filter(f => f && f !== 'Pendiente').sort(),
    [reels]
  );
  const types = useMemo(
    () => [...new Set(reels.map(r => r.tipo))] as ContentType[],
    [reels]
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleFormat = (fmt: string) => {
    setSelectedFormats(prev =>
      prev.includes(fmt) ? prev.filter(f => f !== fmt) : [...prev, fmt]
    );
  };

  const toggleType = (tipo: ContentType) => {
    setSelectedTypes(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  const filtered = useMemo(() => {
    let result = [...reels];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        r => r.handle.toLowerCase().includes(q) || r.hook.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategories.length > 0) {
      result = result.filter(r => selectedCategories.includes(r.category));
    }

    if (selectedFormats.length > 0) {
      result = result.filter(r => selectedFormats.includes(r.format));
    }

    if (selectedTypes.length > 0) {
      result = result.filter(r => selectedTypes.includes(r.tipo));
    }

    if (sort === 'views') {
      result.sort((a, b) => b.viewsNum - a.viewsNum);
    } else if (sort === 'engagement') {
      result.sort((a, b) => b.engagementNum - a.engagementNum);
    } else if (sort === 'date') {
      result.sort((a, b) => parseDateStr(b.date) - parseDateStr(a.date));
    } else {
      result.sort((a, b) => a.handle.localeCompare(b.handle));
    }

    // Put new reels first (within current sort)
    if (newLinks.size > 0) {
      result.sort((a, b) => {
        const aNew = newLinks.has(a.link) ? 1 : 0;
        const bNew = newLinks.has(b.link) ? 1 : 0;
        return bNew - aNew;
      });
    }

    return result;
  }, [reels, search, sort, selectedCategories, selectedFormats, selectedTypes, newLinks]);

  return (
    <>
      {/* New reels banner */}
      {newCount > 0 && (
        <div className="mb-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">{newCount}</span>
            <span className="text-emerald-400 text-sm font-medium">
              {newCount === 1 ? 'nuevo contenido añadido' : 'nuevos contenidos añadidos'} hoy
            </span>
          </div>
          <button
            onClick={() => { setNewLinks(new Set()); saveSeenLinks(reels.map(r => r.link).filter(Boolean)); }}
            className="text-xs text-emerald-500/60 hover:text-emerald-400 transition-colors"
          >
            Marcar como vistos
          </button>
        </div>
      )}

      <FilterBar
        categories={categories}
        formats={formats}
        types={types}
        selectedCategories={selectedCategories}
        selectedFormats={selectedFormats}
        selectedTypes={selectedTypes}
        search={search}
        sort={sort}
        onCategoryToggle={toggleCategory}
        onFormatToggle={toggleFormat}
        onTypeToggle={toggleType}
        onSearchChange={setSearch}
        onSortChange={setSort}
      />

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500 text-sm">No reels match your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((reel, i) => (
            <ReelCard
              key={`${reel.link}-${i}`}
              reel={reel}
              isNew={newLinks.has(reel.link)}
              onClick={() => setSelectedReel(reel)}
            />
          ))}
        </div>
      )}

      <DetailPanel reel={selectedReel} onClose={() => setSelectedReel(null)} />
    </>
  );
}
