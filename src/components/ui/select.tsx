"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ className, options, value, placeholder, onChange, disabled }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [selectedValue, setSelectedValue] = React.useState(value || "");
    const [dropdownPosition, setDropdownPosition] = React.useState<"bottom" | "top">("bottom");
    const triggerRef = React.useRef<HTMLButtonElement>(null);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    const selectedOption = options.find((opt) => opt.value === selectedValue);

    React.useEffect(() => {
      setSelectedValue(value || "");
    }, [value]);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current && 
          !triggerRef.current.contains(event.target as Node) &&
          dropdownRef.current && 
          !dropdownRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const calculatePosition = () => {
      if (!triggerRef.current) return "bottom";
      
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const dropdownHeight = Math.min(options.length * 40, 240); // Max height 240px
      
      return spaceBelow < dropdownHeight ? "top" : "bottom";
    };

    const handleOpen = () => {
      if (disabled) return;
      const position = calculatePosition();
      setDropdownPosition(position);
      setIsOpen(!isOpen);
    };

    const handleSelect = (optionValue: string) => {
      setSelectedValue(optionValue);
      onChange?.(optionValue);
      setIsOpen(false);
    };

    const dropdownStyles = React.useMemo(() => {
      if (dropdownPosition === "top") {
        return "bottom-full mb-1";
      }
      return "top-full mt-1";
    }, [dropdownPosition]);

    return (
      <div className={cn("relative", className)}>
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border bg-[var(--surface)] px-3.5 py-2.5 text-sm transition-colors",
            "hover:border-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/15",
            "disabled:cursor-not-allowed disabled:opacity-50",
            isOpen ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/15" : "border-[var(--border)]"
          )}
        >
          <span className={cn(
            "truncate",
            selectedOption ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
          )}>
            {selectedOption?.label || placeholder || "Select..."}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-[var(--text-muted)] transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div 
            ref={dropdownRef}
            className={cn(
              "absolute z-50 w-full bg-[var(--surface)] border border-[var(--border)] rounded-lg shadow-lg overflow-hidden",
              dropdownStyles
            )}
          >
            <div className="max-h-60 overflow-auto py-1">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={cn(
                    "flex items-center justify-between w-full px-3.5 py-2.5 text-sm transition-colors",
                    "hover:bg-[var(--background)] focus:bg-[var(--background)] focus:outline-none",
                    selectedValue === option.value
                      ? "bg-[var(--primary-light)] text-[var(--primary)]"
                      : "text-[var(--text-primary)]"
                  )}
                >
                  <span className="truncate">{option.label}</span>
                  {selectedValue === option.value && (
                    <Check className="w-4 h-4 text-[var(--primary)] flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
