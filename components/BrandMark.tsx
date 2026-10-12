/* eslint-disable @next/next/no-img-element */
export default function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`flex items-center justify-center rounded-full bg-white shadow-md shadow-red-950/25 shrink-0 ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.1) }}
    >
      <img src="/uniten-logo.svg" alt="UNITEN" className="block max-w-full max-h-full object-contain" />
    </span>
  );
}
