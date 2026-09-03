import { Metadata } from "next";
import { BlogCard } from "@/components/blog/blog-card";
import { prisma } from "@/lib/prisma";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | MeTi Pilates",
  description:
    "Notes on reformer pilates, movement, and studio life at MeTi Pilates in Limassol.",
};

async function getBlogPosts() {
  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
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

  return posts;
}

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container-meti py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-heading text-4xl font-bold text-[var(--text-primary)]">
          Blog
        </h1>
        <p className="mt-3 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
          Notes on reformer pilates, clinical movement, and studio life in Limassol.
        </p>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[var(--primary-light)] mb-4">
            <FileText className="w-8 h-8 text-[var(--primary)]" />
          </div>
          <h2 className="font-heading text-xl font-semibold text-[var(--text-primary)]">
            Coming soon
          </h2>
          <p className="mt-2 text-[var(--text-muted)]">
            We are preparing content for you. Check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post: any) => (
            <BlogCard
              key={post.id}
              title={post.title}
              slug={post.slug}
              excerpt={post.excerpt}
              coverImage={post.coverImage}
              publishedAt={post.publishedAt}
              author={post.author}
            />
          ))}
        </div>
      )}
    </div>
  );
}
