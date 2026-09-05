"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";
import { useDialog } from "@/hooks/use-dialog";
import { useTranslations } from "@/components/providers/locale-provider";

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "text-[var(--success)]",
  error: "text-[var(--error)]",
  warning: "text-[var(--warning)]",
  info: "text-[var(--info)]",
};

const bgColors = {
  success: "bg-[var(--success-light)]",
  error: "bg-[var(--error-light)]",
  warning: "bg-[var(--warning-light)]",
  info: "bg-[var(--info-light)]",
};

interface AlertDialogProps {
  state: ReturnType<typeof useDialog>;
}

export function AlertDialog({ state }: AlertDialogProps) {
  const t = useTranslations();
  const { open, title, message, type, variant, onConfirm, close, inputValue, setInputValue } = state;
  const Icon = icons[variant];

  return (
    <Dialog open={open} onClose={close}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", bgColors[variant])}>
              <Icon className={cn("w-5 h-5", colors[variant])} />
            </div>
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>

        {type === "prompt" && (
          <div className="px-6 pb-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your answer..."
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onConfirm?.();
                }
              }}
            />
          </div>
        )}

        <DialogFooter>
          {type === "confirm" || type === "prompt" ? (
            <Button variant="secondary" onClick={close}>
              {t.common.cancel}
            </Button>
          ) : null}
          <Button onClick={onConfirm}>
            {type === "confirm" || type === "prompt" ? t.common.confirm : t.common.dismiss}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}
