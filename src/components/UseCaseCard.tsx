"use client";

import { useState } from "react";
import { ChevronDown, Lightbulb, Terminal } from "lucide-react";
import { CodeBlock } from "./CodeBlock";

interface UseCase {
  title: string;
  description: string;
  endpoints?: string[];
  codeExample?: string;
  tips?: string[];
}

interface UseCaseCardProps {
  useCase: UseCase;
  index: number;
}

export function UseCaseCard({ useCase, index }: UseCaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  return (
    <div
      className="border border-border rounded-2xl overflow-hidden bg-card hover:border-border-bright transition-colors animate-fade-in"
      style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-card-hover transition-colors"
      >
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {index + 1}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{useCase.title}</h3>
            <p className="text-muted text-sm mt-1">{useCase.description}</p>
          </div>
        </div>
        <ChevronDown
          className={`flex-shrink-0 w-5 h-5 text-muted transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {isExpanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-border pt-4">
          {useCase.endpoints && useCase.endpoints.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {useCase.endpoints.map((endpoint, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-primary/10 text-primary border border-primary/20"
                >
                  <Terminal size={12} />
                  {endpoint}
                </span>
              ))}
            </div>
          )}

          {useCase.codeExample && (
            <CodeBlock
              code={useCase.codeExample}
              language="bash"
              title="Example"
            />
          )}

          {useCase.tips && useCase.tips.length > 0 && (
            <div className="space-y-2">
              {useCase.tips.map((tip, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 text-sm text-muted"
                >
                  <Lightbulb size={16} className="flex-shrink-0 mt-0.5 text-accent" />
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

