"use client"

import { useState } from "react"
import {
  Lightbulb,
  ArrowUpCircle,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface Recommendation {
  title: string
  description: string
  impact: string
  type: string
}

interface ImprovementMessageProps {
  metadata: {
    recommendations: Recommendation[]
    champion: string
  }
}

type Decision = "approved" | "rejected" | null

const typeConfig: Record<string, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  success: {
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
}

const impactColors: Record<string, string> = {
  high: "bg-rose-500/15 text-rose-300 border-rose-500/25",
  medium: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  low: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
}

export function ImprovementMessage({ metadata }: ImprovementMessageProps) {
  const { recommendations, champion } = metadata
  const [decisions, setDecisions] = useState<Record<number, Decision>>(
    () => Object.fromEntries(recommendations.map((_, i) => [i, null]))
  )
  const [applied, setApplied] = useState(false)

  const toggleDecision = (index: number, decision: Decision) => {
    setDecisions((prev) => ({
      ...prev,
      [index]: prev[index] === decision ? null : decision,
    }))
  }

  const approvedCount = Object.values(decisions).filter((d) => d === "approved").length

  const handleApply = () => {
    setApplied(true)
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-emerald-500/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20">
          <Lightbulb className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 tracking-tight flex items-center gap-2">
            💡 Self-Improvement Recommendations
          </h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            {recommendations.length} suggestions for <span className="text-white/60 font-medium">{champion}</span>
          </p>
        </div>
      </div>

      {/* Recommendation Cards */}
      <div className="space-y-2.5">
        {recommendations.map((rec, index) => {
          const config = typeConfig[rec.type] || typeConfig.info
          const IconComp = config.icon
          const decision = decisions[index]
          const impactStyle = impactColors[rec.impact.toLowerCase()] || impactColors.medium

          return (
            <div
              key={index}
              className={`relative rounded-xl p-4 transition-all duration-300 ${
                decision === "approved"
                  ? "bg-emerald-500/[0.06] border border-emerald-500/20"
                  : decision === "rejected"
                  ? "bg-white/[0.01] border border-white/[0.05] opacity-50"
                  : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05]"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Type Icon */}
                <div
                  className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg ${config.bg} border ${config.border}`}
                >
                  <IconComp className={`w-4 h-4 ${config.color}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white/85 tracking-tight">
                      {rec.title}
                    </h4>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border ${impactStyle}`}
                    >
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/45 leading-relaxed">{rec.description}</p>
                </div>

                {/* Approve / Reject Toggles */}
                {!applied && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleDecision(index, "approved")}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer ${
                        decision === "approved"
                          ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
                          : "bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20"
                      }`}
                      title="Approve"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleDecision(index, "rejected")}
                      className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer ${
                        decision === "rejected"
                          ? "bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.2)]"
                          : "bg-white/[0.03] border border-white/[0.06] text-white/30 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20"
                      }`}
                      title="Reject"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Post-apply status */}
                {applied && decision === "approved" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/25 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Applied
                    </span>
                  </div>
                )}
                {applied && decision !== "approved" && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] flex-shrink-0">
                    <span className="text-[10px] font-semibold text-white/30 uppercase tracking-wider">
                      Skipped
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Action Buttons */}
      {!applied && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-[11px] text-white/30">
            {approvedCount} of {recommendations.length} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleApply}
              className="h-8 px-4 text-xs text-white/50 hover:text-white/70 hover:bg-white/[0.06] rounded-lg cursor-pointer"
            >
              Skip
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              disabled={approvedCount === 0}
              className="h-8 px-4 text-xs bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg
                         shadow-lg shadow-emerald-600/20 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer"
            >
              <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
              Apply Selected ({approvedCount})
            </Button>
          </div>
        </div>
      )}

      {/* Applied Confirmation */}
      {applied && (
        <div className="flex items-center gap-2 pt-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400/80">
            {approvedCount > 0
              ? `${approvedCount} improvement${approvedCount > 1 ? "s" : ""} applied successfully`
              : "All recommendations skipped"}
          </span>
        </div>
      )}
    </div>
  )
}
