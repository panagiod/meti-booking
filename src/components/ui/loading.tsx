import { cn } from "@/lib/utils";

interface LoadingPageProps {
  fullScreen?: boolean;
  className?: string;
  label?: string;
}

export function LoadingPage({ fullScreen = false, className, label = "Cargando..." }: LoadingPageProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6",
        fullScreen && "min-h-screen",
        !fullScreen && "min-h-[60vh]",
        className
      )}
    >
      <div className="relative">
        <div className="absolute -inset-4 rounded-[24px] animate-[pulse-glow_2.4s_ease-in-out_infinite] motion-reduce:animate-none" />
        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-[var(--shadow-primary)] relative">
          <span className="font-heading text-3xl font-extrabold text-white select-none">M</span>
        </div>
        <div
          className="absolute -inset-2 rounded-[20px] border border-dashed border-[var(--primary)]/50 animate-spin motion-reduce:animate-none"
          style={{ animationDuration: "14s" }}
        >
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[var(--shadow-accent)]" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-[var(--text-primary)]">{label}</p>
      </div>
      <div className="flex gap-2">
        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-[float_1.2s_ease-in-out_0s_infinite]" />
        <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-[float_1.2s_ease-in-out_0.2s_infinite]" />
        <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-[float_1.2s_ease-in-out_0.4s_infinite]" />
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full skeleton" />
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 skeleton" />
          <div className="h-3 w-48 skeleton" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-3/4 skeleton" />
      </div>
    </div>
  );
}

export function LoadingTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}
