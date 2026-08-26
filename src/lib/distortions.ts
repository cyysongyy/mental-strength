import type { DistortionTag } from "../types";

export const DISTORTIONS: DistortionTag[] = [
  {
    id: "all-or-nothing",
    label: "全有全無",
    description: "把事情看成非黑即白，沒有中間地帶（例如：「這次沒做好，我就是個失敗者」）。",
  },
  {
    id: "catastrophizing",
    label: "災難化",
    description: "把可能發生的壞結果放到最大，想像最糟的情況一定會發生。",
  },
  {
    id: "mind-reading",
    label: "讀心術",
    description: "認定自己知道別人在想什麼，通常是負面的評價，但沒有實際證據。",
  },
  {
    id: "fortune-telling",
    label: "算命式思考",
    description: "在沒有足夠證據下，斷定事情一定會有壞結果。",
  },
  {
    id: "labeling",
    label: "貼標籤",
    description: "用一個簡化的負面標籤概括自己或他人（例如：「我很笨」、「他很自私」）。",
  },
  {
    id: "should-statements",
    label: "應該句型",
    description: "用「應該」、「必須」來要求自己或他人，達不到就自責或憤怒。",
  },
  {
    id: "personalization",
    label: "個人化",
    description: "把不完全是自己責任的事，全部歸咎到自己身上。",
  },
  {
    id: "discounting-positive",
    label: "否定正面",
    description: "把自己的好表現或優點視為理所當然或不算數。",
  },
];

export const REPLACEMENT_TEMPLATES: Record<string, string[]> = {
  "all-or-nothing": [
    "這次沒做到完美，不代表全盤皆輸——中間還有很多可能性。",
    "我可以承認這部分不夠好，同時看見其他做得到的部分。",
  ],
  catastrophizing: [
    "最糟的情況不是唯一的可能，實際發生的機率通常比我想的低。",
    "就算真的發生不好的結果，我過去也有能力應對類似的狀況。",
  ],
  "mind-reading": [
    "我沒有證據證明對方真的這麼想，我可以直接問或先不下結論。",
    "別人的表情/沉默可能有很多原因，不一定跟我有關。",
  ],
  "fortune-telling": [
    "未來還沒發生，我現在的猜測不等於事實。",
    "我可以先做好準備，而不是預先假設一定會失敗。",
  ],
  labeling: [
    "這是一個行為或結果，不等於我整個人的價值。",
    "我可以說「這次做得不夠好」，而不是給自己貼上永久標籤。",
  ],
  "should-statements": [
    "我可以有期待，但不用把它變成一定要達成的鐵律。",
    "换成「我希望」而不是「我應該」，給自己多一點彈性。",
  ],
  personalization: [
    "這件事的結果通常有很多因素造成，不是我一個人能完全決定的。",
    "我可以檢視自己的責任範圍，而不是把所有責任都攬在身上。",
  ],
  "discounting-positive": [
    "這個好結果也是我努力/能力的一部分，值得被看見。",
    "我可以同時承認優點與待改進之處，兩者不衝突。",
  ],
};
