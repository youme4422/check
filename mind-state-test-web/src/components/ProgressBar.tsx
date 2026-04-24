type ProgressBarProps = {
  current: number;
  total: number;
};

const ProgressBar = ({ current, total }: ProgressBarProps) => {
  const progress = Math.min(100, Math.max(0, Math.round((current / total) * 100)));

  return (
    <section aria-label="진행도" className="space-y-2">
      <div className="flex items-center justify-between text-sm text-slate-600">
        <span>
          {current} / {total}
        </span>
        <span>{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </section>
  );
};

export default ProgressBar;
