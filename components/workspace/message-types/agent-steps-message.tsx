"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CheckCircle2, Loader2, Circle, Database, Brain, BarChart3, Rocket, Wrench, Shield, FileText } from "lucide-react"

type StepStatus = "pending" | "running" | "completed" | "error"

type AgentType = "orchestrator" | "data_engineer" | "feature_engineer" | "ml_trainer" | "evaluator" | "deployment" | "report"

interface Step {
  id: string
  label: string
  status: StepStatus
  detail?: string
  duration?: string
}

interface AgentStepsMessageProps {
  metadata: {
    title: string
    agent?: AgentType
    steps: Step[]
    collapsed?: boolean
  }
}

const AGENT_CONFIG: Record<AgentType, { label: string; icon: any; color: string; bgColor: string; borderColor: string }> = {
  orchestrator: { label: "Orchestrator", icon: Brain, color: "text-violet-400", bgColor: "bg-violet-500/10", borderColor: "border-violet-500/20" },
  data_engineer: { label: "Data Engineer", icon: Database, color: "text-sky-400", bgColor: "bg-sky-500/10", borderColor: "border-sky-500/20" },
  feature_engineer: { label: "Feature Engineer", icon: Wrench, color: "text-amber-400", bgColor: "bg-amber-500/10", borderColor: "border-amber-500/20" },
  ml_trainer: { label: "ML Trainer", icon: Brain, color: "text-fuchsia-400", bgColor: "bg-fuchsia-500/10", borderColor: "border-fuchsia-500/20" },
  evaluator: { label: "Evaluator", icon: BarChart3, color: "text-emerald-400", bgColor: "bg-emerald-500/10", borderColor: "border-emerald-500/20" },
  deployment: { label: "Deployment Agent", icon: Rocket, color: "text-orange-400", bgColor: "bg-orange-500/10", borderColor: "border-orange-500/20" },
  report: { label: "Report Agent", icon: FileText, color: "text-cyan-400", bgColor: "bg-cyan-500/10", borderColor: "border-cyan-500/20" },
}

const statusIcon = (status: StepStatus) => {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
    case "running":
      return <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />
    case "error":
      return <Circle className="w-3.5 h-3.5 text-rose-400" />
    default:
      return <Circle className="w-3.5 h-3.5 text-white/15" />
  }
}

export function AgentStepsMessage({ metadata }: AgentStepsMessageProps) {
  const { title, steps, agent } = metadata
  const [expanded, setExpanded] = useState(true)

  const completedCount = steps.filter(s => s.status === "completed").length
  const allDone = completedCount === steps.length && steps.length > 0
  const isRunning = steps.some(s => s.status === "running")

  const agentConfig = agent ? AGENT_CONFIG[agent] : null
  const AgentIcon = agentConfig?.icon || Brain

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-white/[0.02] transition-colors"
      >
        {/* Agent badge */}
        {agentConfig && (
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${agentConfig.bgColor} border ${agentConfig.borderColor}`}>
            <AgentIcon className={`w-3 h-3 ${agentConfig.color}`} />
            <span className={`text-[10px] font-semibold ${agentConfig.color}`}>{agentConfig.label}</span>
          </div>
        )}

        {/* Status icon */}
        {allDone ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
        ) : isRunning ? (
          <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin flex-shrink-0" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
        )}

        <span className="text-xs font-medium text-white/70 flex-1">{title}</span>
        <span className="text-[10px] text-white/30 font-mono mr-2">
          {completedCount}/{steps.length}
        </span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-white/25" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-white/25" />
        )}
      </button>

      {/* Steps — collapsible */}
      {expanded && (
        <div className="border-t border-white/[0.04] px-4 py-2 space-y-1">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center gap-2.5 py-1.5 transition-all duration-300 ${
                step.status === "running" ? "opacity-100" : step.status === "completed" ? "opacity-60" : "opacity-30"
              }`}
            >
              {statusIcon(step.status)}
              <span className={`text-xs flex-1 ${step.status === "running" ? "text-white/80" : "text-white/50"}`}>
                {step.label}
              </span>
              {step.duration && (
                <span className="text-[10px] text-white/25 font-mono">{step.duration}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
