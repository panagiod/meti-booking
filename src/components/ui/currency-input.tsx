"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Formatea un número al estilo colombiano: 1000000 → 1'000.000
function formatCOP(n: number): string {
  if (isNaN(n)) return "";
  const abs = Math.abs(Math.trunc(n));
  const s = abs.toLocaleString("es-CO"); // "1.000.000"
  const firstDot = s.indexOf(".");
  // Si hay dos separadores, el primero (millones) usa apóstrofe
  if (firstDot !== -1 && s.indexOf(".", firstDot + 1) !== -1) {
    return s.slice(0, firstDot) + "'" + s.slice(firstDot + 1);
  }
  return s;
}

// Input de moneda con máscara. value/onChange operan en pesos (número entero).
export function CurrencyInput({
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "onChange" | "value"> & {
  value: number;
  onChange: (value: number) => void;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/[^\d]/g, "");
    onChange(digits === "" ? 0 : parseInt(digits, 10));
  };

  return (
    <Input
      inputMode="numeric"
      value={formatCOP(value)}
      onChange={handleChange}
      className={cn(className)}
      {...props}
    />
  );
}
