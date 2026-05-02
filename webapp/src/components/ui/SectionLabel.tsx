interface SectionLabelProps {
  children: string;
}

export function SectionLabel({ children }: SectionLabelProps) {
  return (
    <div className="text-primary-DEFAULT text-xs font-semibold uppercase tracking-widest mb-3">
      {children}
    </div>
  );
}
