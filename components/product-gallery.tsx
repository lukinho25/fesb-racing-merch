'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Expand } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="bg-muted text-muted-foreground flex aspect-square items-center justify-center rounded-lg border">
        <span className="text-sm">Nema slike</span>
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];
  const step = (delta: number) =>
    setIndex((i) => (i + delta + images.length) % images.length);

  return (
    <div className="flex flex-col gap-3">
      <Dialog>
        <div className="group relative">
          <DialogTrigger asChild>
            <button
              type="button"
              className="bg-muted focus-visible:ring-ring flex aspect-square w-full cursor-zoom-in items-center justify-center overflow-hidden rounded-lg border p-4 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Otvori sliku u punoj veličini"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current}
                alt={name}
                className="max-h-full max-w-full object-contain"
              />
            </button>
          </DialogTrigger>

          <span className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Expand className="size-4" />
          </span>

          {images.length > 1 && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Prethodna slika"
                className="absolute top-1/2 left-2 -translate-y-1/2"
                onClick={() => step(-1)}
              >
                <ChevronLeft />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Sljedeća slika"
                className="absolute top-1/2 right-2 -translate-y-1/2"
                onClick={() => step(1)}
              >
                <ChevronRight />
              </Button>
            </>
          )}
        </div>

        <DialogContent className="max-w-[95vw] sm:max-w-4xl">
          <DialogTitle className="sr-only">{name}</DialogTitle>
          <div className="flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current}
              alt={name}
              className="max-h-[80vh] w-auto max-w-full object-contain"
            />
          </div>

          {images.length > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Prethodna slika"
                onClick={() => step(-1)}
              >
                <ChevronLeft />
              </Button>
              <span className="text-muted-foreground text-sm tabular-nums">
                {index + 1} / {images.length}
              </span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Sljedeća slika"
                onClick={() => step(1)}
              >
                <ChevronRight />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {images.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Prikaži sliku ${i + 1}`}
              aria-current={i === index}
              className={`bg-muted flex h-16 w-16 items-center justify-center overflow-hidden rounded border p-1 transition-colors ${
                i === index ? 'border-brand ring-brand ring-1' : 'hover:border-foreground/30'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="max-h-full max-w-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
