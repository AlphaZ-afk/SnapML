"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Send,
  Paperclip,
  Brain,
  User,
  Sparkles,
  Loader2,
  Upload,
  ArrowRight,
  Mic,
  MicOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UploadMessage } from "./message-types/upload-message"
import { AnalysisMessage } from "./message-types/analysis-message"
import { PlanMessage } from "./message-types/plan-message"
import { TrainingMessage } from "./message-types/training-message"
import { ComparisonMessage } from "./message-types/comparison-message"
import { InsightsMessage } from "./message-types/insights-message"
import { ImprovementMessage } from "./message-types/improvement-message"
import { DeploymentMessage } from "./message-types/deployment-message"
import { ExportMessage } from "./message-types/export-message"
import { PlaygroundMessage } from "./message-types/playground-message"
import { TargetSelectionMessage } from "./message-types/target-selection-message"
import { AgentStepsMessage } from "./message-types/agent-steps-message"
import { SuccessAnimation } from "./message-types/success-animation"
import { ReportMessage } from "./message-types/report-message"
import { MarkdownRenderer } from "./markdown-renderer"

export type ChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  type:
    | "text"
    | "upload"
    | "target_selection"
    | "analysis"
    | "plan"
    | "training"
    | "comparison"
    | "evaluation"
    | "insights"
    | "improvement"
    | "deployment"
    | "export"
    | "playground"
    | "agent_steps"
    | "success"
    | "report"
  timestamp: Date
  isStreaming?: boolean
  metadata?: any
}

function renderMessageContent(msg: ChatMessage, onTargetSelect?: (target: string, info: any) => void) {
  if (msg.role === "user") {
    return (
      <div className="bg-white/[0.08] border border-white/[0.08] rounded-2xl rounded-br-sm px-4 py-3">
        <p className="text-sm text-white/85 leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </p>
      </div>
    )
  }

  switch (msg.type) {
    case "upload":
      return <UploadMessage metadata={msg.metadata} />
    case "target_selection":
      return (
        <TargetSelectionMessage 
          metadata={msg.metadata} 
          onSelect={(target) => {
            if (onTargetSelect) onTargetSelect(target, msg.metadata.info)
          }} 
        />
      )
    case "agent_steps":
      return <AgentStepsMessage metadata={msg.metadata} />
    case "analysis":
      return <AnalysisMessage content={msg.content} isStreaming={msg.isStreaming} />
    case "plan":
      return (
        <PlanMessage 
          metadata={msg.metadata} 
          onApprove={() => {}} 
        />
      )
    case "training":
      return <TrainingMessage metadata={msg.metadata} />
    case "comparison":
      return <ComparisonMessage metadata={msg.metadata} champion={msg.metadata?.champion} />
    case "insights":
      return <InsightsMessage content={msg.content} isStreaming={msg.isStreaming} />
    case "improvement":
      return <ImprovementMessage metadata={msg.metadata} champion={msg.metadata?.champion} />
    case "deployment":
      return <DeploymentMessage metadata={msg.metadata} />
    case "export":
      return <ExportMessage metadata={msg.metadata} />
    case "playground":
      return <PlaygroundMessage metadata={msg.metadata} />
    case "success":
      return <SuccessAnimation metadata={msg.metadata} />
    case "report":
      return <ReportMessage metadata={msg.metadata} />
    case "text":
    default:
      return (
        <div className="px-1 py-0.5">
          <MarkdownRenderer content={msg.content} isStreaming={msg.isStreaming} />
        </div>
      )
  }
}


interface ChatPanelProps {
  messages: ChatMessage[]
  onSendMessage: (text: string) => void
  onFileUpload: (file: File) => void
  onTargetSelect?: (target: string, info: any) => void
  isThinking: boolean
  thinkingLabel?: string
}

const suggestions = [
  {
    title: "Predict customer churn",
    description: "Build a classification model to identify at-risk customers",
    icon: "📊",
  },
  {
    title: "House price prediction",
    description: "Train a regression model on real estate features",
    icon: "🏠",
  },
  {
    title: "Fraud detection",
    description: "Detect anomalous transactions with ML pipelines",
    icon: "🔍",
  },
  {
    title: "Image classification",
    description: "Classify images using deep learning architectures",
    icon: "🖼️",
  },
]

