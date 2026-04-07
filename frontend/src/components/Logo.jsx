export default function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <rect width="64" height="64" rx="14" fill="#0A0A0A" />
      <rect x="1" y="1" width="62" height="62" rx="13" stroke="#D4A017" strokeWidth="2" />
      <text
        x="32"
        y="40"
        textAnchor="middle"
        fontSize="24"
        fontWeight="bold"
        fill="#D4A017"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        FT
      </text>
      <line x1="14" y1="48" x2="50" y2="48" stroke="#D4A017" strokeWidth="1" opacity="0.4" />
      <circle cx="32" cy="52" r="1.5" fill="#D4A017" opacity="0.5" />
    </svg>
  );
}
