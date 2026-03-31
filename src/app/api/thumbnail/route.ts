import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'url required' }, { status: 400 });
  }

  // Extract shortcode from Instagram URL
  const match = url.match(/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  if (!match) {
    return NextResponse.json({ error: 'invalid url' }, { status: 400 });
  }

  const shortcode = match[1];
  const mediaUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;

  try {
    const res = await fetch(mediaUrl, { redirect: 'follow' });
    if (!res.ok) {
      return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
    }

    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch {
    return NextResponse.json({ error: 'proxy failed' }, { status: 502 });
  }
}
