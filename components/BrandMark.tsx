/* eslint-disable @next/next/no-img-element */
export default function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`grid place-items-center rounded-full bg-white p-[8%] shadow-md shadow-red-950/25 shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <img src="/uniten-logo.svg" alt="UNITEN" className="w-full h-full object-contain" />
    </span>
  );
}
