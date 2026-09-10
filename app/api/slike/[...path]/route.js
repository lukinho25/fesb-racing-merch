import { get } from '@vercel/blob';
import { findBlobToken } from '@/lib/upload';

/**
 * Poslužuje slike iz privatnog Blob storea, koji se ne može čitati izravno
 * s URL-a nego traži token. Javne slike ovuda ne prolaze - one imaju svoj
 * blob URL spremljen u bazi.
 */
export async function GET(request, { params }) {
  const credentials = findBlobToken();
  if (!credentials) {
    return new Response('Spremište slika nije podešeno.', { status: 404 });
  }

  const { path } = await params;
  const pathname = path.join('/');

  try {
    const result = await get(pathname, {
      access: 'private',
      token: credentials.token,
    });

    if (result.statusCode !== 200) {
      return new Response(null, { status: result.statusCode });
    }

    return new Response(result.stream, {
      headers: {
        'Content-Type': result.blob.contentType,
        'Content-Length': String(result.blob.size),
        // Ime datoteke je nasumican UUID, pa se sadrzaj nikad ne mijenja.
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err) {
    console.error('Čitanje slike nije uspjelo:', err);
    return new Response('Slika nije pronađena.', { status: 404 });
  }
}
