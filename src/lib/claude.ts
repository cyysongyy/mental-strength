import Anthropic from "@anthropic-ai/sdk";

export const AVAILABLE_MODELS = [
  { id: "claude-opus-5", label: "Claude Opus 5（最深度，較貴）" },
  { id: "claude-sonnet-5", label: "Claude Sonnet 5（推薦，平衡）" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5（最快，較省）" },
];

export class MissingApiKeyError extends Error {
  constructor() {
    super("尚未設定 API Key");
    this.name = "MissingApiKeyError";
  }
}

function getClient(apiKey: string) {
  if (!apiKey) throw new MissingApiKeyError();
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

async function askClaude(
  apiKey: string,
  model: string,
  system: string,
  userText: string,
  maxTokens = 1500,
): Promise<string> {
  const client = getClient(apiKey);
  const message = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userText }],
  });
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

const REFRAME_SYSTEM_PROMPT = `你是一位溫暖但直接的「心理素質教練」，採用蘇格拉底式提問法幫助使用者進行認知重構。
規則：
1. 不要直接給答案或說教，先簡短反映你聽到的情緒與想法（1-2句）。
2. 指出你觀察到的潛在認知偏誤（例如：全有全無、災難化、讀心術、貼標籤等），用平實語言說明，不要用生硬的心理學術語轟炸使用者。
3. 提出 1-2 個具體、針對使用者情境的追問，引導他們用證據檢視自己的想法（例如：「過去有沒有類似情況但結果沒那麼糟？」）。
4. 語氣像信任的教練，簡短有力，使用繁體中文，總長度控制在 200 字以內，可以用條列。
5. 只有在對話進行到後段、使用者已經回應過追問後，才給一句簡短的、可以立刻練習的替代想法草稿，標記為「可以試試看這樣想：」；對話剛開始時不要直接給替代想法。`;

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export async function reframeChat(
  apiKey: string,
  model: string,
  history: ChatTurn[],
): Promise<string> {
  const client = getClient(apiKey);
  const message = await client.messages.create({
    model,
    max_tokens: 800,
    system: REFRAME_SYSTEM_PROMPT,
    messages: history.map((h) => ({ role: h.role, content: h.content })),
  });
  const block = message.content.find((b) => b.type === "text");
  return block && block.type === "text" ? block.text : "";
}

export async function decomposeCircles(
  apiKey: string,
  model: string,
  userText: string,
): Promise<{ controllable: string[]; uncontrollable: string[]; actions: string[] }> {
  const raw = await askClaude(
    apiKey,
    model,
    `你是「圈層控制」教練，依據史蒂芬·柯維的「控制圈/影響圈/關注圈」概念分析使用者描述的事件。
請只回傳合法 JSON（不要加任何前後文字或 markdown code fence），格式為：
{"controllable": ["可控要素1", "可控要素2"], "uncontrollable": ["不可控要素1", "不可控要素2"], "actions": ["針對可控要素的具體行動指令1", "行動指令2"]}
使用繁體中文，每個陣列 2-4 項，內容具體、簡短（每項不超過 25 字）。`,
    userText,
    1000,
  );
  try {
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, "");
    return JSON.parse(cleaned);
  } catch {
    return { controllable: [], uncontrollable: [], actions: [raw] };
  }
}

export async function planMicroExposure(
  apiKey: string,
  model: string,
  fear: string,
): Promise<{ step: number; title: string; description: string }[]> {
  const raw = await askClaude(
    apiKey,
    model,
    `你是「情緒耐受訓練」教練，根據使用者描述的恐懼/焦慮情境，規劃一個 5 階「微型暴露階梯」（Micro-Exposure Ladder），從最輕微、最容易做到的挑戰，逐步升級到目標情境。
請只回傳合法 JSON 陣列（不要加前後文字或 markdown code fence），格式為：
[{"step":1,"title":"簡短標題","description":"具體可執行的描述，含建議花費時間"}, ...] 共 5 個項目，使用繁體中文。`,
    fear,
    1200,
  );
  try {
    const cleaned = raw.trim().replace(/^```json\s*|```$/g, "");
    return JSON.parse(cleaned);
  } catch {
    return [{ step: 1, title: "AI 回應解析失敗", description: raw }];
  }
}

export async function generateGroundingScript(
  apiKey: string,
  model: string,
  context: string,
): Promise<string> {
  return askClaude(
    apiKey,
    model,
    `你是一位沉穩的心理學家，要為使用者現在的焦慮情境生成一段「情緒沉降引導詞」，用於立即朗讀給自己聽以平復情緒。
規則：
1. 針對使用者描述的具體情境（例如簡報、衝突、考試）客製化意象與語句。
2. 節奏放慢，多用感官語言（呼吸、身體感受、畫面），語氣溫柔但有力。
3. 結構：先引導呼吸放慢 -> 具體針對情境的心智意象 -> 一句可以帶著走的肯定句。
4. 使用繁體中文，總長度 150-250 字，分段落，不要條列，像是可以直接唸出來的引導詞。`,
    context,
    900,
  );
}

export async function generateWeeklyReport(
  apiKey: string,
  model: string,
  summaryOfLogs: string,
): Promise<string> {
  return askClaude(
    apiKey,
    model,
    `你是使用者的「心理肌肉週報」分析教練。以下是使用者過去一週在 App 中的訓練紀錄摘要（JSON 或條列文字）。
請產出一份「MMI 心理肌肉週報」，繁體中文，使用 Markdown 標題與條列，包含：
## 本週總覽（1-2句總結趨勢）
## 4C 分析
針對 Challenge（挑戰）、Commitment（承諾）、Control（控制）、Confidence（信心）四個面向，各給 1-2 句根據紀錄的觀察與簡短評分描述（不要編造數字分數，用「提升/持平/待加強」等描述性字詞）。
## 尚未察覺的思維盲點
列出 1-3 點根據紀錄推測的、使用者可能沒意識到的思維模式或迴避行為。
## 下週建議行動
列出 2-3 個具體、可執行的下週練習建議。
語氣鼓勵、不批判，總長度 350-500 字。`,
    summaryOfLogs,
    1800,
  );
}
