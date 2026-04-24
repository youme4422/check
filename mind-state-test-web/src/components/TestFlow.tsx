import { useMemo, useState } from "react";
import { questions } from "../data/questions";
import { calculateScores, getResultType } from "../utils/scoring";
import DisclaimerCard from "./DisclaimerCard";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import ResultPage from "./ResultPage";

type TestFlowProps = {
  onRestartToLanding: () => void;
};

const TestFlow = ({ onRestartToLanding }: TestFlowProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array(questions.length).fill(null)
  );
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentIndex];
  const total = questions.length;
  const currentNumber = currentIndex + 1;

  const canGoNext = currentAnswer !== null;
  const isLastQuestion = currentIndex === total - 1;

  const finalResult = useMemo(() => {
    if (!completed) return null;
    const numericAnswers = answers.map((answer) => answer ?? 0);
    const scoreResult = calculateScores(numericAnswers);
    const type = getResultType(scoreResult.scores, scoreResult.criticalFlag);
    return {
      ...scoreResult,
      type,
    };
  }, [answers, completed]);

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
      setCompleted(true);
      return;
    }
    setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
  };

  const handleRestart = () => {
    setAnswers(Array(questions.length).fill(null));
    setCurrentIndex(0);
    setCompleted(false);
    onRestartToLanding();
  };

  if (completed && finalResult) {
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
      <div className="mx-auto max-w-3xl space-y-4">
        <DisclaimerCard />
        <ProgressBar current={currentNumber} total={total} />

        <QuestionCard
          number={currentNumber}
          total={total}
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
            {isLastQuestion ? "결과 보기" : "다음"}
          </button>
        </div>
      </div>
    </main>
  );
};

export default TestFlow;
