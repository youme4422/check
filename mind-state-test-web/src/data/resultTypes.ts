import type { Dimension, DimensionScores, ResultType } from "../types";

type RuleType = ResultType & {
  condition: (scores: DimensionScores) => boolean;
};

export const EMERGENCY_RESULT_TYPE: ResultType = {
  id: "emergency-critical",
  name: "긴급 주의형",
  shortLabel: "즉시 도움 연결 우선",
  description:
    "자해 또는 극단적 선택과 관련된 신호가 확인되었습니다. 이 결과는 해석보다 즉각적인 도움 연결이 우선입니다.",
  strengths: ["도움을 요청하려는 인식", "상태를 확인하려는 시도"],
  cautions: ["혼자 버티기", "즉각적 지원 지연"],
  recommendations: [
    "지금 혼자 있지 않기",
    "119, 112, 109, 1577-0199 연락",
    "가까운 응급실 또는 신뢰할 수 있는 사람에게 즉시 알리기",
  ],
};

export const HIGH_RISK_RESULT_TYPE: ResultType = {
  id: "strong-risk",
  name: "강한 위험 신호형",
  shortLabel: "고위험 신호",
  description:
    "현재 위험 신호가 매우 높게 나타났습니다. 단순한 피로나 스트레스 수준으로 보기 어렵습니다.",
  strengths: ["현재 상태 인식", "변화 필요성 감지"],
  cautions: ["혼자 판단", "도움 요청 지연"],
  recommendations: [
    "가능한 빠르게 전문가 상담 또는 진료",
    "혼자 판단하지 않기",
    "신뢰할 수 있는 사람에게 현재 상태 공유",
  ],
};

export const orderedResultTypeRules: RuleType[] = [
  {
    id: "burnout",
    name: "번아웃 경향형",
    shortLabel: "에너지 고갈 패턴",
    condition: ({ energy, resilience, risk }) => energy < 40 && resilience < 45 && risk >= 40,
    description: "장기간 에너지 소모가 누적되어 번아웃에 가까운 패턴입니다.",
    strengths: ["책임감", "꾸준함"],
    cautions: ["탈진", "무기력"],
    recommendations: ["일정 축소", "휴식과 수면 우선", "필요 시 전문가 상담"],
  },
  {
    id: "high-functioning-depressive",
    name: "고기능 우울 경향형",
    shortLabel: "기능 유지 + 내면 소진",
    condition: ({ risk, energy, socialConnection }) => risk >= 55 && energy >= 40 && socialConnection < 50,
    description:
      "일상 기능은 유지하지만 우울감과 고립감이 누적된 상태일 수 있습니다.",
    strengths: ["수행력", "인내심"],
    cautions: ["도움 요청 지연", "괜찮은 척 지속"],
    recommendations: ["2주 이상 지속되면 상담/진료 고려", "감정 기록하기"],
  },
  {
    id: "quiet-burnout",
    name: "조용한 소진형",
    shortLabel: "겉은 유지, 속은 고갈",
    condition: ({ energy, risk, socialConnection }) => energy < 45 && risk >= 45 && socialConnection < 55,
    description:
      "겉으로는 버티지만 내부 에너지가 많이 소모된 상태입니다.",
    strengths: ["책임감", "일상 유지력"],
    cautions: ["감정 숨김", "피로 누적"],
    recommendations: ["쉬는 시간을 일정에 먼저 넣기", "가까운 사람에게 상태 공유하기"],
  },
  {
    id: "self-pressure-perfect",
    name: "자기압박 완벽형",
    shortLabel: "높은 기준의 피로",
    condition: ({ selfCriticism, risk }) => selfCriticism >= 65 && risk >= 40,
    description:
      "성과와 책임감은 높지만 자기비판이 강해 피로가 누적되기 쉽습니다.",
    strengths: ["책임감", "기준 의식"],
    cautions: ["죄책감", "완벽주의"],
    recommendations: ["‘충분히 괜찮음’ 기준 만들기", "실수 기록보다 회복 기록 남기기"],
  },
  {
    id: "emotional-flux",
    name: "감정기복 민감형",
    shortLabel: "감정 반응 과부하",
    condition: ({ emotionalStability, risk }) => emotionalStability < 45 && risk >= 40,
    description: "감정 변화가 크고 스트레스에 민감하게 반응하는 경향이 있습니다.",
    strengths: ["감수성", "상황 인식력"],
    cautions: ["과도한 반응", "집중력 저하"],
    recommendations: ["감정 강도 1~10점 기록", "수면과 카페인 관리"],
  },
  {
    id: "social-isolation",
    name: "사회적 고립형",
    shortLabel: "혼자 버티는 패턴",
    condition: ({ socialConnection, risk }) => socialConnection < 40 && risk >= 40,
    description: "힘든 상태를 혼자 감추는 경향이 강합니다.",
    strengths: ["독립성", "자기통제"],
    cautions: ["고립 심화", "도움 요청 회피"],
    recommendations: ["한 사람에게 짧게라도 상태 공유", "도움 요청 문장 미리 만들어두기"],
  },
  {
    id: "low-resilience",
    name: "회복력 저하형",
    shortLabel: "회복 지연 패턴",
    condition: ({ resilience, risk }) => resilience < 45 && risk >= 40,
    description:
      "스트레스 이후 회복이 느리고 피로가 오래 남는 상태입니다.",
    strengths: ["버티는 힘", "문제 인식"],
    cautions: ["회복 지연", "만성 피로"],
    recommendations: ["휴식 시간을 회복 활동으로 설계", "업무/공부 강도 줄이기"],
  },
  {
    id: "unstable-overload",
    name: "불안정 과부하형",
    shortLabel: "정서 + 자기압박 동시 과부하",
    condition: ({ emotionalStability, selfCriticism, resilience }) =>
      emotionalStability < 40 && selfCriticism >= 60 && resilience < 50,
    description: "감정 부담과 자기압박이 동시에 높은 상태입니다.",
    strengths: ["예민한 감지력", "높은 기준"],
    cautions: ["자기공격", "감정 폭발"],
    recommendations: ["할 일 줄이기", "감정과 사실 분리해서 적기"],
  },
  {
    id: "vital-stable",
    name: "활기 안정형",
    shortLabel: "균형 유지 패턴",
    condition: ({ energy, emotionalStability, resilience, risk }) =>
      energy >= 65 && emotionalStability >= 65 && resilience >= 60 && risk < 35,
    description: "현재 활력과 정서 안정이 비교적 좋은 상태입니다.",
    strengths: ["생활 리듬 유지", "감정 균형", "회복력"],
    cautions: ["무리한 자기확신", "피로 신호 무시"],
    recommendations: ["현재 루틴 유지", "수면과 휴식 관리"],
  },
  {
    id: "stable-maintenance",
    name: "안정 관리형",
    shortLabel: "기본 안정 + 꾸준한 관리",
    condition: () => true,
    description:
      "큰 위험 신호는 낮지만 생활 리듬 관리는 계속 필요합니다.",
    strengths: ["기본 안정성", "자기관리 가능성"],
    cautions: ["작은 피로 누적"],
    recommendations: ["수면, 운동, 관계 루틴 유지"],
  },
];

export const DIMENSION_LABELS: Record<Dimension, string> = {
  energy: "활력",
  emotionalStability: "정서 안정",
  socialConnection: "사회 연결",
  selfCriticism: "자기비판",
  resilience: "회복탄력성",
  risk: "위험 신호",
};
