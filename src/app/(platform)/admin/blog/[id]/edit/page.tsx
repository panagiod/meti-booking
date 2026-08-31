"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingPage } from "@/components/ui/loading";
import { RichEditor } from "@/components/blog/rich-editor";
import { ImageUpload } from "@/components/blog/image-upload";
import { ArrowLeft, Save, Eye } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  status: "DRAFT" | "PUBLISHED";
}

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/admin/blog/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          const post = data.post;
          setForm({
            title: post.title,
            excerpt: post.excerpt || "",
            content: post.content,
            coverImage: post.coverImage || "",
            status: post.status,
          });
        } else {
          router.push("/admin/blog");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        router.push("/admin/blog");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  const handleSubmit = async (status: "DRAFT" | "PUBLISHED") => {
    if (!form.title || !form.content) {
      alert("Title and content are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status }),
      });

      if (response.ok) {
        router.push("/admin/blog");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--background)] rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-heading text-2xl font-bold text-[var(--text-primary)]">
              Edit post
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Edit the blog post
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSaving}
          >
            <Save className="w-4 h-4 mr-2" />
            Save draft
          </Button>
          <Button onClick={() => handleSubmit("PUBLISHED")} disabled={isSaving}>
            <Eye className="w-4 h-4 mr-2" />
            Publish
          </Button>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <label
              htmlFor="title"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Title *
            </label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Post title"
            />
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <label
              htmlFor="excerpt"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Extracto
            </label>
            <textarea
              id="excerpt"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              placeholder="Brief post description (optional)"
              rows={2}
              className="flex w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary)]/15 resize-none"
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">
              Cover image
            </label>
            <ImageUpload
              value={form.coverImage}
              onChange={(url) => setForm({ ...form, coverImage: url })}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <label
              htmlFor="content"
              className="text-sm font-medium text-[var(--text-primary)]"
            >
              Contenido *
            </label>
            <RichEditor
              content={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="Write your post content here..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
