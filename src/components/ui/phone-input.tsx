"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  latinAmericanCountries,
  getCountryByCode,
  formatFullPhone,
  type Country,
} from "@/data/countries";

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function PhoneInput({
  value,
  onChange,
  className,
  disabled,
}: PhoneInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(
    getCountryByCode("CO")!
  );
  const [localNumber, setLocalNumber] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const country = latinAmericanCountries.find((c) =>
        value.startsWith(c.dialCode)
      );
      if (country) {
        setSelectedCountry(country);
        setLocalNumber(value.slice(country.dialCode.length));
      }
    } else {
      setLocalNumber("");
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsOpen(false);
    // Re-format with new country code
    const fullPhone = formatFullPhone(country.dialCode, localNumber);
    onChange(fullPhone);
    inputRef.current?.focus();
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    // Only allow digits
    const digits = inputValue.replace(/[^0-9]/g, "");

    // Get max digits from mask (count X characters)
    const maxDigits = selectedCountry.mask.split("").filter((c) => c === "X").length;

    if (digits.length <= maxDigits) {
      setLocalNumber(digits);
      const fullPhone = formatFullPhone(selectedCountry.dialCode, digits);
      onChange(fullPhone);
    }
  };

  // Format display value with mask
  const getDisplayValue = () => {
    const digits = localNumber.split("");
    let result = "";
    let digitIndex = 0;

    for (const char of selectedCountry.mask) {
      if (char === "X") {
        if (digitIndex < digits.length) {
          result += digits[digitIndex];
          digitIndex++;
        } else {
          break;
        }
      } else {
        result += char;
      }
    }

    return result;
  };

  return (
    <div className={cn("flex", className)}>
      {/* Country Select */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 px-3 h-10 border border-r-0 border-[var(--border)] rounded-l-lg bg-[var(--surface)] text-sm",
            "hover:bg-[var(--background)] transition-colors",
            "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <img
            src={`https://flagcdn.com/w20/${selectedCountry.code.toLowerCase()}.png`}
            alt={selectedCountry.name}
            className="w-5 h-auto rounded-sm"
          />
          <span className="text-[var(--text-primary)] font-medium">
            {selectedCountry.dialCode}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[var(--text-muted)] transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 w-72 mt-1 bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg max-h-64 overflow-auto">
            {latinAmericanCountries.map((country) => (
              <button
                key={country.code}
                type="button"
                onClick={() => handleCountrySelect(country)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-[var(--background)] transition-colors",
                  selectedCountry.code === country.code && "bg-[var(--primary-light)]"
                )}
              >
                <img
                  src={`https://flagcdn.com/w20/${country.code.toLowerCase()}.png`}
                  alt={country.name}
                  className="w-5 h-auto rounded-sm"
                />
                <span className="flex-1 text-[var(--text-primary)]">
                  {country.name}
                </span>
                <span className="text-[var(--text-muted)] font-mono text-xs">
                  {country.dialCode}
                </span>
                {selectedCountry.code === country.code && (
                  <Check className="w-4 h-4 text-[var(--primary)]" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Phone Input */}
      <input
        ref={inputRef}
        type="tel"
        value={getDisplayValue()}
        onChange={handleNumberChange}
        placeholder={selectedCountry.placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 h-10 px-3 border border-[var(--border)] rounded-r-lg bg-[var(--surface)] text-sm text-[var(--text-primary)]",
          "placeholder:text-[var(--text-muted)]",
          "focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      />
    </div>
  );
}
