"use client"

import { useState, useEffect } from "react"
import { Play, ArrowRight, Zap, ShieldQuestion, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  champion: ModelLeaderboardItem
}

export function StepPlayground({ onComplete, schema, champion }: Props) {
  const isMedical = schema.fileName.toLowerCase().includes("cancer") || schema.targetColumn.toLowerCase() === "diagnosis"
  const isRegression = schema.problemType === "regression"
  
  // Render input fields for up to the top 8 features to preserve layout space
  const features = schema.columns.filter((c) => c.toLowerCase() !== schema.targetColumn.toLowerCase()).slice(0, 8)

  // Standard mock values matching names
  const defaultMockValues: Record<string, string> = {
    annual_income: "82000",
    credit_score: "710",
    account_age: "36",
    num_transactions: "24",
    region: "North",
    has_mortgage: "No",
    radius_mean: "17.99",
    texture_mean: "10.38",
    perimeter_mean: "122.8",
    area_mean: "1001.0",
    smoothness_mean: "0.118",
    compactness_mean: "0.277",
    size_sqft: "1850",
    bedrooms: "3",
    bathrooms: "2",
    year_built: "2015",
    tax_rate: "1.2",
    neighborhood_score: "85"
  }

  const getBounds = (feat: string) => {
    const key = feat.toLowerCase()
    
    const rangeBounds: Record<string, { min: number; max: number; step: number }> = {
      annual_income: { min: 20000, max: 250000, step: 5000 },
      credit_score: { min: 300, max: 850, step: 5 },
      account_age: { min: 1, max: 120, step: 1 },
      num_transactions: { min: 0, max: 100, step: 1 },
      avg_balance: { min: 100, max: 15000, step: 100 },
      radius_mean: { min: 5.0, max: 30.0, step: 0.1 },
      texture_mean: { min: 5.0, max: 40.0, step: 0.1 },
      perimeter_mean: { min: 40.0, max: 200.0, step: 0.5 },
      area_mean: { min: 100.0, max: 2800.0, step: 10.0 },
      smoothness_mean: { min: 0.05, max: 0.25, step: 0.005 },
      compactness_mean: { min: 0.02, max: 0.50, step: 0.005 },
      concavity_mean: { min: 0.0, max: 0.5, step: 0.005 },
      symmetry_mean: { min: 0.1, max: 0.4, step: 0.005 },
      fractal_dimension_mean: { min: 0.01, max: 0.15, step: 0.001 },
      size_sqft: { min: 500, max: 6500, step: 50 },
      bedrooms: { min: 1, max: 6, step: 1 },
      bathrooms: { min: 1, max: 5, step: 0.5 },
      year_built: { min: 1950, max: 2025, step: 1 },
      tax_rate: { min: 0.5, max: 3.5, step: 0.1 },
      neighborhood_score: { min: 10, max: 100, step: 5 }
    }

    if (rangeBounds[key]) return rangeBounds[key]
    if (key.includes("price") || key.includes("sales") || key.includes("cost") || key.includes("value") || key.includes("revenue") || key.includes("salary") || key.includes("income") || key.includes("amount") || key.includes("balance")) {
      return { min: 1000, max: 500000, step: 2000 }
    }
    return { min: 0, max: 100, step: 1 }
  }

  // Set initial form states
  const [formInputs, setFormInputs] = useState<Record<string, string>>({})
  const [results, setResults] = useState<any | null>(null)

  // Initialize form input variables
  useEffect(() => {
    const initial: Record<string, string> = {}
    features.forEach((feat) => {
      const bounds = getBounds(feat)
      initial[feat] = defaultMockValues[feat] || String(bounds.min + (bounds.max - bounds.min) / 2)
    })
    setFormInputs(initial)
  }, [schema])

  // Reactive Inference evaluation loop listening to formInputs changes
  useEffect(() => {
    if (Object.keys(formInputs).length === 0) return

    let tMin = schema.targetMin !== undefined ? schema.targetMin : 0
    let tMax = schema.targetMax !== undefined ? schema.targetMax : 100

    if (tMin === tMax) {
      tMin = 0
      tMax = 100
    }

    const targetLower = schema.targetColumn.toLowerCase()
    const isLargeVal = targetLower.includes("price") || targetLower.includes("house") || targetLower.includes("salary") || targetLower.includes("revenue") || targetLower.includes("sales") || targetLower.includes("cost") || targetLower.includes("income") || targetLower.includes("balance")
    if (isLargeVal && tMax <= 100) {
      tMin = 10000
      tMax = 500000
    }

    let weightedSum = 0
    let maxPossible = 0
    let minPossible = 0

    features.forEach((feat) => {
      const bounds = getBounds(feat)
      const val = parseFloat(formInputs[feat]) || 0
      const normVal = (val - bounds.min) / (bounds.max - bounds.min)

      // Deterministic weight between -1.5 and 1.5 based on feature name hashing
      const hash = (feat.charCodeAt(0) * 7 + feat.charCodeAt(feat.length - 1) * 3) % 31
      const weight = (hash - 15) / 10

      weightedSum += normVal * weight
      if (weight > 0) {
        maxPossible += weight
      } else {
        minPossible += weight
      }
    })

    const range = maxPossible - minPossible
    const norm = range > 0 ? (weightedSum - minPossible) / range : 0.5

    if (isRegression) {
      // Bounded local linear smooth prediction
      const predictedValue = tMin + norm * (tMax - tMin)

      const contributions = features.map((feat) => {
        const val = parseFloat(formInputs[feat]) || 0
        const bounds = getBounds(feat)
        const defVal = parseFloat(defaultMockValues[feat] || String(bounds.min + (bounds.max - bounds.min) / 2))
        
        const normVal = (val - bounds.min) / (bounds.max - bounds.min)
        const normDef = (defVal - bounds.min) / (bounds.max - bounds.min)
        const devNorm = normVal - normDef

        const hash = (feat.charCodeAt(0) * 7 + feat.charCodeAt(feat.length - 1) * 3) % 31
        const weight = (hash - 15) / 10

        // Impact is deviation from default times coefficient weight, scaled to target units
        let impact = devNorm * weight * (tMax - tMin)
        if (impact === 0) {
          impact = (weight * 0.05) * (tMax - tMin)
        }

        return {
          feature: feat,
          val: impact,
          label: `${feat} impact`
        }
      }).sort((a, b) => Math.abs(b.val) - Math.abs(a.val))

      setResults({
        isRegression: true,
        predictedValue,
        confidence: `${(champion.accuracy * 100).toFixed(1)}% R²`,
        inferenceTime: `${(0.4 + Math.random() * 0.2).toFixed(1)} ms`,
        contributions,
      })
    } else {
      // Classification probability mapping (Logistic Sigmoid of centered sum)
      const baseProb = 1 / (1 + Math.exp(-(norm - 0.5) * 6.0))
      const probability = Math.max(0.01, Math.min(0.99, baseProb))
      const isPositiveClass = probability >= 0.50
      const confidence = Math.round((isPositiveClass ? probability : 1 - probability) * 1000) / 10

      const contributions = features.map((feat) => {
        const val = parseFloat(formInputs[feat]) || 0
        const bounds = getBounds(feat)
        const defVal = parseFloat(defaultMockValues[feat] || String(bounds.min + (bounds.max - bounds.min) / 2))
        
        const normVal = (val - bounds.min) / (bounds.max - bounds.min)
        const normDef = (defVal - bounds.min) / (bounds.max - bounds.min)
        const devNorm = normVal - normDef

        const hash = (feat.charCodeAt(0) * 7 + feat.charCodeAt(feat.length - 1) * 3) % 31
        const weight = (hash - 15) / 10

        let impact = devNorm * weight * 0.25
        if (impact === 0) {
          impact = weight * 0.02
        }

        return {
          feature: feat,
          val: impact,
          label: `${feat} impact`
        }
      }).sort((a, b) => Math.abs(b.val) - Math.abs(a.val))

      setResults({
        isRegression: false,
        churn: isPositiveClass,
        probability,
        confidence: `${confidence}%`,
        inferenceTime: `${(0.4 + Math.random() * 0.2).toFixed(1)} ms`,
        contributions,
      })
    }
  }, [formInputs, schema])

  const getGaugeStrokeDasharray = (prob: number) => {
    const arcLength = 220
    const strokeValue = prob * arcLength
    const emptyValue = arcLength - strokeValue
    return `${strokeValue} ${emptyValue}`
  }

  const getFieldType = (name: string) => {
    const categoricalFields = ["region", "has_mortgage", "gender", "churn", "class", "diagnosis"]
    if (categoricalFields.includes(name.toLowerCase())) {
      return "select"
    }
    return "number"
  }

  const maxImpact = results ? Math.max(...results.contributions.map((c: any) => Math.abs(c.val))) || 1 : 1

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Model API <span className="text-primary">Playground</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Drag range sliders to adjust parameters and trigger predictions reactively against <span className="text-white font-semibold">{champion.name}</span>.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left: Input parameters */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Inference Parameters</CardTitle>
              <CardDescription>Slide numerical fields to evaluate predictions.</CardDescription>
            </div>
            {results && (
              <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[10px] text-emerald-400 font-bold font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live API
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {features.map((feat) => {
                const type = getFieldType(feat)
                const bounds = getBounds(feat)
                return (
                  <div key={feat} className="space-y-1.5">
                    <Label className="capitalize text-[11px] text-muted-foreground">{feat.replace(/_/g, " ")}</Label>
                    {type === "select" ? (
                      <Select
                        value={formInputs[feat] || ""}
                        onValueChange={(val) => setFormInputs((i) => ({ ...i, [feat]: val }))}
                      >
                        <SelectTrigger className="bg-background/40 border-border/60 text-xs sm:text-sm">
                          <SelectValue placeholder="Value" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f0f29] border-border/40 text-white">
                          <SelectItem value="Yes" className="cursor-pointer">Yes / Option A</SelectItem>
                          <SelectItem value="No" className="cursor-pointer">No / Option B</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-350">
                          <span className="font-mono text-primary font-bold">{parseFloat(formInputs[feat] || "0").toFixed(feat.toLowerCase().includes("mean") ? 3 : 1)}</span>
                          <span className="text-[9px] text-muted-foreground font-semibold">Min: {bounds.min}</span>
                        </div>
                        <input
                          type="range"
                          min={bounds.min}
                          max={bounds.max}
                          step={bounds.step}
                          value={formInputs[feat] || bounds.min}
                          onChange={(e) => setFormInputs((i) => ({ ...i, [feat]: e.target.value }))}
                          className="w-full accent-primary bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right: Inference response */}
        <Card className="border-border/40 bg-card/45 backdrop-blur-md flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider">Prediction Response</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 flex-1 flex flex-col justify-center">
            
            {!results && (
              <div className="text-center py-12 text-muted-foreground/40 space-y-2">
                <ShieldQuestion className="h-12 w-12 mx-auto" />
                <p className="text-xs">Adjust the parameter sliders to generate prediction values.</p>
              </div>
            )}

            {results && (
              <div className="space-y-6 animate-fade-in">
                {/* Result header */}
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest block font-bold">Predicted Value</span>
                    {results.isRegression ? (
                      <span className="text-3xl font-extrabold text-emerald-400 block tracking-tight font-mono select-all">
                        {results.predictedValue.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-4xl font-black text-emerald-400 block tracking-tight font-mono select-all">
                        {results.churn ? "1" : "0"}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center text-xs">
                    <div className="bg-black/35 rounded border border-border/20 p-1.5 px-3 flex flex-col justify-center">
                      <span className="text-[9px] text-muted-foreground block uppercase">Latency</span>
                      <span className="font-bold text-primary flex items-center gap-0.5 mt-0.5 justify-center">
                        <Zap className="h-3 w-3 text-primary fill-primary" />
                        {results.inferenceTime}
                      </span>
                    </div>
                    <div className="bg-black/35 rounded border border-border/20 p-1.5 px-2 flex flex-col justify-center">
                      <span className="text-[9px] text-muted-foreground block uppercase">Metric Fit</span>
                      <span className="font-bold text-white mt-0.5 block">{results.confidence}</span>
                    </div>
                  </div>
                </div>

                {/* Probability Gauge & Local explanation */}
                <div className="grid grid-cols-3 gap-4 items-center">
                  {/* Gauge */}
                  <div className="relative flex flex-col items-center justify-center">
                    <svg className="w-24 h-24 transform -rotate-90">
                      <circle cx="48" cy="48" r="35" className="stroke-slate-800 fill-none" strokeWidth="6" />
                      <circle
                        cx="48"
                        cy="48"
                        r="35"
                        className="fill-none transition-all duration-300"
                        strokeWidth="6"
                        stroke={results.isRegression ? "var(--color-primary)" : results.churn ? "var(--color-primary)" : "var(--color-chart-2)"}
                        strokeDasharray={getGaugeStrokeDasharray(results.isRegression ? champion.accuracy : results.probability)}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-sm font-extrabold text-white">
                        {results.isRegression ? `${(champion.accuracy * 100).toFixed(0)}%` : `${(results.probability * 100).toFixed(0)}%`}
                      </span>
                      <span className="text-[8px] text-muted-foreground uppercase font-semibold">
                        {results.isRegression ? "R2 fit" : "Prob"}
                      </span>
                    </div>
                  </div>

                  {/* Waterfall contributions list */}
                  <div className="col-span-2 space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">Local SHAP Waterfall</span>
                    <div className="space-y-1.5 text-xs">
                      {results.contributions.map((c: any) => {
                        const isPositive = c.val > 0
                        return (
                          <div key={c.feature} className="space-y-0.5">
                            <div className="flex justify-between text-[10px]">
                              <span className="text-white truncate max-w-[100px]">{c.feature}</span>
                              <span className={isPositive ? "text-primary font-bold" : "text-cyan-400 font-bold"}>
                                {isRegression 
                                  ? (isPositive ? `+${c.val.toFixed(1)}` : `${c.val.toFixed(1)}`)
                                  : (isPositive ? `+${(c.val * 100).toFixed(0)}%` : `${(c.val * 100).toFixed(0)}%`)
                                }
                              </span>
                            </div>
                            <div className="h-1 bg-black/40 rounded overflow-hidden">
                              <div
                                className={`h-full rounded ${isPositive ? "bg-primary" : "bg-cyan-400"}`}
                                style={{ width: `${Math.min(100, (Math.abs(c.val) / maxImpact) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={onComplete}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg cursor-pointer"
        >
          Proceed to PDF Export
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
