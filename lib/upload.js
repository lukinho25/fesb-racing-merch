import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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
 * Sprema poslanu sliku u public/uploads i vraća putanju za <img src>.
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
  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(
    path.join(UPLOAD_DIR, fileName),
    Buffer.from(await file.arrayBuffer())
  );

  return `/uploads/${fileName}`;
}
