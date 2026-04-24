import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DIMENSION_LABELS } from "../data/resultTypes";
import type { DimensionScores } from "../types";

type DimensionChartProps = {
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

const DimensionChart = ({ scores }: DimensionChartProps) => {
  const data = orderedKeys.map((key) => ({
    dimension: DIMENSION_LABELS[key],
    value: scores[key],
  }));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-soft sm:p-6">
      <h3 className="text-lg font-semibold text-slate-800">마음 분포 레이더</h3>
      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="68%">
            <PolarGrid stroke="#cbd5e1" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: "#475569", fontSize: 12 }}
            />
            <Radar
              dataKey="value"
              stroke="#0d9488"
              fill="#14b8a6"
              fillOpacity={0.35}
              strokeWidth={2}
            />
            <Tooltip formatter={(value) => [`${value}점`, "점수"]} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
};

export default DimensionChart;
