"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Formats a number in Colombian style: 1000000 → 1'000.000
function formatCOP(n: number): string {
  if (isNaN(n)) return "";
  const abs = Math.abs(Math.trunc(n));
  const s = abs.toLocaleString("en-US"); // "1.000.000"
  const firstDot = s.indexOf(".");
  // If there are two separators, the first one (millions) uses an apostrophe
  if (firstDot !== -1 && s.indexOf(".", firstDot + 1) !== -1) {
    return s.slice(0, firstDot) + "'" + s.slice(firstDot + 1);
  }
  return s;
}

// Currency input with mask. value/onChange operate in pesos (whole number).
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
