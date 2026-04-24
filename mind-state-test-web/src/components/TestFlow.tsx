import { useEffect, useMemo, useState } from "react";
import { questions } from "../data/questions";
import { calculateScores, getResultType } from "../utils/scoring";
import AnalysisLoading from "./AnalysisLoading";
import DisclaimerCard from "./DisclaimerCard";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultPage from "./ResultPage";
import StepIndicator from "./StepIndicator";

type TestFlowProps = {
  onRestartToLanding: () => void;
};

type Phase = "question" | "analysis" | "result";

const getQuestionCategoryLabel = (questionIndex: number) => {
  if (questionIndex <= 5) return "활력 체크";
  if (questionIndex <= 11) return "정서 체크";
  if (questionIndex <= 17) return "관계 체크";
  if (questionIndex <= 23) return "회복력 체크";
  if (questionIndex <= 29) return "위험 신호 체크";
  return "자기압박 체크";
};

const TestFlow = ({ onRestartToLanding }: TestFlowProps) => {
  const [phase, setPhase] = useState<Phase>("question");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const total = questions.length;
  const currentNumber = currentIndex + 1;

  const canGoNext = currentAnswer !== null;
  const isLastQuestion = currentIndex === total - 1;

  const finalResult = useMemo(() => {
    if (phase === "question") return null;
    const numericAnswers = answers.map((answer) => answer ?? 0);
    const scoreResult = calculateScores(numericAnswers);
    const type = getResultType(scoreResult.scores, scoreResult.criticalFlag);
    return {
      ...scoreResult,
      type,
    };
  }, [answers, phase]);

  useEffect(() => {
    if (phase !== "analysis") return;
    const timeoutId = window.setTimeout(() => setPhase("result"), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [phase]);

  useEffect(() => {
    if (phase !== "question") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key >= "1" && event.key <= "5") {
        event.preventDefault();
        handleSelect(Number(event.key) - 1);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  const handleSelect = (value: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentIndex] = value;
      return next;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    if (!canGoNext) return;
    if (isLastQuestion) {
      setPhase("analysis");
      return;
    }
    setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
  };

  const handleRestart = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setPhase("question");
    onRestartToLanding();
  };

  if (phase === "analysis") {
    return <AnalysisLoading />;
  }

  if (phase === "result" && finalResult) {
    return (
      <ResultPage
        resultType={finalResult.type}
        scores={finalResult.scores}
        riskLevel={finalResult.riskLevel}
        shouldShowEmergencyNotice={finalResult.shouldShowEmergencyNotice}
        onRestart={handleRestart}
      />
    );
  }

  return (
    <main className="px-4 pb-10 pt-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-4">
        <StepIndicator current="question" />
        <DisclaimerCard />
        <ProgressBar current={currentNumber} total={total} />

        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-soft">
          <p>정답은 없습니다. 최근 2주 기준으로 답해주세요.</p>
          <p className="mt-1">숫자 키 1~5로 선택하고 Enter로 다음 문항으로 이동할 수 있어요.</p>
        </section>

        <QuestionCard
          number={currentNumber}
          total={total}
          category={getQuestionCategoryLabel(currentIndex)}
          text={currentQuestion.text}
          value={currentAnswer}
          onSelect={handleSelect}
        />

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition enabled:hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
          >
            이전
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex-1 rounded-xl bg-brand-600 px-4 py-3 font-semibold text-white transition enabled:hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-200"
          >
            {isLastQuestion ? "분석 시작" : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default TestFlow;
