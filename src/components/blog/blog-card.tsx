import Link from "next/link";
import { Calendar } from "lucide-react";

interface BlogCardProps {
  title: string;
  slug: string;
  excerpt?: string | null;
  coverImage?: string | null;
  publishedAt?: string | null;
  author: {
    name: string;
    image?: string | null;
  };
}

export function BlogCard({
  title,
  slug,
  excerpt,
  coverImage,
  publishedAt,
  author,
}: BlogCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("es-CO", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <Link href={`/blog/${slug}`} className="group block">
      <article className="bg-[var(--surface)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all duration-200">
        {coverImage && (
          <div className="aspect-video overflow-hidden">
            <img
              src={coverImage}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          </div>
        )}
        <div className="p-6">
          <h3 className="font-heading text-xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
            {title}
          </h3>
          {excerpt && (
            <p className="mt-2 text-[var(--text-muted)] line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {author.image ? (
                <img
                  src={author.image}
                  alt={author.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <span className="text-sm font-medium text-[var(--primary)]">
                    {author.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <span className="text-sm text-[var(--text-muted)]">
                {author.name}
              </span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
