import type { ActionItem, Dimension, DimensionScores, ResultType } from "../types";

type RuleType = ResultType & {
  condition: (scores: DimensionScores) => boolean;
};

const createBaseActions = (prefix: string): ActionItem[] => [
  {
    id: `${prefix}-immediate`,
    kind: "즉시",
    title: "오늘 10분 숨 고르기",
    description: "타이머를 켜고 아무것도 하지 않는 10분을 확보해보세요.",
    difficulty: "쉬움",
    time: "10분",
  },
  {
    id: `${prefix}-communication`,
    kind: "소통",
    title: "짧은 상태 공유하기",
    description: "가까운 사람에게 ‘요즘 조금 지쳐 있어’라고 짧게 전해보세요.",
    difficulty: "보통",
    time: "1분",
  },
  {
    id: `${prefix}-routine`,
    kind: "루틴",
    title: "수면 시각 고정하기",
    description: "3일 동안 같은 시간에 잠자리에 들어 리듬을 다시 맞춰보세요.",
    difficulty: "보통",
    time: "이번 주",
  },
];

const withProfessionalAction = (prefix: string, base: ActionItem[]): ActionItem[] => [
  ...base,
  {
    id: `${prefix}-professional`,
    kind: "전문가",
    title: "지속 시 전문가 상담 고려",
    description: "2주 이상 힘든 상태가 이어지면 상담 또는 진료를 고려해보세요.",
    difficulty: "어려움",
    time: "5분",
  },
];

const vitalActions: ActionItem[] = [
  {
    id: "vital-immediate",
    kind: "즉시",
    title: "좋았던 순간 1개 기록",
    description: "오늘 괜찮았던 장면을 한 줄로 적어 안정감을 강화하세요.",
    difficulty: "쉬움",
    time: "1분",
  },
  {
    id: "vital-communication",
    kind: "소통",
    title: "감사 메시지 보내기",
    description: "지지해준 사람에게 짧은 감사 메시지를 보내며 연결감을 유지하세요.",
    difficulty: "쉬움",
    time: "1분",
  },
  {
    id: "vital-routine",
    kind: "루틴",
    title: "회복 루틴 선점하기",
    description: "이번 주 일정표에 휴식 블록을 먼저 넣어 과부하를 예방하세요.",
    difficulty: "보통",
    time: "이번 주",
  },
];

export const EMERGENCY_RESULT_TYPE: ResultType = {
  id: "emergency-critical",
  name: "긴급 주의형",
  shortLabel: "즉각적인 도움 연결이 우선인 상태",
  identityLine: "지금은 해석보다 안전 확보와 즉시 연결이 먼저입니다.",
  description:
    "자해 또는 극단적 선택과 관련된 신호가 확인되었습니다. 지금은 혼자 버티지 않는 것이 가장 중요합니다.",
  summary:
    "현재 결과는 경향 해석보다 즉각적인 도움 연결을 우선해야 하는 신호로 해석됩니다.",
  strengths: ["도움을 찾으려는 의지", "현재 상태를 확인하려는 용기"],
  cautions: ["혼자 버티기", "지원 요청 지연"],
  recommendations: [
    "지금 혼자 있지 않기",
    "119, 112, 109, 1577-0199 연락",
    "가까운 응급실 또는 신뢰할 수 있는 사람에게 즉시 알리기",
  ],
  actions: [
    {
      id: "emergency-immediate",
      kind: "즉시",
      title: "지금 혼자 있지 않기",
      description: "신뢰하는 사람에게 현재 상태를 즉시 알리고 옆에 있어달라고 요청하세요.",
      difficulty: "어려움",
      time: "1분",
    },
    {
      id: "emergency-communication",
      kind: "소통",
      title: "긴급 문장 그대로 말하기",
      description: "‘지금 혼자 버티기 어렵다. 함께 있어줘.’라고 짧게 말해보세요.",
      difficulty: "어려움",
      time: "1분",
    },
    {
      id: "emergency-routine",
      kind: "루틴",
      title: "위기 연락처 저장",
      description: "109, 1577-0199, 119, 112를 휴대폰 즐겨찾기에 등록하세요.",
      difficulty: "보통",
      time: "5분",
    },
    {
      id: "emergency-professional",
      kind: "전문가",
      title: "즉시 전문 도움 연결",
      description: "자살예방상담전화 또는 응급실, 정신건강 전문기관 연결을 지금 진행하세요.",
      difficulty: "어려움",
      time: "5분",
    },
  ],
};

