"use client";

import { useState, useEffect } from "react";
import { Brain, Sparkles } from "lucide-react";
import { MarkdownRenderer } from "../markdown-renderer";

interface AnalysisMessageProps {
  content: string;
  isStreaming?: boolean;
}

export function AnalysisMessage({
  content,
  isStreaming = false,
}: AnalysisMessageProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(timer);
  }, []);

  return (
    <div
      className={`
        bg-gradient-to-br from-violet-500/5 to-emerald-500/5 
        border border-violet-500/10 rounded-2xl p-5 
        backdrop-blur-md
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
      `}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <div className="relative p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Brain className="w-4 h-4 text-violet-400" />
          {isStreaming && (
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
          )}
        </div>

        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">
          Dataset Analysis
        </h3>

        {isStreaming && (
          <div className="ml-auto flex items-center gap-1.5">
            <div className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <MarkdownRenderer content={content} isStreaming={isStreaming} />
    </div>
  );
}

export default AnalysisMessage;
