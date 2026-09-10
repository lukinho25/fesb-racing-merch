import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { del, put } from '@vercel/blob';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

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

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`proizvodi/${fileName}`, file, {
      access: 'public',
      contentType: file.type,
    });
    return blob.url;
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) return;

  try {
    await del(url);
  } catch (err) {
    console.error('Brisanje slike nije uspjelo:', err);
  }
}
