'use client';

import { SortMode, ContentType, TIPO_COLORS, TIPO_ICONS } from '@/types/reel';

interface FilterBarProps {
  categories: string[];
  formats: string[];
  types: ContentType[];
  selectedCategories: string[];
  selectedFormats: string[];
  selectedTypes: ContentType[];
  search: string;
  sort: SortMode;
  onCategoryToggle: (cat: string) => void;
  onFormatToggle: (fmt: string) => void;
  onTypeToggle: (type: ContentType) => void;
  onSearchChange: (val: string) => void;
  onSortChange: (mode: SortMode) => void;
}

export default function FilterBar({
  categories,
  formats,
  types,
  selectedCategories,
  selectedFormats,
  selectedTypes,
  search,
  sort,
  onCategoryToggle,
  onFormatToggle,
  onTypeToggle,
  onSearchChange,
  onSortChange,
}: FilterBarProps) {
  return (
    <div className="space-y-3 mb-6">
      {/* Search + Sort row */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by handle or hook..."
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
          />
        </div>
        <select
          value={sort}
          onChange={e => onSortChange(e.target.value as SortMode)}
          className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-zinc-600 cursor-pointer"
        >
          <option value="views">Most Viewed</option>
          <option value="engagement">Top Engagement</option>
          <option value="date">Más Recientes</option>
          <option value="alpha">A → Z</option>
        </select>
      </div>

      {/* Type chips */}
      {types.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-zinc-500 self-center mr-1">Tipo:</span>
          {types.map(tipo => {
            const active = selectedTypes.includes(tipo);
            const colors = TIPO_COLORS[tipo];
            return (
              <button
                key={tipo}
                onClick={() => onTypeToggle(tipo)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? `${colors.bg} ${colors.text} ${colors.border}`
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                {TIPO_ICONS[tipo]} {tipo}
              </button>
            );
          })}
        </div>
      )}

      {/* Category chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 self-center mr-1">Categoría:</span>
        {categories.map(cat => {
          const active = selectedCategories.includes(cat);
          return (
            <button
              key={cat}
              onClick={() => onCategoryToggle(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Format chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-zinc-500 self-center mr-1">Formato:</span>
        {formats.map(fmt => {
          const active = selectedFormats.includes(fmt);
          return (
            <button
              key={fmt}
              onClick={() => onFormatToggle(fmt)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                active
                  ? 'bg-violet-600/20 text-violet-300 border-violet-500/40'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              {fmt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
