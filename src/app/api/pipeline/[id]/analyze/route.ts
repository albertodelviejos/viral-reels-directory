import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { updateItem, getItemById } from '@/lib/pipeline-db';

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

  const item = await getItemById(id);
  if (!item) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  const prompt = `You are an expert viral content analyst specializing in Instagram Reels, TikTok, and YouTube Shorts.

Analyze WHY this video went viral and break down the key elements that made it successful.

**Video details:**
- Creator: ${item.handle}
- Hook/Topic: ${item.hook}
- Format used: ${item.format || 'Not specified'}
- Category: ${item.category || 'Not specified'}
- Type: ${item.tipo || 'Reel'}
- Views: ${item.views || 'N/A'}

**Provide a detailed analysis with this structure:**

## VIRAL ANALYSIS

### Hook Breakdown
- What makes the opening compelling?
- Pattern interrupt or curiosity gap used?
- First 3 seconds strategy

### Format & Structure
- Content structure (listicle, demo, story, shock, etc.)
- Pacing and retention techniques
- Length optimization

### Psychology Triggers
- Which psychological triggers are at play? (FOMO, curiosity, social proof, controversy, etc.)
- Emotional response targeted
- Shareability factors

### Growth Mechanics
- CTA strategy (comment bait, save-worthy, share trigger)
- Algorithm signals (watch time, engagement bait, etc.)
- Community/niche targeting

### Key Takeaways
- Top 3 elements to replicate
- What to adapt vs copy exactly
- Potential risks or pitfalls

### Replication Score
Rate from 1-10 how easy this is to replicate, and why.

Write EVERYTHING in English. Be specific and actionable.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const analysis = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    const updated = await updateItem(id, { analysis });

    return NextResponse.json({ analysis, item: updated });
  } catch (error: unknown) {
    console.error('Analysis error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to analyze';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
