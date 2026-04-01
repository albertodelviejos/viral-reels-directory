import { NextRequest, NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { updateItem, getAllItems } from '@/lib/pipeline-db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
  }

  // Get the item
  const items = getAllItems();
  const item = items.find(i => i.id === id);
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const prompt = `Eres un guionista experto en contenido viral de Instagram/TikTok/YouTube Shorts.

Genera un guión completo para un video corto (30-60 segundos) basado en esta referencia viral:

**Referencia viral:**
- Creador original: ${item.handle}
- Hook/Tema: ${item.hook}
- Formato que usó: ${item.format || 'No especificado'}
- Categoría: ${item.category || 'No especificada'}
- Tipo: ${item.tipo || 'Reel'}
- Views originales: ${item.views || 'N/A'}

**Contexto:** El video es para Alberto (@albertodviejo), creador de contenido sobre IA, automatización y tecnología. El guión debe adaptarse a su estilo y audiencia hispanohablante.

${item.notes ? `**Notas del creador:** ${item.notes}` : ''}

**Genera el guión con esta estructura:**

## 🎬 GUIÓN

### Hook (0-3s)
[Frase de apertura que enganche inmediatamente]

### Desarrollo (3-25s)  
[Contenido principal, paso a paso o historia]

### CTA / Cierre (25-30s)
[Llamada a la acción o cierre potente]

---

### 📝 Notas de producción
- **Estilo visual:** [sugerencias de edición]
- **Música/SFX:** [recomendaciones]
- **Texto en pantalla:** [overlays sugeridos]
- **Hashtags:** [5-8 hashtags relevantes]

Escribe TODO en español.`;

  try {
    const claudePath = '/Users/alberto/.nvm/versions/node/v24.13.0/bin/claude';
    const script = execSync(
      `${claudePath} --print "${prompt.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"`,
      {
        encoding: 'utf8',
        timeout: 120000,
        env: {
          ...process.env,
          PATH: `/Users/alberto/.nvm/versions/node/v24.13.0/bin:${process.env.PATH}`,
          HOME: '/Users/alberto',
        },
      }
    ).trim();

    // Save to DB
    const updated = updateItem(id, { script, stage: 'guion' });

    return NextResponse.json({ script, item: updated });
  } catch (error: unknown) {
    console.error('Script generation error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to generate script';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
