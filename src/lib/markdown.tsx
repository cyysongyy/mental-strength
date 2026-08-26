import type { ReactNode } from "react";

function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

export function renderLiteMarkdown(md: string): ReactNode {
  const lines = md.split("\n");
  const blocks: ReactNode[] = [];
  let listBuffer: string[] = [];

  function flushList() {
    if (listBuffer.length) {
      blocks.push(
        <ul key={blocks.length} className="list-disc pl-5 space-y-1 my-2">
          {listBuffer.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      listBuffer = [];
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushList();
      blocks.push(
        <h3 key={blocks.length} className="font-semibold text-slate-900 dark:text-white mt-4 mb-1">
          {line.slice(3)}
        </h3>,
      );
    } else if (line.startsWith("# ")) {
      flushList();
      blocks.push(
        <h2 key={blocks.length} className="font-bold text-lg text-slate-900 dark:text-white mt-4 mb-1">
          {line.slice(2)}
        </h2>,
      );
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      listBuffer.push(line.slice(2));
    } else {
      flushList();
      blocks.push(
        <p key={blocks.length} className="leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    }
  }
  flushList();
  return <div className="space-y-1 text-sm text-slate-700 dark:text-slate-200">{blocks}</div>;
}
