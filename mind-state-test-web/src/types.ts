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

export type ActionDifficulty = "쉬움" | "보통" | "어려움";
export type ActionTime = "1분" | "5분" | "10분" | "이번 주";
export type ActionKind = "즉시" | "소통" | "루틴" | "전문가";

export type ActionItem = {
  id: string;
  kind: ActionKind;
  title: string;
  description: string;
  difficulty: ActionDifficulty;
  time: ActionTime;
};

export type ResultType = {
  id: string;
  name: string;
  shortLabel: string;
  identityLine: string;
  description: string;
  summary: string;
  strengths: string[];
  cautions: string[];
  recommendations: string[];
  actions: ActionItem[];
  condition?: (scores: DimensionScores) => boolean;
};
