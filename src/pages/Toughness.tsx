import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, PrimaryButton, SectionTitle } from "../components/Card";
import { TheoryNote } from "../components/TheoryNote";
import { uid, useToughnessEntries } from "../lib/storage";
import {
  LIKERT_LABELS,
  TOUGHNESS_DIMENSIONS,
  TOUGHNESS_DIMENSION_META,
  TOUGHNESS_ITEMS,
  scoreToughness,
  toughnessLevel,
} from "../lib/toughness";

export default function Toughness() {
  const navigate = useNavigate();
  const { add } = useToughnessEntries();
  const [answers, setAnswers] = useState<(number | null)[]>(
    TOUGHNESS_ITEMS.map(() => null),
  );
  const [submitted, setSubmitted] = useState(false);

  const answered = answers.filter((a) => a !== null).length;
  const allAnswered = answered === TOUGHNESS_ITEMS.length;

  function setAnswer(index: number, value: number) {
    setAnswers((prev) => prev.map((a, i) => (i === index ? value : a)));
  }

  function handleSubmit() {
    if (!allAnswered) return;
    const finalAnswers = answers as number[];
    const scores = scoreToughness(finalAnswers);
    add({ id: uid(), timestamp: Date.now(), answers: finalAnswers, scores });
    setSubmitted(true);
  }

  if (submitted) {
    const finalAnswers = answers as number[];
    const scores = scoreToughness(finalAnswers);
    return (
      <div className="space-y-5">
        <header>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">
            🧭 心理韌性測驗結果
          </h1>
        </header>
        <Card className="space-y-4">
          {TOUGHNESS_DIMENSIONS.map((dim) => {
            const meta = TOUGHNESS_DIMENSION_META[dim];
            const level = toughnessLevel(scores[dim]);
            return (
              <div key={dim}>
                <div className="flex items-center gap-2 text-sm mb-1.5">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full bg-gradient-to-br ${meta.color} flex items-center justify-center text-sm`}
                  >
                    {meta.icon}
                  </span>
                  <span className="flex-1 font-medium text-slate-700 dark:text-slate-200">
                    {meta.name}
                  </span>
                  <span className={`text-xs font-semibold ${level.color}`}>{level.label}</span>
                  <span className="font-semibold text-slate-900 dark:text-white tabular-nums">
                    {scores[dim].toFixed(1)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full bg-gradient-to-r ${meta.color}`}
                    style={{ width: `${(scores[dim] / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{meta.short}</p>
              </div>
            );
          })}
        </Card>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
          分數僅供自我覺察參考，不是醫療診斷。建議每 1-2 週重測一次，觀察趨勢變化。
        </p>
        <PrimaryButton onClick={() => navigate("/report")} className="w-full">
          查看紀錄趨勢
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">🧭 心理韌性測驗</h1>
      </header>
      <TheoryNote framework="4Cs 心理韌性模型">
        改編自 Clough、Earle 與 Sewell 提出的「4Cs 心理韌性模型」（Challenge, Commitment,
        Control, Confidence），廣泛應用於運動與組織心理學中評估一個人面對壓力與逆境的韌性。以下
        12 題（每個面向 3
        題）能幫你快速掌握目前在四個面向上的自我覺察，用來追蹤自己隨時間的變化趨勢。
      </TheoryNote>
      <Card className="space-y-6">
        <SectionTitle
          title={`第 ${answered}/${TOUGHNESS_ITEMS.length} 題`}
          subtitle="依照直覺回答，沒有標準答案"
        />
        {TOUGHNESS_ITEMS.map((item, i) => (
          <div key={i} className="space-y-2">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
              {i + 1}. {item.text}
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {LIKERT_LABELS.map((label, v) => {
                const value = v + 1;
                const active = answers[i] === value;
                return (
                  <button
                    key={value}
                    onClick={() => setAnswer(i, value)}
                    title={label}
                    className={`py-2 rounded-lg text-xs font-medium border transition-colors ${
                      active
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{LIKERT_LABELS[0]}</span>
              <span>{LIKERT_LABELS[4]}</span>
            </div>
          </div>
        ))}
        <PrimaryButton onClick={handleSubmit} disabled={!allAnswered} className="w-full">
          查看結果
        </PrimaryButton>
      </Card>
    </div>
  );
}
