import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function Hero() {
  return (
    <section className="relative min-h-[88vh] flex items-end overflow-hidden">
      <Image
        src={siteConfig.images.hero}
        alt="Reformer pilates session in a bright studio"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#2a2926]/90 via-[#2a2926]/40 to-[#2a2926]/20" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-20 pt-32 sm:px-8 sm:pb-24">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-white/70">
          Reformer & mat pilates
        </p>
        <h1 className="max-w-2xl font-heading text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl">
          Move with intention.
          <br />
          <span className="text-white/80">Book your session.</span>
        </h1>
        <p className="mt-5 max-w-md text-base text-white/75 sm:text-lg">
          {siteConfig.tagline}
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/book"
            className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-medium text-[var(--secondary)] transition hover:bg-white/90"
          >
            Book a session
          </Link>
          <a
            href="#sessions"
            className="text-sm font-medium text-white/80 underline-offset-4 hover:text-white hover:underline"
          >
            View sessions
          </a>
        </div>
      </div>
    </section>
  );
}
