"use client";

import { useState } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export function CodeBlock({ code, language = "bash", title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl overflow-hidden border border-border bg-code-bg max-w-full">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
          <span className="text-sm text-muted font-mono truncate">{title}</span>
          <button
            onClick={handleCopy}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors ml-2"
          >
            {copied ? (
              <>
                <Check size={14} className="text-secondary" />
                <span className="text-secondary">Copied</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
      {!title && (
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-2 rounded-lg bg-card/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-foreground z-10"
        >
          {copied ? <Check size={16} className="text-secondary" /> : <Copy size={16} />}
        </button>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1rem",
            background: "transparent",
            fontSize: "0.75rem",
            lineHeight: "1.5",
            minWidth: "100%",
          }}
          codeTagProps={{
            style: {
              fontFamily: "var(--font-geist-mono), monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-all",
            },
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
