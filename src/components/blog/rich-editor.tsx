"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Undo,
  Redo,
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

function ToolbarButton({
  onClick,
  isActive,
  disabled,
  children,
}: {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? "bg-[var(--primary)] text-white"
          : "text-[var(--text-muted)] hover:bg-[var(--background)] hover:text-[var(--text-primary)]"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="w-px h-6 bg-[var(--border)] mx-1" />;
}

export function RichEditor({
  content,
  onChange,
  placeholder = "Write your content here...",
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  if (!editor) {
    return (
      <div className="min-h-[300px] rounded-lg border border-[var(--border)] bg-[var(--surface)] animate-pulse" />
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-[var(--border)] bg-[var(--background)]">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          isActive={editor.isActive("heading", { level: 1 })}
        >
          <Heading1 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          isActive={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
          isActive={editor.isActive("heading", { level: 3 })}
        >
          <Heading3 className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
        >
          <Strikethrough className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
        >
          <Code className="w-4 h-4" />
        </ToolbarButton>

        <ToolbarDivider />

        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
        >
          <Quote className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </ToolbarButton>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="prose prose-lg max-w-none p-4 min-h-[300px] text-[var(--text-primary)] [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:mb-4 [&_.ProseMirror_h1]:font-heading [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:mb-4 [&_.ProseMirror_h2]:font-heading [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:mb-3 [&_.ProseMirror_h3]:font-heading [&_.ProseMirror_h3]:text-xl [&_.ProseMirror_h3]:font-bold [&_.ProseMirror_h3]:mb-2 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-6 [&_.ProseMirror_ul]:mb-4 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-6 [&_.ProseMirror_ol]:mb-4 [&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:border-[var(--primary)] [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-[var(--text-muted)] [&_.ProseMirror_blockquote]:mb-4 [&_.ProseMirror_code]:bg-[var(--background)] [&_.ProseMirror_code]:px-1.5 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:text-sm [&_.ProseMirror_pre]:bg-[var(--background)] [&_.ProseMirror_pre]:p-4 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:mb-4 [&_.ProseMirror_hr]:border-[var(--border)] [&_.ProseMirror_hr]:my-6 [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-[var(--text-muted)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0"
      />
    </div>
  );
}
