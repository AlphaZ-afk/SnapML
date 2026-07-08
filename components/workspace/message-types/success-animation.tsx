"use client"

import { useEffect, useState } from "react"
import { Trophy, Sparkles, Zap } from "lucide-react"

interface SuccessAnimationProps {
  metadata: {
    champion: string
    metric: string
    value: string
    taskType: string
  }
}

export function SuccessAnimation({ metadata }: SuccessAnimationProps) {
  const { champion, metric, value, taskType } = metadata
  const [visible, setVisible] = useState(false)
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; delay: number; size: number; color: string }[]>([])

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true))
    // Generate sparkle particles
    const colors = ["bg-violet-400", "bg-amber-400", "bg-emerald-400", "bg-fuchsia-400", "bg-sky-400"]
    const p = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 0.6,
      size: Math.random() * 3 + 2,
      color: colors[i % colors.length],
    }))
    setParticles(p)
  }, [])

  return (
    <div
      className={`relative rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/[0.06] to-violet-500/[0.06] p-6 overflow-hidden transition-all duration-700 ease-out ${
        visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      }`}
    >
      {/* Sparkle Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className={`absolute rounded-full ${p.color} opacity-0 animate-[sparkle_1.5s_ease-out_forwards]`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Trophy */}
        <div className="relative mb-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 shadow-lg shadow-amber-500/10">
            <Trophy className="w-7 h-7 text-amber-400" />
          </div>
          <div className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/30 border border-emerald-500/40">
            <Sparkles className="w-3 h-3 text-emerald-400" />
          </div>
        </div>

        <h3 className="text-sm font-bold text-white/90 mb-1">
          Training Complete!
        </h3>
        <p className="text-xs text-white/50 mb-3">
          Champion Model Selected
        </p>

        {/* Champion Card */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] mb-3">
          <Zap className="w-4 h-4 text-amber-400" />
          <div className="text-left">
            <p className="text-sm font-semibold text-white/90">{champion}</p>
            <p className="text-[11px] text-white/40">{metric}: {value}</p>
          </div>
        </div>

        <p className="text-[11px] text-emerald-400/70">
          {taskType === "regression" ? "Lowest error achieved" : "Highest score achieved"} across all 8 models
        </p>
      </div>

      {/* CSS for sparkle animation */}
      <style jsx>{`
        @keyframes sparkle {
          0% { opacity: 0; transform: scale(0) translateY(0); }
          50% { opacity: 1; transform: scale(1.5) translateY(-10px); }
          100% { opacity: 0; transform: scale(0) translateY(-30px); }
        }
      `}</style>
    </div>
  )
}
