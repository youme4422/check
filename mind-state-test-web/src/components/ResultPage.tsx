import { useMemo, useState } from "react";
import { DIMENSION_LABELS } from "../data/resultTypes";
import type { ActionItem, DimensionScores, ResultType, RiskLevel } from "../types";
import ActionCards from "./ActionCards";
import DimensionBars from "./DimensionBars";
import DimensionChart from "./DimensionChart";
import DisclaimerCard from "./DisclaimerCard";
import EmergencyNotice from "./EmergencyNotice";
import ResultIcon from "./ResultIcon";
import StepIndicator from "./StepIndicator";

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

const splitActions = (actions: ActionItem[]) => {
  const weekly = actions.filter((action) => action.time === "이번 주");
  const today = actions.filter((action) => action.time !== "이번 주");
  return {
    today: today.length ? today : actions.slice(0, 3),
    weekly: weekly.length ? weekly : actions.slice(-1),
  };
};

const ResultPage = ({
  resultType,
  scores,
  riskLevel,
  shouldShowEmergencyNotice,
  onRestart,
}: ResultPageProps) => {
  const [copied, setCopied] = useState(false);
  const [shortCopied, setShortCopied] = useState(false);

  const { today, weekly } = useMemo(() => splitActions(resultType.actions), [resultType.actions]);

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

  const shortShareText = useMemo(
    () =>
      `마음 상태 분포 테스트 결과: ${resultType.name} (${resultType.shortLabel})\n위험 신호: ${riskLevel}\n자가 체크 링크: ${window.location.origin}${import.meta.env.BASE_URL}`,
    [resultType.name, resultType.shortLabel, riskLevel]
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

  const handleShortCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortShareText);
      setShortCopied(true);
      window.setTimeout(() => setShortCopied(false), 2000);
    } catch {
      setShortCopied(false);
    }
  };

  return (
    <main className="px-4 pb-10 pt-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <StepIndicator current="result" />

        {shouldShowEmergencyNotice && <EmergencyNotice />}

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-brand-700">자가 체크 결과</p>
              <h2 className="text-3xl font-extrabold text-slate-800">{resultType.name}</h2>
              <p className="text-sm font-semibold text-slate-500">{resultType.shortLabel}</p>
              <p className="text-base text-slate-700">{resultType.identityLine}</p>
              <span
                className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${riskBadgeClassMap[riskLevel]}`}
              >
                위험 신호: {riskLevel}
              </span>
            </div>
            <ResultIcon typeId={resultType.id} className="self-start" />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">내 상태 요약</h3>
          <p className="mt-2 leading-relaxed text-slate-700">{resultType.summary}</p>
          <p className="mt-2 text-sm text-slate-500">{resultType.description}</p>
        </section>

        <DimensionChart scores={scores} />
        <DimensionBars scores={scores} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">좋은 점</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
            {resultType.strengths.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-lg font-semibold text-slate-800">주의할 점</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-700 sm:text-base">
            {resultType.cautions.map((item) => (
              <li key={item} className="rounded-lg bg-slate-50 px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </section>

        <ActionCards title="오늘 바로 할 수 있는 행동" actions={today} />
        <ActionCards title="이번 주 추천 행동" actions={weekly} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
          <h3 className="text-base font-semibold text-slate-700">영역별 점수</h3>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 sm:grid-cols-3">
            {(Object.keys(scores) as (keyof DimensionScores)[]).map((key) => (
              <div key={key} className="rounded-xl bg-slate-50 px-3 py-2">
                <p>{DIMENSION_LABELS[key]}</p>
                <p className="font-semibold">{scores[key]}점</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 font-semibold text-brand-800 transition hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            {copied ? "복사 완료" : "결과 복사하기"}
          </button>
          <button
            type="button"
            onClick={handleShortCopy}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            {shortCopied ? "복사 완료" : "짧은 공유 문구 복사"}
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            다시 테스트하기
          </button>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-soft">
          <p>답변은 서버로 전송되지 않으며 브라우저 안에서만 계산됩니다.</p>
          <p className="mt-1">이 페이지는 진단 결과가 아닌 참고용 자가 체크 결과를 제공합니다.</p>
        </section>

        <DisclaimerCard />
      </div>
    </main>
  );
};

export default ResultPage;
