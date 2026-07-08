"use client"

import { useEffect, useState } from "react"
import { Cpu, Layers, ArrowRight, LineChart as LucideLineChart, CheckCircle2, Loader2, Sparkles } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  leaderboard: ModelLeaderboardItem[]
  champion: ModelLeaderboardItem
  isPaused?: boolean
  onPauseCheck?: () => void
}

const agentTeam = [
  { id: "objective", name: "Prediction Objective Agent", range: [0, 10], desc: "Parses user goals, maps target outcome columns, and verifies labels." },
  { id: "intelligence", name: "Dataset Intelligence Agent", range: [11, 20], desc: "Detects missing cells, leakage risk, class imbalance, and outliers." },
  { id: "cleaning", name: "Data Cleaning Agent", range: [21, 30], desc: "Imputes missing records, clips skewness, and normalizes numeric distributions." },
  { id: "features", name: "Feature Engineering Agent", range: [31, 45], desc: "Generates interaction features, category target encoders, and scales ranges." },
  { id: "discovery", name: "Model Discovery Agent", range: [46, 55], desc: "Selects XGBoost, LightGBM, CatBoost, Neural Nets, and regressions." },
  { id: "hyperparameter", name: "Hyperparameter Optimization Agent", range: [56, 70], desc: "Executes randomized Bayesian sweeps, early stopping, and grid folds." },
  { id: "evaluation", name: "Evaluation Agent", range: [71, 80], desc: "Ranks fitted algorithms on cross-validation fold accuracy and inference metrics." },
  { id: "explainability", name: "Explainability Agent", range: [81, 88], desc: "Translates model weights and waterfall SHAP values into plain English." },
  { id: "deployment", name: "Deployment Agent", range: [89, 93], desc: "Prepares FastAPI scripts, Dockerfile configurations, and REST ports." },
  { id: "monitoring", name: "Monitoring Agent", range: [94, 97], desc: "Deploys MLOps warning triggers for data drift and latency boundaries." },
  { id: "documentation", name: "Documentation Agent", range: [98, 100], desc: "Compiles downloadable README guides, Model Cards, and reports." }
]

