export type Dimension =
  | "energy"
  | "emotionalStability"
  | "socialConnection"
  | "selfCriticism"
  | "resilience"
  | "risk";

export type EffectDirection = "positive" | "negative";

export type QuestionEffect = {
  dimension: Dimension;
  direction: EffectDirection;
  weight: number;
};

export type Question = {
  id: number;
  text: string;
  effects: QuestionEffect[];
  critical?: boolean;
};

export type RiskLevel =
  | "낮음"
  | "관찰 필요"
  | "주의"
  | "높음"
  | "매우 높음"
  | "긴급 주의";

export type DimensionScores = Record<Dimension, number>;

export type ScoreResult = {
  scores: DimensionScores;
  riskLevel: RiskLevel;
  criticalFlag: boolean;
  shouldShowEmergencyNotice: boolean;
};

export type ResultType = {
  id: string;
  name: string;
  shortLabel: string;
  description: string;
  strengths: string[];
  cautions: string[];
  recommendations: string[];
  condition?: (scores: DimensionScores) => boolean;
};
