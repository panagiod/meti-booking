import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export function SessionTypes() {
  return (
    <section id="sessions" className="bg-[var(--background)] py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mb-12 max-w-lg">
          <h2 className="font-heading text-3xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-4xl">
            Sessions
          </h2>
          <p className="mt-3 text-[var(--text-muted)]">
            Mat, reformer, private, and duo — all bookable online with live availability.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {siteConfig.sessionTypes.map((session) => (
            <Link
              key={session.slug}
              href="/book"
              className="group overflow-hidden rounded-2xl bg-[var(--surface)] shadow-sm ring-1 ring-[var(--border)] transition hover:shadow-md hover:ring-[var(--primary)]/30"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={siteConfig.images[session.imageKey]}
                  alt={session.name}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, 25vw"
                />
              </div>
              <div className="p-5">
                <h3 className="font-heading text-lg font-semibold text-[var(--text-primary)]">
                  {session.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{session.description}</p>
                <p className="mt-3 text-sm font-medium text-[var(--primary)]">
                  {session.duration} · from ${session.priceFrom}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
