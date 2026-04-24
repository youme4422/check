type ProgressBarProps = {
  current: number;
  total: number;
};

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <section aria-label="진행도" className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          진행 {current} / {total}
        </span>
        <span className="font-semibold text-brand-700">{progress}%</span>
      </div>
      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
};

export default ProgressBar;
