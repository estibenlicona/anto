import { useState } from "react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import tsx from "react-syntax-highlighter/dist/esm/languages/prism/tsx";
import css from "react-syntax-highlighter/dist/esm/languages/prism/css";
import json from "react-syntax-highlighter/dist/esm/languages/prism/json";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

SyntaxHighlighter.registerLanguage("tsx", tsx);
SyntaxHighlighter.registerLanguage("css", css);
SyntaxHighlighter.registerLanguage("json", json);

const DOT_COLORS = ["#ff5f56", "#ffbd2e", "#27c93f"];

function languageFromFilename(filename: string): string {
  if (filename.endsWith(".tsx") || filename.endsWith(".ts")) return "tsx";
  if (filename.endsWith(".css")) return "css";
  if (filename.endsWith(".json")) return "json";
  return "tsx";
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="overflow-hidden rounded-surface border border-neutral-default shadow-md">
      {/* Editor-style title bar, mirroring a VS Code tab strip. Uses the same
          elevation surface token the rest of the site uses for raised
          containers, read through its CSS variable. */}
      <div
        className="flex items-center justify-between border-b border-neutral-default px-3 py-2"
        style={{ background: "var(--elevation-surface-raised-background)" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {DOT_COLORS.map((dotColor) => (
              <span
                key={dotColor}
                className="h-2.5 w-2.5 rounded-pill"
                style={{ backgroundColor: dotColor }}
              />
            ))}
          </div>
          <span className="font-mono text-body-sm text-neutral-subtle">{label ?? "código"}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-control px-2 py-1 text-body-sm font-medium text-neutral-subtle hover:bg-neutral-subtle-hover hover:text-neutral-default"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <SyntaxHighlighter
        language={languageFromFilename(label ?? "")}
        style={vs}
        showLineNumbers
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: "0.75rem",
          padding: "1rem",
          background: "var(--color-bg-neutral-default)",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
