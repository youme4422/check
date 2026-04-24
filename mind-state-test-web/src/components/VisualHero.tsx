const VisualHero = () => {
  return (
    <div className="relative mx-auto h-56 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 sm:h-64">
      <svg viewBox="0 0 640 320" className="h-full w-full" role="img" aria-label="마음 상태를 상징하는 추상 일러스트">
        <defs>
          <linearGradient id="body" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.88" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="bubble" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#dbeafe" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#99f6e4" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <ellipse cx="330" cy="270" rx="190" ry="36" fill="#cbd5e1" opacity="0.3" />
        <path d="M262 220c0-39 29-68 68-68s68 29 68 68v54H262z" fill="url(#body)" />
        <circle cx="330" cy="115" r="45" fill="#155e75" opacity="0.85" />
        <path d="M300 148c12 5 20 6 30 6 11 0 22-1 31-6" stroke="#e2e8f0" strokeWidth="4" strokeLinecap="round" opacity="0.7" />

        <circle cx="180" cy="80" r="34" fill="url(#bubble)" />
        <circle cx="470" cy="70" r="28" fill="url(#bubble)" />
        <circle cx="520" cy="140" r="22" fill="url(#bubble)" />
        <circle cx="140" cy="150" r="20" fill="url(#bubble)" />

        <path d="M180 80q20 16 45 12" stroke="#0f766e" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />
        <path d="M470 70q-13 20-30 22" stroke="#0f766e" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />
        <path d="M520 140q-12 14-24 10" stroke="#0f766e" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.75" />

        <circle cx="210" cy="220" r="8" fill="#60a5fa" opacity="0.65" />
        <circle cx="440" cy="210" r="10" fill="#2dd4bf" opacity="0.55" />
      </svg>
    </div>
  );
};

export default VisualHero;
