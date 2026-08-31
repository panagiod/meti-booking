"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BlockTimeModalProps {
  isOpen: boolean;
  title: string;
  startDate: string;
  endDate: string;
  onTitleChange: (value: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BlockTimeModal({
  isOpen,
  title,
  startDate,
  endDate,
  onTitleChange,
  onStartDateChange,
  onEndDateChange,
  onConfirm,
  onCancel,
}: BlockTimeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bloquear horario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Título *</label>
            <Input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Ej: Vacaciones, Día personal..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Inicio *</label>
              <Input
                type="datetime-local"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Fin *</label>
              <Input
                type="datetime-local"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={onConfirm}>Bloquear</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
