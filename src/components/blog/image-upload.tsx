"use client";

import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (value) {
        formData.append("oldUrl", value);
      }

      const response = await fetch("/api/admin/blog/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload image");
      }

      const data = await response.json();
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {value ? (
        <div className="relative rounded-lg overflow-hidden border border-[var(--border)]">
          <img
            src={value}
            alt="Preview"
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={handleRemove}
              disabled={disabled || isUploading}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          disabled={disabled || isUploading}
          className="w-full h-48 rounded-lg border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] transition-colors flex flex-col items-center justify-center gap-2 bg-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--primary)] border-t-transparent" />
              <span className="text-sm text-[var(--text-muted)]">
                Uploading image...
              </span>
            </>
          ) : (
            <>
              <div className="p-3 rounded-full bg-[var(--primary-light)]">
                <ImageIcon className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <span className="text-sm text-[var(--text-muted)]">
                Click or drag an image here
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                JPEG, PNG o WebP (max 5MB)
              </span>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-sm text-[var(--error)]">{error}</p>
      )}
    </div>
  );
}