export function StepAutoml({ onComplete, schema, leaderboard, champion, isPaused = false, onPauseCheck }: Props) {
  const [timeLeft, setTimeLeft] = useState(12)
  const [globalProgress, setGlobalProgress] = useState(0)
  const [algProgress, setAlgProgress] = useState<Record<string, number>>({})
  const [completed, setCompleted] = useState(false)
  const [epochData, setEpochData] = useState<{ epoch: number; trainLoss: number; valAccuracy: number }[]>([])

  const isRegression = schema.problemType === "regression"
  const metricName = isRegression ? "R²" : "Accuracy"

  const algorithms = leaderboard.map((item, idx) => ({
    name: item.name,
    duration: idx === 0 ? 9.5 : idx === 1 ? 7.0 : idx === 2 ? 8.5 : idx === 3 ? 4.5 : idx === 4 ? 5.0 : idx === 5 ? 2.5 : idx === 6 ? 1.5 : 2.0,
    type: item.status,
    accuracy: item.accuracy,
    cv: item.cv
  }))

  useEffect(() => {
    if (isPaused) return

    // 1. Countdown timer
    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // 2. Global progress bar
    const progressTimer = setInterval(() => {
      setGlobalProgress((prev) => {
        const nextVal = prev + 1

        // PAUSE CHECKPOINT: Halt progress at 50% for model ensembling approval
        if (nextVal === 50 && onPauseCheck) {
          clearInterval(progressTimer)
          clearInterval(countdown)
          onPauseCheck()
          return 50
        }

        if (nextVal >= 100) {
          clearInterval(progressTimer)
          setCompleted(true)
          return 100
        }

        if (nextVal % 10 === 0) {
          const epochNum = nextVal / 10
          const baseScore = leaderboard[0]?.accuracy || 0.90
          const trainLoss = 0.75 * Math.exp(-epochNum * 0.35) + Math.random() * 0.04
          const valAccuracy = baseScore * (1 - Math.exp(-epochNum * 0.45)) + (Math.random() - 0.5) * 0.015
          
          setEpochData((prevData) => [
            ...prevData,
            {
              epoch: epochNum,
              trainLoss: parseFloat(trainLoss.toFixed(3)),
              valAccuracy: parseFloat(Math.min(1.0, valAccuracy).toFixed(3))
            }
          ])
        }

        return nextVal
      })
    }, 120)

    // 3. Algorithm sweeps fitting
    let elapsed = globalProgress * 0.12
    const algTimer = setInterval(() => {
      elapsed += 0.1
      const newProgress = { ...algProgress }

      algorithms.forEach((alg) => {
        const startOffset = alg.duration * 0.4
        if (elapsed > startOffset) {
          const fitTime = alg.duration * 0.6
          const p = Math.min(100, Math.round(((elapsed - startOffset) / fitTime) * 100))
          newProgress[alg.name] = p
        } else {
          newProgress[alg.name] = 0
        }
      })
      setAlgProgress(newProgress)
    }, 100)

    return () => {
      clearInterval(countdown)
      clearInterval(progressTimer)
      clearInterval(algTimer)
    }
  }, [isPaused, globalProgress])

  useEffect(() => {
    if (completed) {
      const timer = setTimeout(() => {
        onComplete()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [completed, onComplete])

  const getActiveAgent = () => {
    return agentTeam.find(a => globalProgress >= a.range[0] && globalProgress <= a.range[1]) || agentTeam[0]
  }

  const activeAgent = getActiveAgent()

  const getUxExplanation = () => {
    switch (activeAgent.id) {
      case "objective":
        return {
          what: "Parsing prediction goals...",
          why: "Determining whether this is a classification, regression, or forecasting task based on descriptive text strings.",
          next: "Passing coordinates to the Dataset Intelligence Agent."
        }
      case "intelligence":
        return {
          what: "Scanning features structure...",
          why: "Evaluating missing cells, column imbalance, and leakage anomalies before model training.",
          next: "Launching autonomous data cleaning."
        }
      case "cleaning":
        return {
          what: "Imputing empty coordinates...",
          why: "Applying median modes, clipping extreme outliers, and normalizing continuous variables.",
          next: "Triggering feature auto-engineering."
        }
      case "features":
        return {
          what: "Generating interaction features...",
          why: "Building cross-correlation matrices and standard scaling value parameters to align gradient fits.",
          next: "Selecting algorithm candidate sweeps."
        }
      case "discovery":
        return {
          what: "Testing candidate model types...",
          why: "Selecting model discovery types (XGBoost, boosting models, regressions, neural nets) suited for this shape.",
          next: "Launching Bayesian hyperparameter folds."
        }
      case "hyperparameter":
        return {
          what: "Sweeping hyperparameter coordinates...",
          why: "Running 5-fold cross validation searches and early stopping rounds to maximize performance metrics.",
          next: "Compiling model comparison leaderboard."
        }
      case "evaluation":
        return {
          what: "Evaluating fitted model metrics...",
          why: "Compares F1 score, ROC AUC, precision, recall, training time, and inference latencies.",
          next: "Extracting champion plain English explainability cards."
        }
      case "explainability":
        return {
          what: "Interpreting prediction logic...",
          why: "Generating local SHAP waterfall feature importances and target boundary rules in plain English.",
          next: "Assembling REST API codes."
        }
      case "deployment":
        return {
          what: "Creating REST deploy scripts...",
          why: "Formulating FastAPI routing scripts, Flask ports, and Dockerfile container configurations.",
          next: "Configuring drift telemetry triggers."
        }
      case "monitoring":
        return {
          what: "Enabling data drift scanning...",
          why: "Arming warning thresholds for latent prediction shifts to prompt auto-retraining alerts.",
          next: "Formatting downloadable documentation card zip packages."
        }
      default:
        return {
          what: "Compiling documentation archive...",
          why: "Synthesizing Model Cards, Readme markdowns, API usage sheets, and technical governance briefs.",
          next: "Finishing autonomous pipeline sweep."
        }
    }
  }

  const ux = getUxExplanation()

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-black/20 p-5 rounded-2xl border border-border/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-primary animate-spin" />
            <h3 className="text-lg font-bold text-white uppercase tracking-wider">
              {isPaused ? "AutoML Fitting Sweeps Paused" : "Autonomous AI Pipeline Execution"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {isPaused 
              ? "Human intervention required in Chat Console to proceed with model ensembling." 
              : "Specialized Grok AI agents are collaborating autonomously to prepare, engineer, train, and deploy your model."}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Estimated Folds Time</span>
          <span className="text-xl font-extrabold text-primary block tabular-nums">{timeLeft}s remaining</span>
        </div>
      </div>

      {/* GLOBAL PIPELINE PROGRESS */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-350">Overall Pipeline Folds Sweep Progress</span>
          <span className="text-emerald-400 font-bold">{globalProgress}%</span>
        </div>
        <Progress value={globalProgress} className="h-2 bg-black/40" />
      </div>

      {/* DASHBOARD SPLIT GRID */}
      <div className="grid gap-6 lg:grid-cols-5">
        
        {/* LEFT COLUMN (3/5): curves and sweeps */}
        <div className="lg:col-span-3 space-y-6">
          {/* Realtime Curve Recharts */}
          <Card className="bg-black/25 border-border/20 p-4">
            <span className="text-xs uppercase font-bold text-white block mb-3 flex items-center gap-1.5">
              <LucideLineChart className="h-4 w-4 text-primary animate-pulse" />
              Realtime Pipeline Loss & Accuracy Curves
            </span>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={epochData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis dataKey="epoch" stroke="#666" fontSize={8} label={{ value: "Training Epoch", position: "insideBottom", offset: -2, fill: "#888", fontSize: 8 }} />
                  <YAxis stroke="#666" fontSize={8} />
                  <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)", fontSize: 10 }} />
                  <Line type="monotone" dataKey="trainLoss" name="Training Loss" stroke="var(--color-primary)" strokeWidth={1.5} dot={{ r: 1 }} />
                  <Line type="monotone" dataKey="valAccuracy" name={`Val ${metricName}`} stroke="#10b981" strokeWidth={1.5} dot={{ r: 1 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Model sweeps bars */}
          <Card className="bg-black/25 border-border/20 p-4">
            <span className="text-xs uppercase font-bold text-white block mb-3 flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-cyan-400" />
              Concurrent Algorithm Sweeps Fitting
            </span>
            <div className="space-y-3.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
              {algorithms.map((alg) => {
                const prog = algProgress[alg.name] || 0
                return (
                  <div key={alg.name} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-slate-350">{alg.name}</span>
                      <span className={prog === 100 ? "text-emerald-400 font-bold" : "text-muted-foreground"}>
                        {prog === 100 ? "Completed" : `${prog}%`}
                      </span>
                    </div>
                    <Progress value={prog} className="h-1 bg-black/40" />
                  </div>
                )
              })}
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (2/5): specialized agent status console (Step 14 & 15) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agent status tracker */}
          <Card className="bg-black/25 border-border/20 p-4 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs uppercase font-bold text-white flex items-center gap-1.5 border-b border-border/20 pb-2">
                <Layers className="h-4 w-4 text-primary animate-pulse" />
                AI Agent Team status console
              </span>

              {/* Step 15 UX details */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary animate-pulse shrink-0" />
                  <span className="font-bold text-white">{isPaused ? "Model ensembling audit check" : ux.what}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">Why it is doing it</span>
                  <p className="text-slate-300 leading-normal text-[11px] mt-0.5">
                    {isPaused 
                      ? "Grok has paused search folds to consult user in Chat Console on ensembling candidate weights."
                      : ux.why}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block">What happens next</span>
                  <span className="text-primary font-medium text-[11px]">
                    {isPaused ? "Await user approval in Chat Console" : ux.next}
                  </span>
                </div>
              </div>

              {/* Visual mini-timeline for agents */}
              <div className="space-y-2 pt-2 text-[10px] font-mono">
                {agentTeam.map((agent) => {
                  const isDone = globalProgress > agent.range[1]
                  const isActive = globalProgress >= agent.range[0] && globalProgress <= agent.range[1]
                  
                  return (
                    <div key={agent.id} className="flex items-center justify-between border-b border-border/5 py-1">
                      <div className="flex items-center gap-2 truncate">
                        {isDone ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        ) : isActive ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-primary shrink-0" />
                        ) : (
                          <div className="h-3.5 w-3.5 rounded-full border border-border/40 shrink-0" />
                        )}
                        <span className={isDone ? "text-muted-foreground line-through truncate" : isActive ? "text-white font-bold truncate" : "text-muted-foreground/50 truncate"}>
                          {agent.name}
                        </span>
                      </div>
                      <span className={`text-[9px] uppercase font-bold ${
                        isDone ? "text-emerald-400/80" : isActive ? "text-primary animate-pulse" : "text-muted-foreground/30"
                      }`}>
                        {isDone ? "Ready" : isActive ? "Active" : "Wait"}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {completed && (
              <Button
                size="lg"
                onClick={onComplete}
                className="w-full gap-2 mt-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                Proceed to Leaderboard Registry
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </Card>
        </div>

      </div>
    </div>
  )
}
