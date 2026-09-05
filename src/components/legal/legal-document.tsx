import type { ReactNode } from "react";
import type { CookiesPage, LegalPage } from "@/i18n/legal-types";

export function LegalDocument({
  page,
  extra,
}: {
  page: LegalPage;
  extra?: ReactNode;
}) {
  return (
    <div className="container-meti max-w-3xl py-12">
      <h1 className="font-heading mb-2 text-3xl font-bold text-[var(--text-primary)]">
        {page.title}
      </h1>
      <p className="mb-8 text-sm text-[var(--text-muted)]">{page.updated}</p>
      {page.intro ? (
        <p className="mb-8 leading-relaxed text-[var(--text-secondary)]">{page.intro}</p>
      ) : null}
      <div className="space-y-8">
        {page.sections.map((section) => (
          <section key={section.heading} className="space-y-3">
            <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
              {section.heading}
            </h2>
            {section.paragraphs?.map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-[var(--text-secondary)]">
                {paragraph}
              </p>
            ))}
            {section.bullets ? (
              <ul className="ml-4 list-disc space-y-2 text-[var(--text-secondary)]">
                {section.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
        {extra}
      </div>
    </div>
  );
}

export function CookieInventory({ page }: { page: CookiesPage }) {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
          {page.cookieListTitle}
        </h2>
        <InventoryBlock rows={page.rows} />
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
          {page.storageListTitle}
        </h2>
        <InventoryBlock rows={page.storageRows} />
      </section>
      <section className="space-y-3">
        <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
          {page.manageHeading}
        </h2>
        {page.manageParagraphs.map((paragraph) => (
          <p key={paragraph} className="leading-relaxed text-[var(--text-secondary)]">
            {paragraph}
          </p>
        ))}
      </section>
    </div>
  );
}

function InventoryBlock({ rows }: { rows: CookiesPage["rows"] }) {
  return (
    <div className="space-y-3 rounded-lg bg-[var(--background)] p-4 text-sm">
      {rows.map((row) => (
        <div key={`${row.key}-${row.name}`} className="flex items-start gap-3">
          <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[var(--accent)]" />
          <div>
            <p className="font-medium text-[var(--text-primary)]">{row.name}</p>
            <p className="text-[var(--text-muted)]">{row.desc}</p>
            <code className="mt-1 inline-block rounded bg-[var(--surface)] px-1.5 py-0.5 text-xs text-[var(--text-muted)]">
              {row.key}
            </code>
          </div>
        </div>
      ))}
    </div>
  );
}
