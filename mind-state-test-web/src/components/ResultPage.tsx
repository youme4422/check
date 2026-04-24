import { useMemo, useState } from "react";
import { DIMENSION_LABELS } from "../data/resultTypes";
import type { DimensionScores, ResultType, RiskLevel } from "../types";
import DimensionBars from "./DimensionBars";
import DimensionChart from "./DimensionChart";
import EmergencyNotice from "./EmergencyNotice";

type ResultPageProps = {
  resultType: ResultType;
  scores: DimensionScores;
  riskLevel: RiskLevel;
  shouldShowEmergencyNotice: boolean;
  onRestart: () => void;
};

const riskBadgeClassMap: Record<RiskLevel, string> = {
  "긴급 주의": "bg-rose-100 text-rose-700",
  "매우 높음": "bg-red-100 text-red-700",
  "높음": "bg-orange-100 text-orange-700",
  "주의": "bg-amber-100 text-amber-700",
  "관찰 필요": "bg-blue-100 text-blue-700",
  "낮음": "bg-emerald-100 text-emerald-700",
};

const ResultPage = ({
  resultType,
  scores,
  riskLevel,
  shouldShowEmergencyNotice,
  onRestart,
}: ResultPageProps) => {
  const [copied, setCopied] = useState(false);

  const copyText = useMemo(
    () => `[마음 상태 분포 테스트 결과]
유형: ${resultType.name}
위험 신호: ${riskLevel}
활력: ${scores.energy}
정서 안정: ${scores.emotionalStability}
사회 연결: ${scores.socialConnection}
자기비판: ${scores.selfCriticism}
회복탄력성: ${scores.resilience}
위험 신호 점수: ${scores.risk}
※ 이 결과는 의학적 진단이 아닌 참고용 자가 체크입니다.`,
    [resultType.name, riskLevel, scores]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="px-4 pb-10 pt-4 sm:px-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <p className="text-sm font-semibold text-brand-700">결과 유형</p>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-800">{resultType.name}</h2>
          <p className="mt-1 text-sm text-slate-500">{resultType.shortLabel}</p>
          <p className="mt-4 leading-relaxed text-slate-700">{resultType.description}</p>
          <span
            className={`mt-5 inline-block rounded-full px-3 py-1 text-sm font-semibold ${riskBadgeClassMap[riskLevel]}`}
          >
            위험 신호: {riskLevel}
          </span>
        </section>

        <DimensionChart scores={scores} />
        <DimensionBars scores={scores} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">강점</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
            {resultType.strengths.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">주의 포인트</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
            {resultType.cautions.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">추천 행동</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
            {resultType.recommendations.map((item) => (
              <li key={item} className="rounded-lg bg-brand-50 px-3 py-2 text-brand-900">
                {item}
              </li>
            ))}
          </ul>
        </section>

        {shouldShowEmergencyNotice && <EmergencyNotice />}

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-slate-700">영역별 요약</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-3">
            {(Object.keys(scores) as (keyof DimensionScores)[]).map((key) => (
              <div key={key} className="rounded-xl bg-slate-50 px-3 py-2">
                <p>{DIMENSION_LABELS[key]}</p>
                <p className="font-semibold">{scores[key]}점</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 font-semibold text-brand-800 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            {copied ? "복사 완료" : "결과 복사하기"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            다시 테스트하기
          </button>
        </div>
      </div>
    </main>
  );
};

export default ResultPage;
