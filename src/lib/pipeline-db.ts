import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.join(process.cwd(), 'db');
const DB_PATH = path.join(DB_DIR, 'pipeline.db');

function getDb(): Database.Database {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS pipeline_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      reel_link TEXT UNIQUE NOT NULL,
      handle TEXT NOT NULL,
      hook TEXT NOT NULL,
      format TEXT,
      category TEXT,
      tipo TEXT,
      views TEXT,
      stage TEXT NOT NULL DEFAULT 'idea',
      notes TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

export interface PipelineItem {
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
  priority: number;
  created_at: string;
  updated_at: string;
}

export const STAGES = ['idea', 'guion', 'grabacion', 'edicion', 'publicado'] as const;
export type Stage = typeof STAGES[number];

export const STAGE_LABELS: Record<Stage, string> = {
  idea: 'Idea',
  guion: 'Guión',
  grabacion: 'Grabación',
  edicion: 'Edición',
  publicado: 'Publicado',
};

export function getAllItems(): PipelineItem[] {
  const db = getDb();
  try {
    return db.prepare('SELECT * FROM pipeline_items ORDER BY priority DESC, created_at DESC').all() as PipelineItem[];
  } finally {
    db.close();
  }
}

export function addItem(data: {
  reel_link: string;
  handle: string;
  hook: string;
  format?: string;
  category?: string;
  tipo?: string;
  views?: string;
}): PipelineItem {
  const db = getDb();
  try {
    const stmt = db.prepare(`
      INSERT INTO pipeline_items (reel_link, handle, hook, format, category, tipo, views)
      VALUES (@reel_link, @handle, @hook, @format, @category, @tipo, @views)
    `);
    const result = stmt.run({
      reel_link: data.reel_link,
      handle: data.handle,
      hook: data.hook,
      format: data.format || null,
      category: data.category || null,
      tipo: data.tipo || null,
      views: data.views || null,
    });
    return db.prepare('SELECT * FROM pipeline_items WHERE id = ?').get(result.lastInsertRowid) as PipelineItem;
  } finally {
    db.close();
  }
}

export function updateItem(id: number, data: Partial<{ stage: string; notes: string; priority: number }>): PipelineItem | null {
  const db = getDb();
  try {
    const fields: string[] = [];
    const values: Record<string, unknown> = { id };

    if (data.stage !== undefined) {
      fields.push('stage = @stage');
      values.stage = data.stage;
    }
    if (data.notes !== undefined) {
      fields.push('notes = @notes');
      values.notes = data.notes;
    }
    if (data.priority !== undefined) {
      fields.push('priority = @priority');
      values.priority = data.priority;
    }

    if (fields.length === 0) return null;

    fields.push("updated_at = datetime('now')");
    db.prepare(`UPDATE pipeline_items SET ${fields.join(', ')} WHERE id = @id`).run(values);
    return db.prepare('SELECT * FROM pipeline_items WHERE id = ?').get(id) as PipelineItem | null;
  } finally {
    db.close();
  }
}

export function deleteItem(id: number): boolean {
  const db = getDb();
  try {
    const result = db.prepare('DELETE FROM pipeline_items WHERE id = ?').run(id);
    return result.changes > 0;
  } finally {
    db.close();
  }
}