export function ChatPanel({
  messages,
  onSendMessage,
  onFileUpload,
  onTargetSelect,
  isThinking,
  thinkingLabel,
}: ChatPanelProps) {
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  // Smart auto-scroll: only scroll if user is near the bottom
  const scrollToBottom = useCallback(() => {
    if (!isUserScrolledUp && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [isUserScrolledUp])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking, scrollToBottom])

  // Detect if user has scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current
    if (!container) return
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight
    setIsUserScrolledUp(distanceFromBottom > 100)
  }, [])

  useEffect(() => {
    // Initialize Web Speech API if supported
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = ""
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript
          }
          setInput(currentTranscript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error)
          setIsRecording(false)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      if (recognitionRef.current) {
        setInput("")
        recognitionRef.current.start()
        setIsRecording(true)
      } else {
        alert("Speech recognition is not supported in this browser.")
      }
    }
  }

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed) return
    onSendMessage(trimmed)
    setInput("")
    setIsUserScrolledUp(false) // Reset scroll lock on send
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onFileUpload(file)
      e.target.value = ""
    }
  }

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Check if this message should show an avatar (first in a group)
  const shouldShowAvatar = (index: number) => {
    if (index === 0) return true
    const prev = messages[index - 1]
    const curr = messages[index]
    return prev.role !== curr.role
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header Bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/[0.06] bg-card/30 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/20">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white/90 tracking-tight">
              SnapML AI Engineer
            </h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-[11px] text-white/40 font-mono">
                llama-3.3-70b
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span className="text-[11px] text-white/50">Pro</span>
        </div>
      </div>

      {/* ── Messages Area ───────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth"
      >
        {messages.length === 0 && !isThinking ? (
          /* ── Empty / Welcome State ──────────────────────────── */
          <div className="flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
            <div className="relative mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-white/[0.08]">
                <Brain className="w-8 h-8 text-violet-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                <Sparkles className="w-3 h-3 text-emerald-400" />
              </div>
            </div>

            {/* AI Memory — Personalized Greeting */}
            {(() => {
              try {
                const memory = JSON.parse(localStorage.getItem("snapml-memory") || "[]")
                if (memory.length > 0) {
                  const last = memory[0]
                  return (
                    <>
                      <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-1">
                        Welcome back! 👋
                      </h1>
                      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 mb-2">
                        <span className="text-[11px] text-violet-300">
                          Last project: <strong>{last.dataset}</strong> → {last.champion} ({last.primaryMetric}: {last.primaryValue})
                        </span>
                      </div>
                      <p className="text-sm text-white/40 mb-8 max-w-md text-center">
                        Upload a new dataset or tell me what you'd like to build next.
                      </p>
                    </>
                  )
                }
              } catch {}
              return (
                <>
                  <h1 className="text-2xl font-bold text-white/90 tracking-tight mb-1">
                    What would you like to build?
                  </h1>
                  <p className="text-sm text-white/40 mb-8 max-w-md text-center">
                    Upload a dataset and I'll build, train, evaluate, and deploy ML models — all from this conversation.
                  </p>
                </>
              )
            })()}

            {/* Suggestion Cards */}
            <div className="grid grid-cols-2 gap-3 w-full max-w-lg mb-8">
              {suggestions.map((s) => (
                <button
                  key={s.title}
                  onClick={() => onSendMessage(s.title)}
                  className="group bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 text-left
                             hover:bg-white/[0.06] hover:border-white/[0.12] cursor-pointer
                             transition-all duration-200"
                >
                  <span className="text-lg mb-2 block">{s.icon}</span>
                  <p className="text-sm font-medium text-white/80 group-hover:text-white/95 transition-colors">
                    {s.title}
                  </p>
                  <p className="text-xs text-white/35 mt-1 leading-relaxed">
                    {s.description}
                  </p>
                </button>
              ))}
            </div>

            {/* Upload Drop Area */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-3 px-6 py-3 rounded-xl border border-dashed border-white/[0.1]
                         bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.18]
                         transition-all duration-200 cursor-pointer group"
            >
              <Upload className="w-4 h-4 text-white/30 group-hover:text-violet-400 transition-colors" />
              <span className="text-sm text-white/40 group-hover:text-white/60 transition-colors">
                Or drop a dataset to get started
              </span>
            </button>
          </div>
        ) : (
          /* ── Message Stream ────────────────────────────────── */
          <div className="max-w-3xl mx-auto space-y-1">
            {messages.map((msg, index) => {
              const showAvatar = shouldShowAvatar(index)
              const isFirstInGroup = showAvatar
              const isUser = msg.role === "user"

              return (
                <div
                  key={msg.id}
                  className={`flex ${isUser ? "justify-end" : "justify-start"} ${
                    isFirstInGroup ? "mt-5" : "mt-0.5"
                  } animate-in fade-in duration-200`}
                >
                  {/* AI Avatar — only first in group */}
                  {!isUser && (
                    <div className="flex-shrink-0 mr-3 w-7">
                      {showAvatar ? (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/20 mt-1">
                          <Brain className="w-3.5 h-3.5 text-violet-400" />
                        </div>
                      ) : null}
                    </div>
                  )}

                  <div className={`flex-1 min-w-0 ${isUser ? "max-w-[70%]" : ""}`}>
                    {renderMessageContent(msg, onTargetSelect)}
                  </div>

                  {/* User Avatar — only first in group */}
                  {isUser && (
                    <div className="flex-shrink-0 ml-3 w-7">
                      {showAvatar ? (
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white/[0.06] border border-white/[0.08] mt-1">
                          <User className="w-3.5 h-3.5 text-white/50" />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              )
            })}

            {/* Thinking Indicator */}
            {isThinking && (
              <div className="flex justify-start mt-5 animate-in fade-in duration-200">
                <div className="flex-shrink-0 mr-3 w-7">
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-violet-500/15 border border-violet-500/20 mt-0.5">
                    <Brain className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
                  <span className="text-xs text-white/50">
                    {thinkingLabel || "Thinking"}
                    <span className="inline-flex w-4 overflow-hidden align-bottom">
                      <span className="animate-[ellipsis_1.4s_steps(4,end)_infinite]">
                        ...
                      </span>
                    </span>
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* ── Scroll-to-bottom indicator ─────────────────────────── */}
      {isUserScrolledUp && messages.length > 0 && (
        <div className="flex justify-center -mt-12 relative z-20 pointer-events-none">
          <button
            onClick={() => {
              setIsUserScrolledUp(false)
              messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
            }}
            className="pointer-events-auto px-3 py-1.5 rounded-full bg-violet-600/80 backdrop-blur-lg text-[11px] text-white font-medium
                       shadow-lg shadow-violet-600/20 hover:bg-violet-500/90 transition-all duration-200
                       animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            ↓ New messages
          </button>
        </div>
      )}

      {/* ── Input Bar ───────────────────────────────────────────── */}
      <div className="p-4 border-t border-white/[0.04] bg-card/20 backdrop-blur-xl">
        <div className="relative flex items-center max-w-3xl mx-auto">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask SnapML to build, train, or deploy..."
            className="bg-white/[0.04] border-white/[0.08] rounded-xl h-11 text-sm pl-4 pr-28
                       placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-violet-500/40
                       focus-visible:border-violet-500/25 transition-all duration-200"
          />

          {/* Action Buttons — positioned inside input */}
          <div className="absolute right-1.5 flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 rounded-lg transition-all duration-200 ${
                isRecording 
                  ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 hover:text-rose-300 animate-pulse" 
                  : "text-white/25 hover:text-white/50 hover:bg-white/[0.04]"
              }`}
              onClick={toggleRecording}
              title={isRecording ? "Stop recording" : "Voice input"}
            >
              {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/[0.04]"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="icon"
              className="h-7 w-7 rounded-lg bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/15
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.json"
          className="hidden"
          onChange={handleFileChange}
        />

        <p className="text-center text-[10px] text-white/15 mt-2">
          SnapML may make mistakes. Verify important results.
        </p>
      </div>
    </div>
  )
}
