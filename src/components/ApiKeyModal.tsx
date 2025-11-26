"use client";

import { useState, useEffect } from "react";
import { X, Key, Eye, EyeOff, ExternalLink, Check } from "lucide-react";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: { openaiKey: string; firecrawlKey: string }) => void;
}

export function ApiKeyModal({ isOpen, onClose, onSave }: ApiKeyModalProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [firecrawlKey, setFirecrawlKey] = useState("");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showFirecrawl, setShowFirecrawl] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const storedOpenai = localStorage.getItem("openai_api_key") || "";
      const storedFirecrawl = localStorage.getItem("firecrawl_api_key") || "";
      setOpenaiKey(storedOpenai);
      setFirecrawlKey(storedFirecrawl);
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem("openai_api_key", openaiKey);
    localStorage.setItem("firecrawl_api_key", firecrawlKey);
    onSave({ openaiKey, firecrawlKey });
    setSaved(true);
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-card-hover text-muted hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Key size={24} className="text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">API Keys</h2>
            <p className="text-sm text-muted">Your keys are stored locally in your browser</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* OpenAI Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                OpenAI API Key <span className="text-red-400">*</span>
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get key <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showOpenai ? "text" : "password"}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-proj-..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted focus:border-primary outline-none transition-colors font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowOpenai(!showOpenai)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showOpenai ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted mt-1.5">Required for AI analysis</p>
          </div>

          {/* Firecrawl Key */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Firecrawl API Key <span className="text-muted">(optional)</span>
              </label>
              <a
                href="https://firecrawl.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get key <ExternalLink size={12} />
              </a>
            </div>
            <div className="relative">
              <input
                type={showFirecrawl ? "text" : "password"}
                value={firecrawlKey}
                onChange={(e) => setFirecrawlKey(e.target.value)}
                placeholder="fc-..."
                className="w-full bg-background border border-border rounded-xl px-4 py-3 pr-12 text-foreground placeholder:text-muted focus:border-primary outline-none transition-colors font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowFirecrawl(!showFirecrawl)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              >
                {showFirecrawl ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <p className="text-xs text-muted mt-1.5">For fetching docs from URLs. Without it, use "Paste Text" mode.</p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={!openaiKey.trim()}
            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-white flex items-center justify-center gap-2"
          >
            {saved ? (
              <>
                <Check size={20} />
                Saved!
              </>
            ) : (
              "Save API Keys"
            )}
          </button>
          <p className="text-xs text-center text-muted mt-3">
            🔒 Keys are stored only in your browser and never sent to our servers
          </p>
        </div>
      </div>
    </div>
  );
}

