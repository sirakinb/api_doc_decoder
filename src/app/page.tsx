"use client";

import { useState, useEffect } from "react";
import {
  Link,
  Loader2,
  BookOpen,
  Zap,
  MessageCircle,
  Key,
  Shield,
  Clock,
  Terminal,
  ChevronRight,
  FileText,
  Globe,
  Settings,
} from "lucide-react";
import { CodeBlock } from "@/components/CodeBlock";
import { UseCaseCard } from "@/components/UseCaseCard";
import { EndpointCard } from "@/components/EndpointCard";
import { ChatInterface } from "@/components/ChatInterface";
import { ApiKeyModal } from "@/components/ApiKeyModal";

interface Analysis {
  apiName: string;
  description: string;
  gettingStarted: {
    steps: Array<{
      title: string;
      description: string;
      code?: string;
    }>;
  };
  authentication: {
    method: string;
    description: string;
    example: string;
  };
  commonUseCases: Array<{
    title: string;
    description: string;
    endpoints?: string[];
    codeExample?: string;
    tips?: string[];
  }>;
  keyEndpoints: Array<{
    method: string;
    path: string;
    description: string;
    parameters?: string[];
    example?: string;
  }>;
  rateLimits?: {
    description: string;
    limits?: string[];
  };
  quickTips?: string[];
}

