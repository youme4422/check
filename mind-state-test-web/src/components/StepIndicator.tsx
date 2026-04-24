import type { ReactNode } from "react";

type Step = "start" | "question" | "analysis" | "result";

type StepIndicatorProps = {
  current: Step;
  className?: string;
};

type StepItem = {
  key: Step;
  label: string;
  icon: ReactNode;
};

const steps: StepItem[] = [
  { key: "start", label: "시작", icon: "○" },
  { key: "question", label: "질문", icon: "◔" },
  { key: "analysis", label: "분석", icon: "◑" },
  { key: "result", label: "결과", icon: "●" },
];

const stepOrder: Record<Step, number> = {
  start: 0,
  question: 1,
  analysis: 2,
  result: 3,
};

const StepIndicator = ({ current, className = "" }: StepIndicatorProps) => {
  const currentIndex = stepOrder[current];

  return (
    <section className={`rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-soft ${className}`} aria-label="단계 안내">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPassed = index < currentIndex;
          return (
            <div key={step.key} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${
                  isActive
                    ? "border-brand-600 bg-brand-100 text-brand-700"
                    : isPassed
                    ? "border-brand-300 bg-brand-50 text-brand-700"
                    : "border-slate-300 bg-slate-50 text-slate-500"
                }`}
              >
                {step.icon}
              </div>
              <p className={`truncate text-xs font-medium ${isActive ? "text-brand-700" : "text-slate-500"}`}>
                {step.label}
              </p>
              {index !== steps.length - 1 && <div className="hidden h-px flex-1 bg-slate-200 sm:block" />}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">정답은 없습니다. 최근 2주 기준으로 가장 가까운 답을 선택해주세요.</p>
    </section>
  );
};

export default StepIndicator;
