import type { ReactNode } from "react";
import type { ResultType } from "../types";

type ResultIconProps = {
  typeId: ResultType["id"];
  className?: string;
};

const frameClass = "h-24 w-24 rounded-3xl border border-slate-200 bg-white p-3 shadow-soft";

const IconWrap = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={`${frameClass} ${className}`}>
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-hidden="true">
      {children}
    </svg>
  </div>
);

const ResultIcon = ({ typeId, className }: ResultIconProps) => {
  switch (typeId) {
    case "vital-stable":
      return (
        <IconWrap className={className}>
          <circle cx="34" cy="34" r="14" fill="#facc15" />
          <path
            d="M34 10v8M34 50v8M10 34h8M50 34h8M18 18l6 6M44 44l6 6M50 18l-6 6M18 50l6-6"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M64 68c8-16 22-21 27-18-3 14-11 24-27 26-8-2-12-7-12-13 0-10 11-19 20-17"
            fill="#22c55e"
            stroke="#15803d"
            strokeWidth="2.5"
          />
        </IconWrap>
      );
    case "quiet-burnout":
      return (
        <IconWrap className={className}>
          <rect x="14" y="28" width="54" height="28" rx="5" fill="#e2e8f0" stroke="#64748b" strokeWidth="2.5" />
          <rect x="68" y="36" width="6" height="12" rx="2" fill="#64748b" />
          <rect x="18" y="32" width="16" height="20" rx="3" fill="#f97316" opacity="0.45" />
          <circle cx="70" cy="70" r="12" fill="#c7d2fe" />
          <circle cx="75" cy="67" r="12" fill="white" />
        </IconWrap>
      );
    case "high-functioning-depressive":
      return (
        <IconWrap className={className}>
          <path d="M20 28c8-10 52-10 60 0v36H20z" fill="#cbd5e1" stroke="#475569" strokeWidth="2.4" />
          <path d="M30 44h40" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 58q8-6 16 0M58 58q8-6 16 0" stroke="#475569" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          <path d="M68 22q9-8 16 0" fill="#94a3b8" />
          <path d="M68 22h16v8H68z" fill="#94a3b8" />
          <line x1="72" y1="30" x2="72" y2="40" stroke="#60a5fa" strokeWidth="2.4" />
          <line x1="80" y1="30" x2="80" y2="44" stroke="#60a5fa" strokeWidth="2.4" />
        </IconWrap>
      );
    case "self-pressure-perfect":
      return (
        <IconWrap className={className}>
          <rect x="18" y="16" width="42" height="64" rx="8" fill="#ecfeff" stroke="#0f766e" strokeWidth="2.5" />
          <path d="M28 32h20M28 44h20M28 56h20" stroke="#0f766e" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M22 32l3 3 5-6M22 44l3 3 5-6M22 56l3 3 5-6" stroke="#14b8a6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <circle cx="74" cy="50" r="18" fill="none" stroke="#f97316" strokeWidth="4" />
          <circle cx="74" cy="50" r="9" fill="#fdba74" opacity="0.8" />
        </IconWrap>
      );
    case "emotional-flux":
      return (
        <IconWrap className={className}>
          <path d="M8 58c12 0 12-16 24-16s12 16 24 16 12-16 24-16 12 16 24 16" fill="none" stroke="#0ea5e9" strokeWidth="5" strokeLinecap="round" />
          <path d="M72 20l4 9 10 1-8 6 2 10-8-5-8 5 2-10-8-6 10-1z" fill="#22d3ee" stroke="#0891b2" strokeWidth="2" />
        </IconWrap>
      );
    case "social-isolation":
      return (
        <IconWrap className={className}>
          <ellipse cx="30" cy="70" rx="20" ry="10" fill="#86efac" />
          <rect x="20" y="45" width="20" height="20" rx="6" fill="#22c55e" />
          <path d="M46 66h40" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
          <path d="M56 66v-8M66 66v-8M76 66v-8" stroke="#94a3b8" strokeWidth="2.5" />
        </IconWrap>
      );
    case "low-resilience":
      return (
        <IconWrap className={className}>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#64748b" strokeWidth="5" strokeDasharray="150 40" />
          <path d="M38 34l8 12-10 8 14 12" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 62q8-2 12-10" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" />
        </IconWrap>
      );
    case "burnout":
      return (
        <IconWrap className={className}>
          <path d="M50 20c8 12 16 19 16 31 0 10-7 19-16 19s-16-9-16-19c0-8 4-14 9-21" fill="#f59e0b" opacity="0.45" />
          <path d="M50 30c5 8 10 12 10 21 0 6-4 11-10 11s-10-5-10-11c0-6 2-10 6-15" fill="#f97316" opacity="0.7" />
        </IconWrap>
      );
    case "unstable-overload":
      return (
        <IconWrap className={className}>
          <path d="M14 30c16 18 20 10 34 28s24 8 38 28" fill="none" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 54c18-8 18 7 36-5s20 4 36-8" fill="none" stroke="#0ea5e9" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M14 72c14-12 18-4 30-14 12-10 24-2 42-14" fill="none" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
        </IconWrap>
      );
    case "stable-maintenance":
      return (
        <IconWrap className={className}>
          <path d="M50 14l28 10v20c0 20-14 34-28 42-14-8-28-22-28-42V24z" fill="#ccfbf1" stroke="#0f766e" strokeWidth="3" />
          <circle cx="50" cy="44" r="13" fill="#14b8a6" opacity="0.22" />
          <path d="M42 44h16" stroke="#0f766e" strokeWidth="3" strokeLinecap="round" />
        </IconWrap>
      );
    case "emergency-critical":
      return (
        <IconWrap className={className}>
          <circle cx="50" cy="50" r="30" fill="#fee2e2" stroke="#e11d48" strokeWidth="4" />
          <path d="M50 32v22" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="62" r="3.5" fill="#be123c" />
        </IconWrap>
      );
    case "strong-risk":
      return (
        <IconWrap className={className}>
          <path d="M50 16l32 56H18z" fill="#ffedd5" stroke="#ea580c" strokeWidth="4" />
          <path d="M50 38v16" stroke="#c2410c" strokeWidth="5" strokeLinecap="round" />
          <circle cx="50" cy="62" r="3" fill="#c2410c" />
        </IconWrap>
      );
    default:
      return (
        <IconWrap className={className}>
          <circle cx="50" cy="50" r="26" fill="#e2e8f0" stroke="#64748b" strokeWidth="3" />
        </IconWrap>
      );
  }
};

export default ResultIcon;
