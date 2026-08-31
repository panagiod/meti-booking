import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus-visible:ring-[var(--primary)] shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-xs",
        secondary:
          "bg-transparent text-[var(--secondary)] border-[1.5px] border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white focus-visible:ring-[var(--secondary)] active:bg-[var(--secondary-dark)] dark:text-[var(--text-primary)] dark:border-[var(--border)] dark:hover:bg-[var(--border)] dark:hover:text-[var(--text-primary)] dark:active:bg-[var(--border-light)] dark:focus-visible:ring-[var(--primary)]",
        ghost:
          "bg-transparent text-[var(--primary)] hover:bg-[var(--primary-light)] focus-visible:ring-[var(--primary)] active:bg-[var(--primary-light)]/80",
        link: "bg-transparent text-[var(--primary)] underline-offset-4 hover:underline focus-visible:ring-[var(--primary)] p-0 h-auto",
        destructive:
          "bg-[var(--error)] text-white hover:bg-[var(--error-dark)] focus-visible:ring-[var(--error)] shadow-sm hover:shadow-md",
        success:
          "bg-[var(--success)] text-white hover:bg-[var(--success-dark)] focus-visible:ring-[var(--success)] shadow-sm hover:shadow-md",
        outline:
          "bg-transparent text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--background)] hover:border-[var(--text-muted)] focus-visible:ring-[var(--primary)]",
      },
      size: {
        default: "h-10 px-5 py-2.5",
        sm: "h-8 px-3 py-1.5 text-xs rounded-md",
        lg: "h-12 px-8 py-3 text-base",
        xl: "h-14 px-10 py-4 text-lg",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner-sm" />
            <span className="opacity-70">Cargando...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
