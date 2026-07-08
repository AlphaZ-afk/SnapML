"use client"

import { Brain, Sparkles } from "lucide-react"
import { MarkdownRenderer } from "../markdown-renderer"

interface InsightsMessageProps {
  content: string
  isStreaming?: boolean
}

export function InsightsMessage({ content, isStreaming }: InsightsMessageProps) {
  return (
    <div className="bg-gradient-to-br from-violet-500/5 to-emerald-500/5 border border-violet-500/10 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center gap-2 mb-3">
        <div className="relative p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20">
          <Brain className="w-4 h-4 text-violet-400" />
        </div>
        <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">AI Insights</h3>
        <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse ml-auto" />
      </div>

      <MarkdownRenderer content={content} isStreaming={isStreaming} />
    </div>
  )
}
