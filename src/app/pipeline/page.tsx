'use client';

import { useState, useEffect, useCallback } from 'react';
import { CATEGORY_COLORS } from '@/types/reel';

interface PipelineItem {
  id: number;
  reel_link: string;
  handle: string;
  hook: string;
  format: string | null;
  category: string | null;
  tipo: string | null;
  views: string | null;
  stage: string;
  notes: string;
  script: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

const STAGES = ['idea', 'guion', 'grabacion', 'edicion', 'publicado'] as const;
type Stage = typeof STAGES[number];

const STAGE_LABELS: Record<Stage, string> = {
  idea: 'Idea',
  guion: 'Guión',
  grabacion: 'Grabación',
  edicion: 'Edición',
  publicado: 'Publicado',
};

const STAGE_COLORS: Record<Stage, { header: string; bg: string; border: string }> = {
  idea: { header: 'bg-violet-500/20 text-violet-300', bg: 'bg-violet-500/5', border: 'border-violet-500/20' },
  guion: { header: 'bg-blue-500/20 text-blue-300', bg: 'bg-blue-500/5', border: 'border-blue-500/20' },
  grabacion: { header: 'bg-amber-500/20 text-amber-300', bg: 'bg-amber-500/5', border: 'border-amber-500/20' },
  edicion: { header: 'bg-pink-500/20 text-pink-300', bg: 'bg-pink-500/5', border: 'border-pink-500/20' },
  publicado: { header: 'bg-emerald-500/20 text-emerald-300', bg: 'bg-emerald-500/5', border: 'border-emerald-500/20' },
};

function KanbanCard({
  item,
  stageIndex,
  onMove,
  onDelete,
  onUpdateNotes,
  onGenerateScript,
  onViewScript,
  onDragStart,
  generatingId,
}: {
  item: PipelineItem;
  stageIndex: number;
  onMove: (id: number, stage: string) => void;
  onDelete: (id: number) => void;
  onUpdateNotes: (id: number, notes: string) => void;
  onGenerateScript: (id: number) => void;
  onViewScript: (item: PipelineItem) => void;
  onDragStart: (e: React.DragEvent, item: PipelineItem) => void;
  generatingId: number | null;
}) {
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState(item.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const colors = item.category ? CATEGORY_COLORS[item.category] : null;
  const isGenerating = generatingId === item.id;

  const handleNotesBlur = () => {
    if (notes !== item.notes) {
      onUpdateNotes(item.id, notes);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 cursor-grab active:cursor-grabbing hover:border-zinc-600 transition-colors group"
    >
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <span className="text-xs font-semibold text-zinc-300 truncate">{item.handle}</span>
        <div className="flex items-center gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          {stageIndex > 0 && (
            <button
              onClick={() => onMove(item.id, STAGES[stageIndex - 1])}
              className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 text-xs"
              title={`Mover a ${STAGE_LABELS[STAGES[stageIndex - 1]]}`}
            >
              ←
            </button>
          )}
          {stageIndex < STAGES.length - 1 && (
            <button
              onClick={() => onMove(item.id, STAGES[stageIndex + 1])}
              className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-700 text-xs"
              title={`Mover a ${STAGE_LABELS[STAGES[stageIndex + 1]]}`}
            >
              →
            </button>
          )}
          {confirmDelete ? (
            <button
              onClick={() => onDelete(item.id)}
              className="w-5 h-5 rounded flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 text-xs font-bold"
              title="Confirmar eliminar"
            >
              ✓
            </button>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              onBlur={() => setTimeout(() => setConfirmDelete(false), 2000)}
              className="w-5 h-5 rounded flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-zinc-700 text-xs"
              title="Eliminar"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">{item.hook}</p>

      <div className="flex items-center gap-1.5 flex-wrap">
        {colors && item.category && (
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${colors.bg} ${colors.text} ${colors.border}`}>
            {item.category}
          </span>
        )}
        {item.views && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
            {item.views} views
          </span>
        )}
      </div>

      {/* Script button */}
      <div className="mt-2 flex gap-1.5">
        {item.script ? (
          <button
            onClick={() => onViewScript(item)}
            className="flex-1 text-[10px] font-medium px-2 py-1 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30 hover:bg-blue-500/25 transition-colors"
          >
            📄 Ver guión
          </button>
        ) : (
          <button
            onClick={() => onGenerateScript(item.id)}
            disabled={isGenerating}
            className={`flex-1 text-[10px] font-medium px-2 py-1 rounded border transition-colors ${
              isGenerating
                ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-wait'
                : 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25'
            }`}
          >
            {isGenerating ? '⏳ Generando...' : '✨ Generar guión'}
          </button>
        )}
      </div>

      {/* Notes toggle */}
      <button
        onClick={() => setShowNotes(!showNotes)}
        className="mt-2 text-[10px] text-zinc-600 hover:text-zinc-400 transition-colors"
      >
        {showNotes ? '▾ Notas' : '▸ Notas'}
        {item.notes && !showNotes && <span className="ml-1 text-zinc-700">•</span>}
      </button>

      {showNotes && (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          placeholder="Añadir notas..."
          className="mt-1 w-full bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 p-2 resize-none focus:outline-none focus:border-zinc-500 placeholder:text-zinc-600"
          rows={2}
        />
      )}
    </div>
  );
}

function ScriptPanel({
  item,
  onClose,
  onRegenerate,
  generatingId,
}: {
  item: PipelineItem;
  onClose: () => void;
  onRegenerate: (id: number) => void;
  generatingId: number | null;
}) {
  const isGenerating = generatingId === item.id;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-semibold text-white">📄 Guión</h2>
            <p className="text-xs text-zinc-500">{item.handle} — {item.hook.slice(0, 50)}...</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRegenerate(item.id)}
              disabled={isGenerating}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isGenerating
                  ? 'bg-zinc-800 text-zinc-500 border-zinc-700 cursor-wait'
                  : 'bg-violet-500/15 text-violet-400 border-violet-500/30 hover:bg-violet-500/25'
              }`}
            >
              {isGenerating ? '⏳ Generando...' : '🔄 Regenerar'}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Script content */}
        <div className="p-6">
          {item.script ? (
            <div className="prose prose-invert prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm text-zinc-300 leading-relaxed font-mono">
                {item.script}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-zinc-500">No hay guión generado aún</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default function PipelinePage() {
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [generatingId, setGeneratingId] = useState<number | null>(null);
  const [viewingScript, setViewingScript] = useState<PipelineItem | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch('/api/pipeline');
      const data = await res.json();
      setItems(data.items || []);
    } catch (e) {
      console.error('Failed to fetch pipeline:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const moveItem = async (id: number, stage: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, stage } : item));
    try {
      await fetch(`/api/pipeline/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage }),
      });
    } catch {
      fetchItems();
    }
  };

  const deleteItem = async (id: number) => {
    setItems(prev => prev.filter(item => item.id !== id));
    try {
      await fetch(`/api/pipeline/${id}`, { method: 'DELETE' });
    } catch {
      fetchItems();
    }
  };

  const updateNotes = async (id: number, notes: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, notes } : item));
    try {
      await fetch(`/api/pipeline/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
    } catch {
      fetchItems();
    }
  };

  const handleDragStart = (e: React.DragEvent, item: PipelineItem) => {
    e.dataTransfer.setData('text/plain', item.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(null);
    const id = parseInt(e.dataTransfer.getData('text/plain'));
    if (!isNaN(id)) {
      moveItem(id, stage);
    }
  };

  const generateScript = async (id: number) => {
    setGeneratingId(id);
    try {
      const res = await fetch(`/api/pipeline/${id}/generate-script`, { method: 'POST' });
      const data = await res.json();
      if (data.script) {
        setItems(prev => prev.map(item =>
          item.id === id ? { ...item, script: data.script, stage: 'guion' } : item
        ));
      } else {
        alert(data.error || 'Error generando guión');
      }
    } catch {
      alert('Error de conexión al generar guión');
    } finally {
      setGeneratingId(null);
    }
  };

  const itemsByStage = (stage: string) => items.filter(item => item.stage === stage);

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-zinc-500 text-sm">Cargando pipeline...</div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight">Pipeline de Producción</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {items.length} {items.length === 1 ? 'item' : 'items'} en el pipeline
          </p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-zinc-900/50 border border-zinc-800 rounded-xl">
            <p className="text-zinc-500 text-sm mb-2">No hay items en el pipeline</p>
            <p className="text-zinc-600 text-xs">
              Ve al Directory y añade reels con el botón +
            </p>
          </div>
        ) : (
          <>
          {viewingScript && (
            <ScriptPanel
              item={viewingScript}
              onClose={() => setViewingScript(null)}
              onRegenerate={(id) => {
                generateScript(id);
              }}
              generatingId={generatingId}
            />
          )}

          <div className="grid grid-cols-5 gap-3 min-h-[60vh]">
            {STAGES.map((stage, stageIndex) => {
              const stageItems = itemsByStage(stage);
              const colors = STAGE_COLORS[stage];
              const isDragOver = dragOverStage === stage;

              return (
                <div
                  key={stage}
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                  className={`rounded-xl border transition-colors ${
                    isDragOver
                      ? `${colors.border} ${colors.bg} border-2`
                      : 'border-zinc-800/50 bg-zinc-950/50'
                  }`}
                >
                  {/* Column header */}
                  <div className={`px-3 py-2.5 rounded-t-xl ${colors.header}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {STAGE_LABELS[stage]}
                      </span>
                      <span className="text-xs font-mono opacity-70">{stageItems.length}</span>
                    </div>
                  </div>

                  {/* Cards */}
                  <div className="p-2 space-y-2 min-h-[200px]">
                    {stageItems.map(item => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        stageIndex={stageIndex}
                        onMove={moveItem}
                        onDelete={deleteItem}
                        onUpdateNotes={updateNotes}
                        onGenerateScript={generateScript}
                        onViewScript={setViewingScript}
                        onDragStart={handleDragStart}
                        generatingId={generatingId}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          </>
        )}
      </div>
    </main>
  );
}
