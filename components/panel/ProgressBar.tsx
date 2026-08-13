interface ProgressBarProps {
  label: string;
  pct: number;
  color?: string; // hex, default azul primary
  valueLabel?: string;
}

export default function ProgressBar({ label, pct, color = "#4e73df", valueLabel }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, pct));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs font-bold text-gray-700">
        <span>{label}</span>
        <span>{valueLabel ?? `${clamped}%`}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div className="h-full rounded-full" style={{ width: `${clamped}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
