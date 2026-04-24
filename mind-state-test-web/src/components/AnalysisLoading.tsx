import { useEffect, useMemo, useState } from "react";
import StepIndicator from "./StepIndicator";

const loadingTexts = [
  "응답 패턴을 분석하고 있어요",
  "마음 상태 분포를 계산하는 중",
  "결과 유형을 정리하는 중",
] as const;

type AnalysisLoadingProps = {
  durationMs?: number;
};

const AnalysisLoading = ({ durationMs = 2000 }: AnalysisLoadingProps) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => setTick((prev) => prev + 1), 420);
    return () => window.clearInterval(interval);
  }, []);

  const progress = useMemo(() => {
    const cycle = Math.min(100, Math.round((tick * 420 * 100) / durationMs));
    return cycle;
  }, [tick, durationMs]);

  const text = loadingTexts[tick % loadingTexts.length];

  return (
    <main className="px-4 pb-10 pt-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <StepIndicator current="analysis" />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold text-brand-700">분석 중</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800 sm:text-3xl">{text}</h2>
          <div className="mt-4 flex items-center gap-2 text-slate-500">
            <span className="loading-dot" />
            <span className="loading-dot" />
            <span className="loading-dot" />
          </div>

          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          <p className="mt-4 text-sm text-slate-500">답변은 서버로 전송되지 않으며 브라우저 안에서만 계산됩니다.</p>
        </section>
      </div>
    </main>
  );
};

export default AnalysisLoading;
