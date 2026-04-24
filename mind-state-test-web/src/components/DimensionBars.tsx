import { DIMENSION_LABELS } from "../data/resultTypes";
import type { DimensionScores } from "../types";

type DimensionBarsProps = {
  scores: DimensionScores;
};

const orderedKeys: (keyof DimensionScores)[] = [
  "energy",
  "emotionalStability",
  "socialConnection",
  "selfCriticism",
  "resilience",
  "risk",
];

const DimensionBars = ({ scores }: DimensionBarsProps) => {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <h3 className="text-lg font-semibold text-slate-800">영역별 점수</h3>
      <div className="mt-4 space-y-3">
        {orderedKeys.map((key) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between text-sm text-slate-700">
              <span>{DIMENSION_LABELS[key]}</span>
              <span className="font-semibold">{scores[key]}점</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500 transition-all duration-500"
                style={{ width: `${scores[key]}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default DimensionBars;
