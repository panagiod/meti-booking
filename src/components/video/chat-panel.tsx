"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useChat } from "@livekit/components-react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

interface PersistedMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  body: string;
  createdAt: string;
}

interface ChatPanelProps {
  appointmentId: string;
  currentUserId: string;
  currentUserRole: "advisor" | "client";
  isOpen: boolean;
  onToggle: () => void;
}

// Chat panel with DB persistence.
// Live messages travel through LiveKit; history is loaded from the API.
export function ChatPanel({ appointmentId, currentUserId, currentUserRole, isOpen, onToggle }: ChatPanelProps) {
  const { chatMessages, send } = useChat();
  const [dbMessages, setDbMessages] = useState<PersistedMessage[]>([]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load persisted history
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/appointments/${appointmentId}/chat`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setDbMessages(data.messages || []);
        }
      } catch {}
    };
    load();
  }, [appointmentId]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dbMessages.length, chatMessages.length, isOpen]);

  // Merge history + live messages (dedupe by body + sender)
  const combined = useCallback(() => {
    const live = chatMessages || [];
    const persistedKeys = new Set(dbMessages.map((m) => `${m.senderName}|${m.body}`));
    const liveOnly = live.filter((m) => !persistedKeys.has(`${m.from?.name || m.from?.identity || "?"}|${m.message}`));
    return [
      ...dbMessages.map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.senderName,
        senderRole: m.senderRole,
        body: m.body,
        createdAt: m.createdAt,
        isLive: false,
      })),
      ...liveOnly.map((m) => ({
        id: m.timestamp?.toString() || Math.random().toString(36),
        senderId: m.from?.identity || "unknown",
        senderName: m.from?.name || m.from?.identity || "Unknown",
        senderRole: "live" as string,
        body: m.message,
        createdAt: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString(),
        isLive: true,
      })),
    ];
  }, [dbMessages, chatMessages]);

  const messages = combined();

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await send(text);
      // Persist to DB
      await fetch(`/api/appointments/${appointmentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ body: text }),
      });
      // Refresh history to include the persisted message
      const res = await fetch(`/api/appointments/${appointmentId}/chat`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDbMessages(data.messages || []);
      }
    } catch {}
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="absolute bottom-6 right-6 z-20 w-80 h-96 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <p className="text-sm font-semibold text-[var(--text-primary)]">Session chat</p>
        <button onClick={onToggle} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">
          ×
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 && (
          <p className="text-xs text-[var(--text-muted)] text-center mt-6">
            No messages yet. Say hello to your advisor!
          </p>
        )}
        {messages.map((m) => {
          const isMine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                  isMine
                    ? "bg-[var(--primary)] text-white"
                    : "bg-[var(--background)] text-[var(--text-primary)] border border-[var(--border)]"
                )}
              >
                {!isMine && (
                  <p className="text-[10px] font-medium text-[var(--text-muted)] mb-0.5">
                    {m.senderName}
                  </p>
                )}
                <p className="break-words whitespace-pre-wrap">{m.body}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2.5 border-t border-[var(--border)] flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Type a message..."
          className="flex-1 h-9 px-3 rounded-lg bg-[var(--background)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
        />
        <button
          onClick={handleSend}
          className="w-9 h-9 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary-hover)] transition-colors"
          aria-label="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
