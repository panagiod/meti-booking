"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LoadingPage } from "@/components/ui/loading";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Edit, Trash2, ExternalLink } from "lucide-react";
import { authClient } from "@/lib/auth-client";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
  };
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/admin/blog");
        if (response.ok) {
          const data = await response.json();
          setPosts(data.posts);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPosts(posts.filter((post) => post.id !== id));
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-[var(--text-primary)]">
            Blog
          </h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage blog posts
          </p>
        </div>
        <Link href="/admin/blog/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New post
          </Button>
        </Link>
      </div>

      {/* Posts list */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <EmptyState
              icon={FileText}
              title="No posts yet"
              description="Create your first blog post to share content with your users."
              action={{
                label: "Create post",
                onClick: () => router.push("/admin/blog/new"),
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {posts.length} {posts.length === 1 ? "post" : "posts"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-[var(--background)] border border-[var(--border)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-medium text-[var(--text-primary)] truncate">
                        {post.title}
                      </h3>
                      <Badge
                        variant={
                          post.status === "PUBLISHED" ? "default" : "secondary"
                        }
                      >
                        {post.status === "PUBLISHED" ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    {post.excerpt && (
                      <p className="text-sm text-[var(--text-muted)] mt-1 line-clamp-1">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-[var(--text-muted)]">
                      <span>By {post.author.name}</span>
                      <span>
                        {new Date(post.createdAt).toLocaleDateString("en-US")}
                      </span>
                      {post.publishedAt && (
                        <span>
                          Published{" "}
                          {new Date(post.publishedAt).toLocaleDateString("en-US")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {post.status === "PUBLISHED" && (
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    )}
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)] rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(post.id)}
                      disabled={deletingId === post.id}
                      className="p-2 text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--error-light)] rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
