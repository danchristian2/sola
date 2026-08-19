import { useId } from "react";

export function Logo({ size = 40 }: { size?: number }) {
  const raw = useId();
  const id = `sola-logo-${raw.replace(/:/g, "")}`;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      className="shrink-0 drop-shadow-md"
      aria-label="SOLA"
      role="img"
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect width="128" height="128" rx="28" fill={`url(#${id})`} />
      <rect x="12" y="12" width="104" height="104" rx="22" fill="#ffffff" />
      <text
        x="64"
        y="86"
        textAnchor="middle"
        fill="#1e40af"
        fontSize="58"
        fontWeight="700"
        fontFamily="Segoe UI, Arial, Helvetica, sans-serif"
      >
        S
      </text>
    </svg>
  );
}
