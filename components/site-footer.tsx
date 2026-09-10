import Image from 'next/image';

export default function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="brand-checker h-2" />
      <div className="brand-rule h-1" />

      <div className="brand-surface relative">
        <div className="brand-stripes absolute inset-0" aria-hidden />

        <div className="relative mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Image
            src="/fesb-racing-logo-light.png"
            alt="FESB Racing"
            width={1600}
            height={383}
            className="h-7 w-auto"
          />
          <p className="text-xs text-white/60">
            Službeni merch FESB Racing tima · FESB, Split
          </p>
        </div>
      </div>
    </footer>
  );
}
