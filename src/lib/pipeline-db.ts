import { neon } from '@neondatabase/serverless';

type SqlClient = ReturnType<typeof neon>;

let sql: SqlClient | null = null;
let migrated = false;

function getDb(): SqlClient {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL!);
  }
  return sql;
}

async function ensureMigrated() {
  if (migrated) return;
  const db = getDb();

  await db`
    CREATE TABLE IF NOT EXISTS pipeline_items (
      id SERIAL PRIMARY KEY,
      reel_link TEXT UNIQUE NOT NULL,
      handle TEXT NOT NULL,
      hook TEXT NOT NULL,
      format TEXT,
      category TEXT,
      tipo TEXT,
      views TEXT,
      stage TEXT NOT NULL DEFAULT 'idea',
      notes TEXT DEFAULT '',
      script TEXT DEFAULT '',
      analysis TEXT DEFAULT '',
      priority INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  migrated = true;
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
  script: string;
  analysis: string;
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

export async function getAllItems(): Promise<PipelineItem[]> {
  await ensureMigrated();
  const db = getDb();
  const rows = await db`SELECT * FROM pipeline_items ORDER BY priority DESC, created_at DESC` as unknown as PipelineItem[];
  return rows;
}

export async function getItemById(id: number): Promise<PipelineItem | null> {
  await ensureMigrated();
  const db = getDb();
  const rows = await db`SELECT * FROM pipeline_items WHERE id = ${id}` as unknown as PipelineItem[];
  return rows[0] || null;
}

export async function addItem(data: {
  reel_link: string;
  handle: string;
  hook: string;
  format?: string;
  category?: string;
  tipo?: string;
  views?: string;
}): Promise<PipelineItem> {
  await ensureMigrated();
  const db = getDb();
  const rows = await db`
    INSERT INTO pipeline_items (reel_link, handle, hook, format, category, tipo, views)
    VALUES (${data.reel_link}, ${data.handle}, ${data.hook}, ${data.format || null}, ${data.category || null}, ${data.tipo || null}, ${data.views || null})
    RETURNING *
  ` as unknown as PipelineItem[];
  return rows[0];
}

export async function updateItem(id: number, data: Partial<{ stage: string; notes: string; script: string; analysis: string; priority: number }>): Promise<PipelineItem | null> {
  await ensureMigrated();
  const db = getDb();

  // Read current, merge, write all
  const current = await getItemById(id);
  if (!current) return null;

  const stage = data.stage ?? current.stage;
  const notes = data.notes ?? current.notes;
  const script = data.script ?? current.script;
  const analysis = data.analysis ?? current.analysis;
  const priority = data.priority ?? current.priority;

  const rows = await db`
    UPDATE pipeline_items
    SET stage = ${stage}, notes = ${notes}, script = ${script}, analysis = ${analysis}, priority = ${priority}, updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  ` as unknown as PipelineItem[];
  return rows[0] || null;
}

export async function deleteItem(id: number): Promise<boolean> {
  await ensureMigrated();
  const db = getDb();
  const rows = await db`DELETE FROM pipeline_items WHERE id = ${id} RETURNING id` as unknown as { id: number }[];
  return rows.length > 0;
}
