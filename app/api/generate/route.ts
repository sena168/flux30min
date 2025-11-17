import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

const FLUX_ENDPOINT =
  'https://thedevs-org--flux-schnell-api-fluxapi-generate.modal.run/?prompt=';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Invalid prompt' }, { status: 400 });
    }

    const id = randomUUID();

    const fluxRes = await fetch(FLUX_ENDPOINT + encodeURIComponent(prompt), {
      cache: 'no-store',
    });

    if (!fluxRes.ok) {
      const text = await fluxRes.text().catch(() => '');
      return NextResponse.json(
        {
          error: 'FLUX endpoint error',
          details: text.slice(0, 200),
        },
        { status: 502 }
      );
    }

    const arrayBuffer = await fluxRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64}`;

    return NextResponse.json({ id, image: imageDataUrl });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
