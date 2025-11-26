"use client";

import { CodeBlock } from "./CodeBlock";

interface Endpoint {
  method: string;
  path: string;
  description: string;
  parameters?: string[];
  example?: string;
}

interface EndpointCardProps {
  endpoint: Endpoint;
  index: number;
}

const methodColors: Record<string, string> = {
  GET: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  POST: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  PUT: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  PATCH: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
};

export function EndpointCard({ endpoint, index }: EndpointCardProps) {
  const methodColor = methodColors[endpoint.method.toUpperCase()] || methodColors.GET;

  return (
    <div
      className="border border-border rounded-xl overflow-hidden bg-card animate-fade-in"
      style={{ animationDelay: `${index * 50}ms`, opacity: 0 }}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase border ${methodColor}`}
          >
            {endpoint.method}
          </span>
          <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
        </div>

        <p className="text-sm text-muted">{endpoint.description}</p>

        {endpoint.parameters && endpoint.parameters.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {endpoint.parameters.map((param, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs font-mono bg-card-hover text-muted border border-border"
              >
                {param}
              </span>
            ))}
          </div>
        )}
      </div>

      {endpoint.example && (
        <div className="border-t border-border">
          <CodeBlock code={endpoint.example} language="bash" />
        </div>
      )}
    </div>
  );
}

