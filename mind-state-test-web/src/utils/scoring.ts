import {
  EMERGENCY_RESULT_TYPE,
  HIGH_RISK_RESULT_TYPE,
  orderedResultTypeRules,
} from "../data/resultTypes";
import { questions } from "../data/questions";
import type {
  Dimension,
  DimensionScores,
  ResultType,
  RiskLevel,
  ScoreResult,
} from "../types";

const HEALTHY_DIMENSIONS: Dimension[] = [
  "energy",
  "emotionalStability",
  "socialConnection",
  "resilience",
];

const CAUTION_DIMENSIONS: Dimension[] = ["selfCriticism", "risk"];
const ALL_DIMENSIONS: Dimension[] = [...HEALTHY_DIMENSIONS, ...CAUTION_DIMENSIONS];

const getInitialScoreMap = (): DimensionScores => ({
  energy: 0,
  emotionalStability: 0,
  socialConnection: 0,
  selfCriticism: 0,
  resilience: 0,
  risk: 0,
});

const getRiskLevel = (risk: number, criticalFlag: boolean): RiskLevel => {
  if (criticalFlag) return "긴급 주의";
  if (risk < 25) return "낮음";
  if (risk < 45) return "관찰 필요";
  if (risk < 65) return "주의";
  if (risk < 80) return "높음";
  return "매우 높음";
};

export const calculateScores = (answers: number[]): ScoreResult => {
  const rawScores = getInitialScoreMap();
  const maxRaw = getInitialScoreMap();

  questions.forEach((question, questionIndex) => {
    const answer = answers[questionIndex] ?? 0;

    question.effects.forEach(({ dimension, direction, weight }) => {
      maxRaw[dimension] += 4 * weight;

      if (direction === "positive") {
        rawScores[dimension] += answer * weight;
        return;
      }

      if (HEALTHY_DIMENSIONS.includes(dimension)) {
        rawScores[dimension] += (4 - answer) * weight;
      } else {
        rawScores[dimension] += answer * weight;
      }
    });
  });

  const scores = ALL_DIMENSIONS.reduce((acc, dimension) => {
    const safeMax = maxRaw[dimension] || 1;
    acc[dimension] = Math.round((rawScores[dimension] / safeMax) * 100);
    return acc;
  }, getInitialScoreMap());

  const criticalAnswer = answers[29] ?? 0;
  const criticalFlag = criticalAnswer >= 2;
  const riskLevel = getRiskLevel(scores.risk, criticalFlag);

  return {
    scores,
    riskLevel,
    criticalFlag,
    shouldShowEmergencyNotice: criticalFlag || scores.risk >= 80,
  };
};

export const getResultType = (
  scores: DimensionScores,
  criticalFlag: boolean
): ResultType => {
  if (criticalFlag) return EMERGENCY_RESULT_TYPE;
  if (scores.risk >= 80) return HIGH_RISK_RESULT_TYPE;

  return (
    orderedResultTypeRules.find((resultType) => resultType.condition(scores)) ??
    orderedResultTypeRules[orderedResultTypeRules.length - 1]
  );
};
