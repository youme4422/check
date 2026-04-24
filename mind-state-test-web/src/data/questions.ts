import type { Question } from "../types";

export const ANSWER_LABELS = [
  "전혀 아니다",
  "드물다",
  "가끔 그렇다",
  "자주 그렇다",
  "거의 항상 그렇다",
] as const;

export const questions: Question[] = [
  {
    id: 1,
    text: "최근 나는 하루를 시작할 에너지가 충분하다고 느낀다.",
    effects: [{ dimension: "energy", direction: "positive", weight: 1 }],
  },
  {
    id: 2,
    text: "해야 할 일을 해도 즐거움이나 만족감이 거의 없다.",
    effects: [
      { dimension: "energy", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 3,
    text: "작은 일에도 감정이 쉽게 흔들린다.",
    effects: [{ dimension: "emotionalStability", direction: "negative", weight: 1 }],
  },
  {
    id: 4,
    text: "힘들 때 내 상태를 누군가에게 솔직히 말할 수 있다.",
    effects: [{ dimension: "socialConnection", direction: "positive", weight: 1 }],
  },
  {
    id: 5,
    text: "실수하면 필요 이상으로 나를 비난한다.",
    effects: [{ dimension: "selfCriticism", direction: "positive", weight: 1 }],
  },
  {
    id: 6,
    text: "스트레스를 받아도 비교적 빨리 회복된다.",
    effects: [{ dimension: "resilience", direction: "positive", weight: 1 }],
  },
  {
    id: 7,
    text: "최근 2주 이상 우울하거나 공허한 느낌이 지속된다.",
    effects: [{ dimension: "risk", direction: "positive", weight: 2 }],
  },
  {
    id: 8,
    text: "사람들 앞에서는 괜찮은 척하지만 혼자 있으면 무너지는 느낌이 든다.",
    effects: [
      { dimension: "socialConnection", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 9,
    text: "잠을 너무 많이 자거나, 반대로 잠들기 어렵다.",
    effects: [{ dimension: "risk", direction: "positive", weight: 1 }],
  },
  {
    id: 10,
    text: "나는 내 감정을 비교적 잘 알아차린다.",
    effects: [{ dimension: "emotionalStability", direction: "positive", weight: 1 }],
  },
  {
    id: 11,
    text: "해야 할 일을 미루지 않고 처리할 힘이 있다.",
    effects: [{ dimension: "energy", direction: "positive", weight: 1 }],
  },
  {
    id: 12,
    text: "미래에 대한 기대감이 줄었다.",
    effects: [{ dimension: "risk", direction: "positive", weight: 1 }],
  },
  {
    id: 13,
    text: "혼자 있는 시간이 회복이 아니라 고립처럼 느껴진다.",
    effects: [{ dimension: "socialConnection", direction: "negative", weight: 1 }],
  },
  {
    id: 14,
    text: "나는 나 자신에게 지나치게 엄격하다.",
    effects: [{ dimension: "selfCriticism", direction: "positive", weight: 1 }],
  },
  {
    id: 15,
    text: "힘든 일이 있어도 다시 균형을 찾을 수 있다.",
    effects: [{ dimension: "resilience", direction: "positive", weight: 1 }],
  },
  {
    id: 16,
    text: "최근 이유 없이 피로가 오래 지속된다.",
    effects: [
      { dimension: "energy", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 17,
    text: "주변 사람들은 내가 힘든 상태라는 것을 잘 모른다.",
    effects: [{ dimension: "socialConnection", direction: "negative", weight: 1 }],
  },
  {
    id: 18,
    text: "나는 작은 성취에도 나를 인정할 수 있다.",
    effects: [{ dimension: "selfCriticism", direction: "negative", weight: 1 }],
  },
  {
    id: 19,
    text: "감정 기복이 심해 일상 집중이 어렵다.",
    effects: [
      { dimension: "emotionalStability", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 20,
    text: "어려움이 생기면 도움을 요청할 수 있다.",
    effects: [
      { dimension: "socialConnection", direction: "positive", weight: 1 },
      { dimension: "resilience", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 21,
    text: "아무것도 하고 싶지 않은 날이 자주 있다.",
    effects: [
      { dimension: "energy", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 22,
    text: "나의 현재 생활은 어느 정도 균형이 잡혀 있다.",
    effects: [{ dimension: "resilience", direction: "positive", weight: 1 }],
  },
  {
    id: 23,
    text: "나는 쉬어도 회복되지 않는 느낌이 든다.",
    effects: [
      { dimension: "energy", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 24,
    text: "내 감정을 숨기는 것이 습관이 되었다.",
    effects: [{ dimension: "socialConnection", direction: "negative", weight: 1 }],
  },
  {
    id: 25,
    text: "나는 실패해도 다시 시도할 수 있다고 느낀다.",
    effects: [{ dimension: "resilience", direction: "positive", weight: 1 }],
  },
  {
    id: 26,
    text: "자주 죄책감이나 쓸모없다는 느낌이 든다.",
    effects: [
      { dimension: "selfCriticism", direction: "positive", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 27,
    text: "최근 식욕이나 체중 변화가 눈에 띄게 있었다.",
    effects: [{ dimension: "risk", direction: "positive", weight: 1 }],
  },
  {
    id: 28,
    text: "일상은 유지하지만 속으로는 계속 버티는 느낌이다.",
    effects: [
      { dimension: "risk", direction: "positive", weight: 1 },
      { dimension: "energy", direction: "negative", weight: 1 },
    ],
  },
  {
    id: 29,
    text: "나는 현재 내 삶에 활기나 의미를 느낀다.",
    effects: [
      { dimension: "energy", direction: "positive", weight: 1 },
      { dimension: "risk", direction: "negative", weight: 1 },
    ],
  },
  {
    id: 30,
    text: "죽고 싶다거나 사라지고 싶다는 생각이 든 적이 있다.",
    effects: [{ dimension: "risk", direction: "positive", weight: 3 }],
    critical: true,
  },
  {
    id: 31,
    text: "나는 내 감정을 말하면 상대에게 부담이 될 것 같아 숨긴다.",
    effects: [
      { dimension: "socialConnection", direction: "negative", weight: 1 },
      { dimension: "selfCriticism", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 32,
    text: "쉬는 날에도 마음이 편하지 않고 계속 압박감을 느낀다.",
    effects: [
      { dimension: "emotionalStability", direction: "negative", weight: 1 },
      { dimension: "selfCriticism", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 33,
    text: "최근 웃거나 즐거워하는 시간이 줄었다.",
    effects: [
      { dimension: "energy", direction: "negative", weight: 1 },
      { dimension: "risk", direction: "positive", weight: 1 },
    ],
  },
  {
    id: 34,
    text: "나는 문제를 혼자 해결해야 한다고 느끼는 편이다.",
    effects: [
      { dimension: "socialConnection", direction: "negative", weight: 1 },
      { dimension: "resilience", direction: "negative", weight: 1 },
    ],
  },
  {
    id: 35,
    text: "스트레스가 쌓이면 몸의 피로, 두통, 소화불량 같은 신호가 나타난다.",
    effects: [
      { dimension: "risk", direction: "positive", weight: 1 },
      { dimension: "emotionalStability", direction: "negative", weight: 1 },
    ],
  },
  {
    id: 36,
    text: "지금의 나는 도움을 받아도 괜찮다고 생각한다.",
    effects: [
      { dimension: "socialConnection", direction: "positive", weight: 1 },
      { dimension: "resilience", direction: "positive", weight: 1 },
      { dimension: "selfCriticism", direction: "negative", weight: 1 },
    ],
  },
];
