"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// Formats whole currency units for display (e.g. 45 → "45")
function formatCurrencyUnits(n: number): string {
  if (isNaN(n)) return "";
  return Math.abs(Math.trunc(n)).toLocaleString("en-US");
}

// Currency input with mask. value/onChange operate in whole currency units (e.g. euros).
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
      value={formatCurrencyUnits(value)}
      onChange={handleChange}
      className={cn(className)}
      {...props}
    />
  );
}
