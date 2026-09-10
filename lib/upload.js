import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Vercel Blob obično doda BLOB_READ_WRITE_TOKEN, ali ako je store spojen s
 * vlastitim prefiksom varijabla se zove npr. SLIKE_READ_WRITE_TOKEN. Zato
 * prihvaćamo bilo koji blob token i poslije ga eksplicitno predajemo SDK-u.
 */
function findBlobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return { token: process.env.BLOB_READ_WRITE_TOKEN, name: 'BLOB_READ_WRITE_TOKEN' };
  }

  const match = Object.entries(process.env).find(
    ([name, value]) =>
      name.endsWith('_READ_WRITE_TOKEN') && value?.startsWith('vercel_blob_')
  );

  return match ? { token: match[1], name: match[0] } : null;
}

/** Za prikaz u adminu: gdje ce zavrsiti sljedeca uploadana slika. */
export function storageStatus() {
  const blob = findBlobToken();
  if (blob) return { mode: 'blob', detail: blob.name };
  if (process.env.VERCEL) return { mode: 'none', detail: 'Blob store nije spojen' };
  return { mode: 'local', detail: 'public/uploads' };
}

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/avif': '.avif',
  'image/gif': '.gif',
};

/**
 * Sprema poslanu sliku i vraća adresu za <img src>.
 *
 * Na Vercelu (BLOB_READ_WRITE_TOKEN je postavljen) ide u Vercel Blob jer je
 * tamošnji disk efemeran i uploadi bi nestali. Lokalno, bez tokena, pada
 * natrag na public/uploads da razvoj radi bez ijednog vanjskog servisa.
 *
 * Vraća null ako polje za datoteku nije popunjeno.
 * Baca Error s porukom na hrvatskom ako datoteka nije valjana.
 */
export async function saveImage(file) {
  if (!file || typeof file === 'string' || file.size === 0) return null;

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) {
    throw new Error('Dozvoljene su samo slike (JPG, PNG, WEBP, AVIF, GIF).');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('Slika je prevelika (maksimalno 5 MB).');
  }

  const fileName = `${randomUUID()}${extension}`;

  const credentials = findBlobToken();
  if (credentials) {
    const blob = await put(`proizvodi/${fileName}`, file, {
      access: 'public',
      contentType: file.type,
      token: credentials.token,
    });
    return blob.url;
  }

  // Na Vercelu je disk read-only, pa bez Blob storea nema gdje spremiti sliku.
  if (process.env.VERCEL) {
    throw new Error(
      'Upload slika nije podešen. U Vercelu otvori Storage > Create Database > Blob, ' +
        'poveži store s projektom i napravi Redeploy. Do tada koristi polje "adresa slike".'
    );
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, fileName),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/${fileName}`;
}

/**
 * Briše sliku koju smo sami uploadali u Blob. Vanjske adrese i lokalne
 * datoteke preskače. Nikad ne baca - brisanje proizvoda ne smije pasti
 * zbog slike koje ionako više nema.
 */
export async function deleteImage(url) {
  if (!url || !url.includes('.blob.vercel-storage.com')) return;

  const credentials = findBlobToken();
  if (!credentials) return;

  try {
    await del(url, { token: credentials.token });
  } catch (err) {
    console.error('Brisanje slike nije uspjelo:', err);
  }
}