export default function Home() {
  const [inputMode, setInputMode] = useState<"url" | "text">("url");
  const [url, setUrl] = useState("");
  const [docsText, setDocsText] = useState("");
  const [userContext, setUserContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [docsContent, setDocsContent] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "usecases" | "endpoints" | "chat">("overview");
  const [error, setError] = useState("");
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeys, setApiKeys] = useState({ openaiKey: "", firecrawlKey: "" });
  const [hasKeys, setHasKeys] = useState(false);

  // Load API keys from localStorage on mount
  useEffect(() => {
    const openaiKey = localStorage.getItem("openai_api_key") || "";
    const firecrawlKey = localStorage.getItem("firecrawl_api_key") || "";
    setApiKeys({ openaiKey, firecrawlKey });
    setHasKeys(!!openaiKey);
  }, []);

  const handleAnalyze = async () => {
    const hasInput = inputMode === "url" ? url.trim() : docsText.trim();
    if (!hasInput) return;

    // Check for API key
    if (!apiKeys.openaiKey) {
      setShowApiKeyModal(true);
      return;
    }

    setIsLoading(true);
    setError("");
    setAnalysis(null);

    try {
      // Crawl or use direct text
      const crawlResponse = await fetch("/api/crawl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          inputMode === "url" 
            ? { url, firecrawlKey: apiKeys.firecrawlKey } 
            : { text: docsText }
        ),
      });

      const crawlData = await crawlResponse.json();

      if (!crawlResponse.ok) {
        throw new Error(crawlData.error || "Failed to fetch documentation");
      }

      setDocsContent(crawlData.content);

      // Analyze the docs
      const apiName = inputMode === "url" 
        ? new URL(url).hostname 
        : "API Documentation";

      const analyzeResponse = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          docsContent: crawlData.content,
          userContext,
          apiName,
          openaiKey: apiKeys.openaiKey,
        }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeResponse.ok) {
        throw new Error(analyzeData.error || "Failed to analyze documentation");
      }

      setAnalysis(analyzeData.analysis);
    } catch (err: any) {
      console.error("Error:", err);
      setError(err.message || "Failed to analyze the documentation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen">
      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSave={(keys) => {
          setApiKeys(keys);
          setHasKeys(!!keys.openaiKey);
        }}
      />

      {/* Settings Button - Fixed */}
      <button
        onClick={() => setShowApiKeyModal(true)}
        className={`fixed top-4 right-4 z-40 p-3 rounded-xl border transition-all ${
          hasKeys 
            ? "bg-card border-border hover:border-primary text-muted hover:text-foreground" 
            : "bg-primary/10 border-primary text-primary animate-pulse"
        }`}
        title={hasKeys ? "API Settings" : "Add your API keys to get started"}
      >
        <Settings size={20} />
      </button>

      {/* Background gradient */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border mb-8 animate-fade-in">
            <Zap size={16} className="text-accent" />
            <span className="text-sm text-muted">AI-Powered API Documentation Analysis</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Decode Any API</span>
            <br />
            <span className="text-foreground">in Minutes</span>
          </h1>

          <p className="text-xl text-muted mb-12 max-w-2xl mx-auto animate-fade-in">
            Feed in any API documentation and get clear use cases, working code snippets, and expert guidance tailored to your needs.
          </p>

          {/* Input Section */}
          <div className="space-y-4 animate-fade-in">
            <div className="gradient-border glow">
              <div className="p-6 space-y-4">
                {/* Input Mode Toggle */}
                <div className="flex gap-2 justify-center mb-4">
                  <button
                    onClick={() => setInputMode("url")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      inputMode === "url"
                        ? "bg-primary text-white"
                        : "bg-card-hover border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <Globe size={16} />
                    URL
                  </button>
                  <button
                    onClick={() => setInputMode("text")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                      inputMode === "text"
                        ? "bg-primary text-white"
                        : "bg-card-hover border border-border text-muted hover:text-foreground"
                    }`}
                  >
                    <FileText size={16} />
                    Paste Text
                  </button>
                </div>

                {inputMode === "url" ? (
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Link size={20} className="text-primary" />
                    </div>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="Paste API documentation URL..."
                      className="flex-1 bg-transparent border-none outline-none text-lg text-foreground placeholder:text-muted"
                    />
                  </div>
                ) : (
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-1">
                      <FileText size={20} className="text-primary" />
                    </div>
                    <textarea
                      value={docsText}
                      onChange={(e) => setDocsText(e.target.value)}
                      placeholder="Paste API documentation text here..."
                      rows={6}
                      className="flex-1 bg-transparent border border-border rounded-lg p-3 outline-none text-foreground placeholder:text-muted resize-none focus:border-primary transition-colors"
                    />
                  </div>
                )}

                <div className="border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <MessageCircle size={20} className="text-secondary" />
                    </div>
                    <textarea
                      value={userContext}
                      onChange={(e) => setUserContext(e.target.value)}
                      placeholder="What do you want to accomplish with this API? (optional - helps tailor the analysis)"
                      rows={2}
                      className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isLoading || (inputMode === "url" ? !url.trim() : !docsText.trim())}
                  className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-white flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Analyzing documentation...
                    </>
                  ) : (
                    <>
                      <BookOpen size={20} />
                      Analyze Documentation
                    </>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
                {error.includes("Firecrawl") && (
                  <p className="mt-2 text-red-300">
                    Tip: Try switching to "Paste Text" mode and copy the documentation content directly.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Analysis Results */}
      {analysis && (
        <section className="pb-20 px-6">
          <div className="max-w-6xl mx-auto">
            {/* API Header */}
            <div className="text-center mb-12 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {analysis.apiName}
              </h2>
              <p className="text-lg text-muted max-w-2xl mx-auto">
                {analysis.description}
              </p>
            </div>

            {/* Navigation Tabs */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              {[
                { id: "overview", label: "Overview", icon: BookOpen },
                { id: "usecases", label: "Use Cases", icon: Zap },
                { id: "endpoints", label: "Endpoints", icon: Terminal },
                { id: "chat", label: "Ask Questions", icon: MessageCircle },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                    activeTab === id
                      ? "bg-primary text-white"
                      : "bg-card border border-border text-muted hover:text-foreground hover:border-border-bright"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === "overview" && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Getting Started */}
                  <div className="gradient-border overflow-hidden">
                    <div className="p-6 overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                          <Zap size={20} className="text-secondary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Getting Started</h3>
                      </div>
                      <div className="space-y-4">
                        {analysis.gettingStarted.steps.map((step, index) => (
                          <div key={index} className="flex gap-4 overflow-hidden">
                            <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary text-sm font-semibold">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0 overflow-hidden">
                              <h4 className="font-medium text-foreground mb-1">{step.title}</h4>
                              <p className="text-sm text-muted mb-2">{step.description}</p>
                              {step.code && (
                                <div className="overflow-hidden">
                                  <CodeBlock code={step.code} language="bash" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Authentication */}
                  <div className="gradient-border overflow-hidden">
                    <div className="p-6 overflow-hidden">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Key size={20} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground">Authentication</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Shield size={16} className="text-accent" />
                          <span className="text-sm font-medium text-foreground">{analysis.authentication.method}</span>
                        </div>
                        <p className="text-sm text-muted">{analysis.authentication.description}</p>
                        {analysis.authentication.example && (
                          <CodeBlock code={analysis.authentication.example} language="bash" title="Authentication Example" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rate Limits */}
                  {analysis.rateLimits && (
                    <div className="gradient-border md:col-span-2">
                      <div className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                            <Clock size={20} className="text-accent" />
                          </div>
                          <h3 className="text-xl font-semibold text-foreground">Rate Limits</h3>
                        </div>
                        <p className="text-muted mb-4">{analysis.rateLimits.description}</p>
                        {analysis.rateLimits.limits && (
                          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
                            {analysis.rateLimits.limits.map((limit, index) => (
                              <div key={index} className="px-4 py-3 rounded-xl bg-card-hover border border-border text-sm text-foreground">
                                {limit}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quick Tips */}
                  {analysis.quickTips && analysis.quickTips.length > 0 && (
                    <div className="gradient-border md:col-span-2">
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-foreground mb-4">Quick Tips</h3>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {analysis.quickTips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <ChevronRight size={16} className="flex-shrink-0 mt-0.5 text-secondary" />
                              <span className="text-muted">{tip}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "usecases" && (
                <div className="space-y-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-foreground mb-2">Common Use Cases</h3>
                    <p className="text-muted">Practical examples to get you building quickly</p>
                  </div>
                  {analysis.commonUseCases.map((useCase, index) => (
                    <UseCaseCard key={index} useCase={useCase} index={index} />
                  ))}
                </div>
              )}

              {activeTab === "endpoints" && (
                <div className="space-y-4">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-foreground mb-2">Key Endpoints</h3>
                    <p className="text-muted">The most important API endpoints you need to know</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {analysis.keyEndpoints.map((endpoint, index) => (
                      <EndpointCard key={index} endpoint={endpoint} index={index} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "chat" && (
                <div>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-semibold text-foreground mb-2">Ask Questions</h3>
                    <p className="text-muted">Get answers about anything in the documentation</p>
                  </div>
                  <div className="max-w-3xl mx-auto">
                    <ChatInterface docsContent={docsContent} apiName={analysis.apiName} openaiKey={apiKeys.openaiKey} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Loading State */}
      {isLoading && (
        <section className="pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 rounded-2xl shimmer" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section (when no analysis) */}
      {!analysis && !isLoading && (
        <section className="pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              {[
                {
                  icon: BookOpen,
                  title: "Smart Analysis",
                  description: "Automatically extracts key endpoints, authentication methods, and common patterns from any API docs",
                  color: "primary",
                },
                {
                  icon: Zap,
                  title: "Use Cases",
                  description: "Identifies the most common use cases with ready-to-use code examples tailored to your needs",
                  color: "secondary",
                },
                {
                  icon: MessageCircle,
                  title: "Ask Anything",
                  description: "Chat with an AI that understands the entire documentation and can answer specific questions",
                  color: "accent",
                },
              ].map(({ icon: Icon, title, description, color }) => (
                <div
                  key={title}
                  className="p-6 rounded-2xl bg-card border border-border hover:border-border-bright transition-colors animate-fade-in"
                >
                  <div
                    className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                      color === "primary"
                        ? "bg-primary/10 text-primary"
                        : color === "secondary"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-muted text-sm">{description}</p>
                </div>
              ))}
            </div>
        </div>
        </section>
      )}
      </main>
  );
}
