import Link from "next/link";
import { ReactNode } from "react";

interface ButtonProps {
  variant?: "primary" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit";
}

export function Button({
  variant = "primary",
  size = "md",
  href,
  onClick,
  disabled,
  children,
  className = "",
  type = "button",
}: ButtonProps) {
  const baseStyles =
    "rounded-pill font-semibold transition-all active:scale-[0.97] disabled:opacity-70 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-4 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  const variantStyles = {
    primary:
      "bg-primary-DEFAULT hover:bg-primary-DEFAULT text-slate-900 disabled:bg-primary-DEFAULT shadow-md hover:shadow-lg font-bold",
    ghost:
      "bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200 hover:border-slate-400",
  };

  const combinedClassName = `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combinedClassName}
    >
      {children}
    </button>
  );
}
