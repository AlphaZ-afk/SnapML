"use client"

import { Trophy, Crown, TrendingUp, Timer, Cpu } from "lucide-react"

interface ModelMetrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1?: number
  auc?: number
  rmse?: number
  mae?: number
  r2?: number
  latency: string
  trainTime: string
  memory: string
}

interface ModelEntry {
  name: string
  metrics: ModelMetrics
}

interface ComparisonMessageProps {
  metadata: {
    models: ModelEntry[]
    champion: string
  }
}

const metricColors: Record<string, string> = {
  accuracy: "from-violet-500 to-violet-400",
  precision: "from-cyan-500 to-cyan-400",
  recall: "from-emerald-500 to-emerald-400",
  f1: "from-amber-500 to-amber-400",
  auc: "from-fuchsia-500 to-fuchsia-400",
  rmse: "from-rose-500 to-rose-400",
  mae: "from-orange-500 to-orange-400",
  r2: "from-emerald-500 to-emerald-400",
}

const metricLabels: Record<string, string> = {
  accuracy: "Accuracy",
  precision: "Precision",
  recall: "Recall",
  f1: "F1 Score",
  auc: "AUC-ROC",
  rmse: "RMSE",
  mae: "MAE",
  r2: "R² Score",
}

function MetricBar({ label, value, colorClass, isRaw = false }: { label: string; value: number; colorClass: string; isRaw?: boolean }) {
  // If it's a raw value (like RMSE), we don't multiply by 100 for percentage
  const displayVal = isRaw ? value.toFixed(2) : `${Math.round(value * 100)}%`
  // Width visualization is tricky for raw values, so we just cap them or use a pseudo-scale
  const widthPct = isRaw ? Math.min(100, Math.max(0, 100 - (value * 2))) : Math.round(value * 100)
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-white/50 font-medium tracking-wide uppercase">{label}</span>
        <span className="text-[11px] text-white/70 font-mono font-semibold">{displayVal}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-1000 ease-out`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}

export function ComparisonMessage({ metadata }: ComparisonMessageProps) {
  const { models, champion } = metadata

  return (
    <div className="bg-gradient-to-br from-amber-500/5 to-violet-500/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/20">
          <Trophy className="w-4.5 h-4.5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 tracking-tight flex items-center gap-2">
            🏆 Model Comparison
          </h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            {models.length} models evaluated · Champion: {champion}
          </p>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.map((model) => {
          const isChampion = model.name === champion

          return (
            <div
              key={model.name}
              className={`relative rounded-xl p-4 transition-all duration-300 ${
                isChampion
                  ? "bg-amber-500/[0.06] border border-amber-400/30 shadow-[0_0_25px_rgba(251,191,36,0.15)]"
                  : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.05]"
              }`}
            >
              {/* Champion Badge */}
              {isChampion && (
                <div className="absolute -top-2.5 right-3 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/30 to-amber-400/20 border border-amber-400/40">
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span className="text-[10px] font-bold text-amber-300 tracking-widest uppercase">
                    Champion
                  </span>
                </div>
              )}

              {/* Model Name */}
              <div className="flex items-center gap-2 mb-3.5">
                <div
                  className={`w-2 h-2 rounded-full ${
                    isChampion ? "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" : "bg-violet-400"
                  }`}
                />
                <h4
                  className={`text-sm font-semibold tracking-tight ${
                    isChampion ? "text-amber-200/90" : "text-white/80"
                  }`}
                >
                  {model.name}
                </h4>
              </div>

              {/* Metrics Bars */}
              <div className="space-y-2.5">
                {(Object.keys(metricLabels) as Array<keyof typeof metricLabels>)
                  .filter((key) => model.metrics[key as keyof ModelMetrics] !== undefined)
                  .map((key) => {
                    const isRaw = key === "rmse" || key === "mae"
                    return (
                      <MetricBar
                        key={key}
                        label={metricLabels[key]}
                        value={model.metrics[key as keyof ModelMetrics] as number}
                        colorClass={isChampion ? "from-amber-500 to-amber-300" : metricColors[key]}
                        isRaw={isRaw}
                      />
                    )
                  })}
              </div>

              {/* Resource Stats */}
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/[0.06]">
                <div className="flex items-center gap-1.5">
                  <Timer className="w-3 h-3 text-white/30" />
                  <span className="text-[11px] text-white/40 font-mono">{model.metrics.latency}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-white/30" />
                  <span className="text-[11px] text-white/40 font-mono">{model.metrics.trainTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-white/30" />
                  <span className="text-[11px] text-white/40 font-mono">{model.metrics.memory}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