export const HIGH_RISK_RESULT_TYPE: ResultType = {
  id: "strong-risk",
  name: "강한 위험 신호형",
  shortLabel: "전문가 도움을 고려해야 할 신호",
  identityLine: "지금의 피로는 단순 컨디션 저하를 넘어선 신호일 수 있습니다.",
  description:
    "현재 위험 신호가 매우 높게 나타났습니다. 단순한 피로나 스트레스 수준으로 보기 어려운 상태일 수 있습니다.",
  summary:
    "최근 2주 기준으로 부담이 누적되어 있어 외부 지원을 함께 고려하는 접근이 필요합니다.",
  strengths: ["현재 상태 인식", "변화 필요성 감지"],
  cautions: ["도움 요청 지연", "혼자서만 판단하기"],
  recommendations: [
    "가능한 빠르게 전문가 상담 또는 진료 고려",
    "혼자 판단하지 않기",
    "신뢰할 수 있는 사람에게 현재 상태 공유",
  ],
  actions: withProfessionalAction("strong-risk", createBaseActions("strong-risk")),
};

export const orderedResultTypeRules: RuleType[] = [
  {
    id: "burnout",
    name: "번아웃 경향형",
    shortLabel: "에너지가 바닥에 가까운 상태",
    identityLine: "버티는 힘은 남아 있지만 에너지 잔량이 매우 낮은 상태입니다.",
    condition: ({ energy, resilience, risk }) =>
      energy < 40 && resilience < 45 && risk >= 40,
    description: "장기간 에너지 소모가 누적되어 번아웃에 가까운 패턴입니다.",
    summary:
      "일상은 유지하려고 애쓰고 있지만, 회복보다 소모가 빠른 흐름이 반복되고 있습니다.",
    strengths: ["책임감", "꾸준함"],
    cautions: ["탈진", "무기력"],
    recommendations: ["일정 축소", "휴식과 수면 우선", "필요 시 전문가 상담 고려"],
    actions: withProfessionalAction("burnout", createBaseActions("burnout")),
  },
  {
    id: "high-functioning-depressive",
    name: "고기능 우울 경향형",
    shortLabel: "겉은 유지, 안은 소진",
    identityLine: "외부 기능은 유지되지만 내부 정서 에너지가 빠르게 닳는 상태입니다.",
    condition: ({ risk, energy, socialConnection }) =>
      risk >= 55 && energy >= 40 && socialConnection < 50,
    description:
      "일상 기능은 유지하지만 우울감과 고립감이 누적된 상태일 수 있습니다.",
    summary:
      "해야 할 일은 해내지만 감정 회복이 뒤따르지 않아 소진 체감이 커지는 패턴입니다.",
    strengths: ["수행력", "인내심"],
    cautions: ["도움 요청 지연", "괜찮은 척 지속"],
    recommendations: ["2주 이상 지속되면 상담/진료 고려", "감정 기록하기"],
    actions: withProfessionalAction(
      "high-functioning-depressive",
      createBaseActions("high-functioning-depressive")
    ),
  },
  {
    id: "quiet-burnout",
    name: "조용한 소진형",
    shortLabel: "조용히 에너지가 줄어든 상태",
    identityLine: "겉으로는 버티지만 안쪽 에너지가 많이 줄어든 상태입니다.",
    condition: ({ energy, risk, socialConnection }) =>
      energy < 45 && risk >= 45 && socialConnection < 55,
    description: "겉으로는 버티지만 내부 에너지가 많이 소모된 상태입니다.",
    summary:
      "문제를 크게 드러내지 않고 견디는 시간이 길어지면서 회복 창구가 좁아졌습니다.",
    strengths: ["책임감", "일상 유지력"],
    cautions: ["감정 숨김", "피로 누적"],
    recommendations: ["쉬는 시간을 일정에 먼저 넣기", "가까운 사람에게 상태 공유하기"],
    actions: withProfessionalAction("quiet-burnout", createBaseActions("quiet-burnout")),
  },
  {
    id: "self-pressure-perfect",
    name: "자기압박 완벽형",
    shortLabel: "기준이 나를 누르는 상태",
    identityLine: "높은 기준과 자기압박이 피로를 키우는 상태입니다.",
    condition: ({ selfCriticism, risk }) => selfCriticism >= 65 && risk >= 40,
    description:
      "성과와 책임감은 높지만 자기비판이 강해 피로가 누적되기 쉽습니다.",
    summary:
      "성과 중심의 사고가 회복보다 평가를 우선하게 만들어 긴장을 오래 유지하게 합니다.",
    strengths: ["책임감", "기준 의식"],
    cautions: ["죄책감", "완벽주의"],
    recommendations: ["‘충분히 괜찮음’ 기준 만들기", "실수 기록보다 회복 기록 남기기"],
    actions: withProfessionalAction(
      "self-pressure-perfect",
      createBaseActions("self-pressure-perfect")
    ),
  },
  {
    id: "emotional-flux",
    name: "감정기복 민감형",
    shortLabel: "감정 파동이 큰 상태",
    identityLine: "감정 반응 폭이 커져 일상 리듬이 흔들리기 쉬운 상태입니다.",
    condition: ({ emotionalStability, risk }) => emotionalStability < 45 && risk >= 40,
    description: "감정 변화가 크고 스트레스에 민감하게 반응하는 경향이 있습니다.",
    summary:
      "자극이 들어올 때 감정 강도가 빠르게 올라가며 집중과 휴식 모두 끊기기 쉬운 흐름입니다.",
    strengths: ["감수성", "상황 인식력"],
    cautions: ["과도한 반응", "집중력 저하"],
    recommendations: ["감정 강도 1~10점 기록", "수면과 카페인 관리"],
    actions: withProfessionalAction("emotional-flux", createBaseActions("emotional-flux")),
  },
  {
    id: "social-isolation",
    name: "사회적 고립형",
    shortLabel: "혼자 감추는 상태",
    identityLine: "도움이 필요해도 혼자 감추는 습관이 강해진 상태입니다.",
    condition: ({ socialConnection, risk }) => socialConnection < 40 && risk >= 40,
    description: "힘든 상태를 혼자 감추는 경향이 강합니다.",
    summary:
      "문제를 혼자 감당하려는 패턴이 반복되면서 회복 자원을 활용하기 어려워졌습니다.",
    strengths: ["독립성", "자기통제"],
    cautions: ["고립 심화", "도움 요청 회피"],
    recommendations: ["한 사람에게 짧게라도 상태 공유", "도움 요청 문장 미리 만들어두기"],
    actions: withProfessionalAction("social-isolation", createBaseActions("social-isolation")),
  },
  {
    id: "low-resilience",
    name: "회복력 저하형",
    shortLabel: "회복 속도가 느려진 상태",
    identityLine: "회복보다 피로 누적이 더 빠르게 진행되는 상태입니다.",
    condition: ({ resilience, risk }) => resilience < 45 && risk >= 40,
    description: "스트레스 이후 회복이 느리고 피로가 오래 남는 상태입니다.",
    summary:
      "휴식 시간이 있어도 체감 회복이 낮아 다음 과제에 진입할 때 이미 소모된 느낌이 큽니다.",
    strengths: ["버티는 힘", "문제 인식"],
    cautions: ["회복 지연", "만성 피로"],
    recommendations: ["휴식 시간을 회복 활동으로 설계", "업무/공부 강도 줄이기"],
    actions: withProfessionalAction("low-resilience", createBaseActions("low-resilience")),
  },
  {
    id: "unstable-overload",
    name: "불안정 과부하형",
    shortLabel: "감정과 압박이 동시에 높은 상태",
    identityLine: "감정 부담과 자기압박이 동시에 올라가 균형 회복이 필요한 상태입니다.",
    condition: ({ emotionalStability, selfCriticism, resilience }) =>
      emotionalStability < 40 && selfCriticism >= 60 && resilience < 50,
    description: "감정 부담과 자기압박이 동시에 높은 상태입니다.",
    summary:
      "정서 피로와 성과 압박이 함께 높아지면서 생각과 행동이 동시에 과열되기 쉬운 흐름입니다.",
    strengths: ["예민한 감지력", "높은 기준"],
    cautions: ["자기공격", "감정 폭발"],
    recommendations: ["할 일 줄이기", "감정과 사실 분리해서 적기"],
    actions: withProfessionalAction("unstable-overload", createBaseActions("unstable-overload")),
  },
  {
    id: "vital-stable",
    name: "활기 안정형",
    shortLabel: "균형이 살아있는 상태",
    identityLine: "활력과 안정이 함께 유지되는 균형형 상태입니다.",
    condition: ({ energy, emotionalStability, resilience, risk }) =>
      energy >= 65 && emotionalStability >= 65 && resilience >= 60 && risk < 35,
    description: "현재 활력과 정서 안정이 비교적 좋은 상태입니다.",
    summary:
      "기본 리듬이 안정적으로 유지되고 있으며, 회복 루틴도 비교적 잘 작동하고 있습니다.",
    strengths: ["생활 리듬 유지", "감정 균형", "회복력"],
    cautions: ["무리한 자기확신", "피로 신호 무시"],
    recommendations: ["현재 루틴 유지", "수면과 휴식 관리"],
    actions: vitalActions,
  },
  {
    id: "stable-maintenance",
    name: "안정 관리형",
    shortLabel: "관리 가능한 안정 상태",
    identityLine: "큰 위험 신호는 낮고, 일상 관리로 안정성을 키울 수 있는 상태입니다.",
    condition: () => true,
    description: "큰 위험 신호는 낮지만 생활 리듬 관리는 계속 필요합니다.",
    summary:
      "현재 흐름은 관리 가능한 범위에 있으며, 작은 피로를 조기에 다루는 습관이 중요합니다.",
    strengths: ["기본 안정성", "자기관리 가능성"],
    cautions: ["작은 피로 누적"],
    recommendations: ["수면, 운동, 관계 루틴 유지"],
    actions: createBaseActions("stable-maintenance"),
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
