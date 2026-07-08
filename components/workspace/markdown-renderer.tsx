"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

interface MarkdownRendererProps {
  content: string
  isStreaming?: boolean
}

export function MarkdownRenderer({ content, isStreaming }: MarkdownRendererProps) {
  if (!content && !isStreaming) return null

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-base font-bold text-white/95 mt-5 mb-2 tracking-tight">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-bold text-white/90 mt-4 mb-1.5 tracking-tight">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold text-white/85 mt-3 mb-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xs font-semibold text-white/80 mt-2.5 mb-1">{children}</h4>
          ),
          p: ({ children }) => (
            <p className="text-sm text-white/75 leading-relaxed mt-1.5 mb-1.5">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white/90">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-white/70">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mt-1.5 mb-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mt-1.5 mb-2 list-none">{children}</ol>
          ),
          li: ({ children, ...props }) => (
            <li className="flex items-start gap-2 text-sm text-white/75 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 mt-[7px] flex-shrink-0" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code className="px-1.5 py-0.5 rounded-md bg-white/[0.08] text-violet-300 text-xs font-mono">
                  {children}
                </code>
              )
            }
            return (
              <div className="mt-2 mb-2 rounded-lg overflow-hidden border border-white/[0.06]">
                <div className="flex items-center px-3 py-1.5 bg-white/[0.04] border-b border-white/[0.06]">
                  <span className="text-[10px] text-white/30 font-mono">
                    {className?.replace("language-", "") || "code"}
                  </span>
                </div>
                <pre className="p-3 bg-white/[0.02] overflow-x-auto">
                  <code className="text-xs font-mono text-emerald-300/80 leading-relaxed">
                    {children}
                  </code>
                </pre>
              </div>
            )
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-violet-400/40 pl-3 my-2 text-sm text-white/60 italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded-lg border border-white/[0.06]">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.04] border-b border-white/[0.06]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-semibold text-white/70">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-white/60 border-t border-white/[0.04]">{children}</td>
          ),
          hr: () => (
            <hr className="border-white/[0.06] my-3" />
          ),
          a: ({ children, href }) => (
            <a href={href} className="text-violet-400 hover:text-violet-300 underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
      {isStreaming && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-violet-400 rounded-[1px] animate-pulse align-middle" />
      )}
    </div>
  )
}
