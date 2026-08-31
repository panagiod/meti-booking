import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

async function getBlogPost(slug: string) {
  const post = await prisma.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      author: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  return post;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return { title: "Post not found | Meti" };
  }

  return {
    title: `${post.title} | Meti`,
    description: post.excerpt || post.title,
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      images: post.coverImage ? [post.coverImage] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="container-meti py-12 max-w-4xl mx-auto">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to blog
      </Link>

      {/* Article */}
      <article>
        {/* Header */}
        <header className="mb-8">
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
            {post.title}
          </h1>

          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-2">
              {post.author.image ? (
                <img
                  src={post.author.image}
                  alt={post.author.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-[var(--primary-light)] flex items-center justify-center">
                  <span className="font-medium text-[var(--primary)]">
                    {post.author.name?.charAt(0) || "?"}
                  </span>
                </div>
              )}
              <span className="text-[var(--text-muted)]">
                {post.author.name}
              </span>
            </div>
            {formattedDate && (
              <div className="flex items-center gap-1 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>{formattedDate}</span>
              </div>
            )}
          </div>
        </header>

        {/* Cover image */}
        {post.coverImage && (
          <div className="mb-8 rounded-xl overflow-hidden">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-lg text-[var(--text-muted)] mb-8 font-medium">
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none text-[var(--text-primary)]">
          {post.content.split("\n").map((paragraph: string, index: number) =>
            paragraph.trim() ? (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ) : null
          )}
        </div>
      </article>
    </div>
  );
}
