import { Zap } from "lucide-react";

// Placeholder mark. To use the real UNITEN logo, put it in /public (e.g. uniten-logo.svg)
// and replace the body with: <img src="/uniten-logo.svg" alt="UNITEN" className={className} />
export default function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-xl bg-gradient-to-br from-[#ef3c43] to-[#a30f15] text-white shadow-lg shadow-red-900/30 shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <Zap size={size * 0.55} fill="currentColor" strokeWidth={1.5} />
    </span>
  );
}
