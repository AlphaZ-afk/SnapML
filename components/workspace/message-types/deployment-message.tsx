"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Cloud,
  Server,
  Container,
  Globe,
  Rocket,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeploymentMessageProps {
  metadata: any
}

const deployTargets = [
  { id: "docker", name: "Docker", description: "Containerized image", icon: Container, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "fastapi", name: "FastAPI", description: "REST API server", icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { id: "vertex", name: "Vertex AI", description: "Google Cloud ML", icon: Cloud, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20" },
  { id: "azure", name: "Azure ML", description: "Microsoft Azure", icon: Cloud, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  { id: "sagemaker", name: "AWS SageMaker", description: "Amazon Web Services", icon: Cloud, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
  { id: "kubernetes", name: "Kubernetes", description: "K8s orchestration", icon: Globe, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
]

const deploySteps = [
  { label: "Building container image...", duration: 1500 },
  { label: "Uploading image to registry...", duration: 1500 },
  { label: "Provisioning endpoint...", duration: 1500 },
  { label: "Running health checks...", duration: 1500 },
  { label: "Endpoint Active", duration: 0 },
]

type Phase = "select" | "deploying" | "deployed"

export function DeploymentMessage({ metadata }: DeploymentMessageProps) {
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
  const [phase, setPhase] = useState<Phase>("select")
  const [completedSteps, setCompletedSteps] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  const startDeploy = useCallback(() => {
    if (!selectedTarget) return
    setPhase("deploying")
    setCompletedSteps(0)
  }, [selectedTarget])

  // Animate deployment steps
  useEffect(() => {
    if (phase !== "deploying") return
    if (completedSteps >= deploySteps.length) {
      setPhase("deployed")
      return
    }

    const timer = setTimeout(() => {
      setCompletedSteps((prev) => prev + 1)
    }, deploySteps[completedSteps]?.duration || 1500)

    return () => clearTimeout(timer)
  }, [phase, completedSteps])

  const selectedInfo = deployTargets.find((t) => t.id === selectedTarget)
  const endpointUrl = `https://api.snapml.dev/v1/models/${selectedTarget || "model"}/predict`
  const apiKey = "sk-snapml-xxxxxxxxxxxxxxxxxxxx"

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gradient-to-br from-cyan-500/5 to-violet-500/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/20">
          <Rocket className="w-4.5 h-4.5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90 tracking-tight flex items-center gap-2">
            🚀 Deploy Model
          </h3>
          <p className="text-[11px] text-white/40 mt-0.5">
            {phase === "select"
              ? "Choose a deployment target"
              : phase === "deploying"
              ? `Deploying to ${selectedInfo?.name}...`
              : `Live on ${selectedInfo?.name}`}
          </p>
        </div>
      </div>

      {/* ── Phase 1: Target Selection ──────────────────────────── */}
      {phase === "select" && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {deployTargets.map((target) => {
              const IconComp = target.icon
              const isSelected = selectedTarget === target.id

              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedTarget(target.id)}
                  className={`group relative flex flex-col items-center gap-2 p-4 rounded-xl
                             transition-all duration-200 cursor-pointer ${
                               isSelected
                                 ? "bg-violet-500/[0.08] border border-violet-400/30 shadow-[0_0_20px_rgba(139,92,246,0.15)] scale-[1.02]"
                                 : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-105"
                             }`}
                >
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-xl ${target.bg} border ${target.border} transition-all duration-200`}
                  >
                    <IconComp className={`w-5 h-5 ${target.color}`} />
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold tracking-tight transition-colors ${
                        isSelected ? "text-violet-300" : "text-white/75 group-hover:text-white/90"
                      }`}
                    >
                      {target.name}
                    </p>
                    <p className="text-[10px] text-white/30 mt-0.5">{target.description}</p>
                  </div>

                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-violet-500 border-2 border-[#0a0a0f] flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={startDeploy}
              disabled={!selectedTarget}
              className="h-9 px-5 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded-xl
                         shadow-lg shadow-violet-600/20 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 mr-1.5" />
              Deploy Now
            </Button>
          </div>
        </>
      )}

      {/* ── Phase 2: Deploying Progress ────────────────────────── */}
      {phase === "deploying" && (
        <div className="space-y-2">
          {deploySteps.map((step, index) => {
            if (index > completedSteps) return null

            const isActive = index === completedSteps && completedSteps < deploySteps.length - 1
            const isComplete = index < completedSteps
            const isFinal = index === deploySteps.length - 1 && completedSteps >= deploySteps.length - 1

            return (
              <div
                key={index}
                className="flex items-center gap-3 py-2 px-3 rounded-lg animate-in slide-in-from-bottom-2 fade-in duration-300 bg-white/[0.02]"
              >
                {isComplete ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : isActive ? (
                  <Loader2 className="w-4 h-4 text-violet-400 animate-spin flex-shrink-0" />
                ) : isFinal ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/10 flex-shrink-0" />
                )}
                <span
                  className={`text-sm font-mono ${
                    isComplete
                      ? "text-white/40 line-through"
                      : isActive
                      ? "text-violet-300"
                      : isFinal
                      ? "text-emerald-400 font-semibold"
                      : "text-white/30"
                  }`}
                >
                  {isFinal ? `✅ ${step.label}` : step.label}
                </span>

                {isActive && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <span className="text-[10px] text-violet-400/70 font-mono">processing</span>
                    <span className="flex gap-0.5">
                      <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1 h-1 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </span>
                  </div>
                )}
              </div>
            )
          })}

          {/* Overall progress bar */}
          <div className="pt-2">
            <div className="h-1 w-full rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-700 ease-out"
                style={{ width: `${(completedSteps / deploySteps.length) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-white/25 mt-1.5 text-right font-mono">
              {Math.round((completedSteps / deploySteps.length) * 100)}% complete
            </p>
          </div>
        </div>
      )}

      {/* ── Phase 3: Deployed ──────────────────────────────────── */}
      {phase === "deployed" && (
        <div className="space-y-3">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-300">Deployment Successful</p>
              <p className="text-[11px] text-emerald-400/50 mt-0.5">
                Model is live on {selectedInfo?.name}
              </p>
            </div>
          </div>

          {/* Endpoint URL */}
          <div className="space-y-2">
            <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
              Endpoint URL
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono text-xs text-cyan-300/80 overflow-x-auto">
                {endpointUrl}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(endpointUrl)}
                className="h-8 px-3 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg shrink-0 cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* API Key */}
          <div className="space-y-2">
            <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
              API Key
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono text-xs text-white/40 overflow-x-auto">
                {apiKey}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(apiKey)}
                className="h-8 px-3 text-[11px] text-white/40 hover:text-white/70 hover:bg-white/[0.06] rounded-lg shrink-0 cursor-pointer"
              >
                Copy
              </Button>
            </div>
          </div>

          {/* Quick test snippet */}
          <div className="space-y-2">
            <label className="text-[11px] text-white/40 font-medium uppercase tracking-wider">
              Quick Test
            </label>
            <div className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] font-mono text-[11px] text-white/50 leading-relaxed overflow-x-auto">
              <span className="text-violet-400">curl</span> -X POST {endpointUrl} \<br />
              &nbsp;&nbsp;-H <span className="text-emerald-400">&quot;Authorization: Bearer $API_KEY&quot;</span> \<br />
              &nbsp;&nbsp;-H <span className="text-emerald-400">&quot;Content-Type: application/json&quot;</span> \<br />
              &nbsp;&nbsp;-d <span className="text-amber-400">{`'{"data": [...]}'`}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
