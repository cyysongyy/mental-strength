# 心理肌肉鍛鍊 Mental Muscle Training

一款訓練心理素質（Mental Strength）的 Web App，定位為「心理肌肉鍛鍊」。所有資料只存在瀏覽器本機（localStorage），沒有後端伺服器。

## 兩大版本

- **簡化版 (Lite)**：無須 AI API，透過結構化範本、卡片互動與規則式演算法完成訓練，完全離線可用。
- **精緻版 (Pro)**：在「設定」頁輸入你自己的 [Anthropic API Key](https://console.anthropic.com/settings/keys)，即可解鎖 AI 蘇格拉底對話教練、AI 語意拆解、AI 階梯式暴露計畫、AI 情緒沉降引導與 AI 心理肌肉週報。API 呼叫直接從瀏覽器發出，Key 只存在本機，不會上傳到任何伺服器。

## 四大訓練模組

1. **認知重構** — 觸發事件 → 自動化消極思維 → 認知偏誤勾選 → 事實核查 → 替換想法卡片（Pro：AI 蘇格拉底對話）
2. **圈層控制** — 拖曳/點擊將煩心事分類到控制圈／影響圈／關注圈（Pro：AI 語意拆解可控/不可控要素）
3. **情緒耐受** — 3/5 分鐘帶著不適感專注的計時挑戰（Pro：AI 規劃微型暴露階梯任務）
4. **應急與能量** — 4-4-4-4 箱式呼吸動畫 + 引導詞（Pro：AI 動態生成專屬情緒沉降引導）

另有每日 3 分鐘心境快測（壓力值／掌控感）自動推薦當日訓練模組，以及訓練反饋週報（連續打卡、模組使用統計、成就徽章；Pro 版產出 AI 心理肌肉週報）。

## 開發

```bash
npm install
npm run dev      # 本機開發伺服器
npm run build    # 型別檢查 + 打包
npm run lint      # oxlint
```

技術棧：React + TypeScript + Vite + React Router + Tailwind CSS v4 + `@anthropic-ai/sdk`（BYOK，瀏覽器端直接呼叫）。
