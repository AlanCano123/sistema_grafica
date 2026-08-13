import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  accent: "green" | "red" | "blue" | "yellow";
  sublabel?: string;
  icon: LucideIcon;
}

const ACCENT = {
  green: { border: "border-l-[#1cc88a]", text: "text-[#1cc88a]" },
  red: { border: "border-l-[#e74a3b]", text: "text-[#e74a3b]" },
  blue: { border: "border-l-[#4e73df]", text: "text-[#4e73df]" },
  yellow: { border: "border-l-[#f6c23e]", text: "text-[#f6c23e]" },
} as const;

export default function StatCard({ label, value, accent, sublabel, icon: Icon }: StatCardProps) {
  const { border, text } = ACCENT[accent];

  return (
    <div className={`rounded border-l-4 ${border} bg-white p-4 shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-bold tracking-wide uppercase ${text}`}>{label}</p>
          <p className="mt-1 text-lg font-bold text-gray-700">{value}</p>
          {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
        </div>
        <Icon size={28} className="text-gray-300" />
      </div>
    </div>
  );
}
