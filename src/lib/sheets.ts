import { Reel, ContentType } from '@/types/reel';
import { execSync } from 'child_process';

function parseNumber(str: string): number {
  if (!str) return 0;
  const clean = str.replace(/,/g, '').trim();
  const match = clean.match(/^([\d.]+)\s*(M|K)?$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = (match[2] || '').toUpperCase();
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

function parseTipo(value: string): ContentType {
  const v = (value || '').trim();
  if (v === 'Carrusel' || v === 'Post') return v;
  return 'Reel';
}

export async function fetchReels(): Promise<Reel[]> {
  const sheetId = process.env.SHEET_ID || '1NUPIkwmCV4vbYKVjzpXEizbXXQF18Hv1M-009VRkJ4o';

  // Use gog CLI which already has OAuth configured
  const gogPath = process.env.GOG_PATH || '/opt/homebrew/bin/gog';
  const raw = execSync(
    `${gogPath} sheets get ${sheetId} "Hoja 1!A2:M500" --json --no-input`,
    { encoding: 'utf8', timeout: 15000 }
  );

  const data = JSON.parse(raw);
  const rows: string[][] = data.values || [];

  return rows
    .filter(row => row[0] && row[0].trim())
    .map(row => ({
      handle: row[0] || '',
      name: row[1] || '',
      followers: row[2] || '',
      followersNum: parseNumber(row[2] || ''),
      category: row[3] || '',
      views: row[4] || '',
      viewsNum: parseNumber(row[4] || ''),
      hook: row[5] || '',
      format: row[6] || '',
      link: row[7] || '',
      date: row[8] || '',
      likes: row[9] || '',
      likesNum: parseNumber(row[9] || ''),
      comments: row[10] || '',
      commentsNum: parseNumber(row[10] || ''),
      engagement: row[11] || '',
      engagementNum: parseFloat((row[11] || '0').replace('%', '').replace(',', '.')) || 0,
      tipo: parseTipo(row[12] || ''),
    }));
}
