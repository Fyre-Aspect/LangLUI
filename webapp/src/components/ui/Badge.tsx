import { ReactNode } from "react";

interface BadgeProps {
  variant?: "blue" | "slate" | "green";
  children: ReactNode;
}

export function Badge({ variant = "blue", children }: BadgeProps) {
  const variantStyles = {
    blue: "bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]",
    slate: "bg-slate-100 text-slate-500 border border-slate-200",
    green: "bg-green-100 text-green-700 border border-green-200",
  };

  return (
    <span
      className={`text-[10px] font-semibold rounded-full px-3 py-1 tracking-wide uppercase ${variantStyles[variant]}`}
    >
      {children}
    </span>
  );
}
