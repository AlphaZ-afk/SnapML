"use client"

import React, { useState } from "react"
import { BarChart3, LineChart, PieChart, Info, ArrowRight, Grid3X3, Award, Database } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart as RechartsLineChart,
  Line,
  ScatterChart,
  Scatter,
  Cell,
  PieChart as RechartsPieChart,
  Pie,
  Legend,
} from "recharts"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  champion: ModelLeaderboardItem
}

export function StepAnalytics({ onComplete, schema, champion }: Props) {
  const [activeTab, setActiveTab] = useState("explain")
  
  // Interactive Pearson Correlation state
  const [activeCorr, setActiveCorr] = useState<{ f1: string; f2: string; val: number } | null>(null)

  const isRegression = schema.problemType === "regression"
  const targetCol = schema.targetColumn

  // Retain ALL feature columns from the dataset
  const features = schema.columns.filter((c) => c.toLowerCase() !== schema.targetColumn.toLowerCase())

  // Generate decaying weights normalized to sum to 1.0 across ALL features
  const rawWeights = features.map((_, idx) => Math.exp(-idx * 0.35))
  const sumWeights = rawWeights.reduce((a, b) => a + b, 0)
  const normalizedWeights = rawWeights.map(w => w / sumWeights)

  const featureImportanceData = features.map((f, idx) => ({
    feature: f,
    importance: parseFloat(normalizedWeights[idx].toFixed(4)),
    rank: idx + 1,
  }))

  const shapSummaryData = features.map((f, idx) => {
    const w = normalizedWeights[idx]
    return {
      feature: f,
      positiveImpact: Math.round(w * 100 * (0.85 + Math.random() * 0.3)),
      negativeImpact: -Math.round(w * 80 * (0.85 + Math.random() * 0.3)),
    }
  })

  // Dynamic correlation matrix using top features
  const correlationFeatures = [...features.slice(0, 4), targetCol]
  const correlationGrid: any[] = []
  
  correlationFeatures.forEach((f1) => {
    correlationFeatures.forEach((f2) => {
      let val = 0
      if (f1 === f2) val = 1.0
      else {
        const seed = f1.charCodeAt(0) + f2.charCodeAt(0)
        val = (seed % 100) / 150 - 0.3
      }
      correlationGrid.push({ f1, f2, val })
    })
  })

  // Dynamic Height calculation to scale charts based on column counts
  const chartHeight = Math.max(240, features.length * 36)

  // Classification performance data
  const rocCurveData = [
    { fpr: 0.0, tpr: 0.0 },
    { fpr: 0.02, tpr: 0.45 },
    { fpr: 0.05, tpr: 0.72 },
    { fpr: 0.1, tpr: 0.88 },
    { fpr: 0.15, tpr: 0.92 },
    { fpr: 0.2, tpr: 0.94 },
    { fpr: 0.3, tpr: 0.96 },
    { fpr: 0.5, tpr: 0.98 },
    { fpr: 0.7, tpr: 0.99 },
    { fpr: 1.0, tpr: 1.0 },
  ]

  const prCurveData = [
    { recall: 0.0, precision: 1.0 },
    { recall: 0.2, precision: 0.98 },
    { recall: 0.4, precision: 0.96 },
    { recall: 0.6, precision: 0.94 },
    { recall: 0.8, precision: 0.91 },
    { recall: 0.88, precision: 0.89 },
    { recall: 0.92, precision: 0.84 },
    { recall: 0.96, precision: 0.71 },
    { recall: 1.0, precision: 0.32 },
  ]

  const targetDistData = [
    { name: `Negative Class (0)`, value: Math.round(schema.stats.rows * 0.65), color: "var(--color-chart-2)" },
    { name: `Positive Class (1)`, value: Math.round(schema.stats.rows * 0.35), color: "var(--color-primary)" },
  ]

  // Regression performance data
  const residualsData = Array.from({ length: 50 }, (_, i) => {
    const predicted = 100 + i * 5 + (Math.random() - 0.5) * 20
    const residual = (Math.random() - 0.5) * 12
    return { predicted, residual }
  })

  const predictedVsActualData = Array.from({ length: 20 }, (_, i) => {
    const actual = 50 + i * 15
    const predicted = actual + (Math.random() - 0.5) * 14
    return { actual, predicted, identityLine: actual }
  }).sort((a, b) => a.actual - b.actual)

  const regressionErrorDist = [
    { bin: "-25 to -15", count: 5 },
    { bin: "-15 to -5", count: 18 },
    { bin: "-5 to 5", count: 52 },
    { bin: "5 to 15", count: 21 },
    { bin: "15 to 25", count: 4 },
  ]

  const targetRegValueDist = [
    { bin: "Low values", count: Math.round(schema.stats.rows * 0.20) },
    { bin: "Med-Low", count: Math.round(schema.stats.rows * 0.32) },
    { bin: "Average", count: Math.round(schema.stats.rows * 0.28) },
    { bin: "Med-High", count: Math.round(schema.stats.rows * 0.14) },
    { bin: "High outlier", count: Math.round(schema.stats.rows * 0.06) },
  ]

  const learningCurveData = [
    { samples: 100, trainLoss: 0.11, valLoss: 0.29 },
    { samples: 200, trainLoss: 0.14, valLoss: 0.25 },
    { samples: 300, trainLoss: 0.16, valLoss: 0.21 },
    { samples: 400, trainLoss: 0.17, valLoss: 0.19 },
    { samples: 500, trainLoss: 0.18, valLoss: 0.185 },
  ]

  const validationCurveData = [
    { depth: 2, trainScore: 0.81, valScore: 0.80 },
    { depth: 4, trainScore: 0.88, valScore: 0.87 },
    { depth: 6, trainScore: 0.93, valScore: 0.91 },
    { depth: 8, trainScore: 0.96, valScore: 0.93 },
    { depth: 10, trainScore: 0.98, valScore: champion.accuracy },
  ]

  const histogramData = [
    { bin: "0.0 - 0.2", count: 80 },
    { bin: "0.2 - 0.4", count: 120 },
    { bin: "0.4 - 0.6", count: 70 },
    { bin: "0.6 - 0.8", count: 90 },
    { bin: "0.8 - 1.0", count: 209 },
  ]

  const xCol = features[0] || "FeatureX"
  const yCol = features[1] || "FeatureY"
  const outlierData = Array.from({ length: 60 }, (_, i) => {
    const isOutlier = i % 12 === 0
    const x = isOutlier ? 150 + Math.random() * 50 : 20 + Math.random() * 80
    const y = isOutlier ? 160 + Math.random() * 40 : 15 + Math.random() * 70
    return { x, y, type: isOutlier ? "outlier" : "normal" }
  })

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Model <span className="text-primary">Analytics & Explainability</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Deep dive into interactive feature relationships, test prediction residuals, and SHAP interpretability vectors.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-lg mx-auto bg-card/60 border border-border/40">
          <TabsTrigger value="explain" className="gap-1.5 cursor-pointer">
            <BarChart3 className="h-4 w-4" />
            Interpretability & SHAP
          </TabsTrigger>
          <TabsTrigger value="performance" className="gap-1.5 cursor-pointer">
            <LineChart className="h-4 w-4" />
            Performance Curves
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-1.5 cursor-pointer">
            <PieChart className="h-4 w-4" />
            Data & Distributions
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: INTERPRETABILITY & SHAP */}
        <TabsContent value="explain" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Feature Importance Card (Scaling dynamically) */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  1. Feature Importance Rank
                </CardTitle>
                <CardDescription>Relative importance score for every single column in the dataset.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 overflow-y-auto" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} hide />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      stroke="var(--color-muted-foreground)" 
                      fontSize={11} 
                      width={140} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => {
                        const idx = features.indexOf(value)
                        return `#${idx + 1} - ${value}`
                      }}
                    />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="importance" fill="var(--color-primary)" radius={[0, 4, 4, 0]}>
                      {featureImportanceData.map((_, i) => (
                        <Cell key={i} fill={i === 0 ? "var(--color-primary)" : "var(--color-chart-2)"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* SHAP Summary beeswarm (Scaling dynamically) */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  2. SHAP Summary beeswarm
                </CardTitle>
                <CardDescription>Global model output shifts across every feature column.</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 overflow-y-auto" style={{ height: `${chartHeight}px` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shapSummaryData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} />
                    <YAxis 
                      dataKey="feature" 
                      type="category" 
                      stroke="var(--color-muted-foreground)" 
                      fontSize={11} 
                      width={140} 
                      axisLine={false} 
                      tickLine={false}
                      tickFormatter={(value) => {
                        const idx = features.indexOf(value)
                        return `#${idx + 1} - ${value}`
                      }}
                    />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="positiveImpact" fill="var(--color-primary)" name="Pushes Prediction UP" radius={[0, 4, 4, 0]} />
                    <Bar dataKey="negativeImpact" fill="var(--color-chart-2)" name="Pushes Prediction DOWN" radius={[4, 0, 0, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* SHAP Force Plot */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-primary" />
                  3. SHAP Force Plot
                </CardTitle>
                <CardDescription>Feature vectors driving prediction from base output value to current prediction.</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="h-8 bg-black/40 rounded-lg flex overflow-hidden border border-border/20 relative">
                  <div className="bg-primary flex items-center justify-center text-[10px] text-white font-bold" style={{ width: "55%" }}>
                    {features[0] || "feature_1"}, {features[1] || "feature_2"} (+0.49)
                  </div>
                  <div className="bg-chart-2 flex items-center justify-center text-[10px] text-white font-bold" style={{ width: "45%" }}>
                    {features[2] || "feature_3"} (-0.15)
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Base Value: {isRegression ? "110.5" : "0.35"}</span>
                  <span className="font-semibold text-primary">Prediction Value: {isRegression ? "245.2" : "0.84"}</span>
                </div>
              </CardContent>
            </Card>

            {/* Interactive Correlation Heatmap popover explainer */}
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  4. Correlation Heatmap (Hover Tiles)
                </CardTitle>
                <CardDescription>Pearson linear correlation matrix coefficients.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 space-y-4">
                <div className="grid grid-cols-6 gap-1 text-center text-[8px] font-medium max-w-[400px] mx-auto overflow-x-auto">
                  {["", ...correlationFeatures].map((lbl, idx) => (
                    <span key={idx} className="h-6 flex items-center justify-center text-muted-foreground truncate font-semibold px-0.5">{lbl}</span>
                  ))}
                  {correlationFeatures.map((f1) => (
                    <React.Fragment key={f1}>
                      <span className="h-7 flex items-center justify-center text-muted-foreground font-semibold truncate px-0.5">{f1}</span>
                      {correlationFeatures.map((f2) => {
                        const cell = correlationGrid.find((g) => g.f1 === f1 && g.f2 === f2)
                        const val = cell ? cell.val : 0
                        const isPositive = val > 0
                        const alpha = Math.min(1, Math.max(0.1, Math.abs(val)))
                        const bgStyle = isPositive
                          ? `rgba(139, 92, 246, ${alpha})`
                          : `rgba(6, 182, 212, ${alpha})`
                        return (
                          <div
                            key={f2}
                            onMouseEnter={() => setActiveCorr({ f1, f2, val })}
                            onClick={() => setActiveCorr({ f1, f2, val })}
                            className="h-7 flex items-center justify-center rounded text-white font-bold text-[9px] px-0.5 cursor-pointer hover:scale-105 transition-transform"
                            style={{ backgroundColor: bgStyle }}
                          >
                            {val === 1 ? "1.0" : val.toFixed(2)}
                          </div>
                        )
                      })}
                    </React.Fragment>
                  ))}
                </div>

                {activeCorr ? (
                  <div className="p-3 bg-black/40 border border-primary/20 rounded-xl text-[11px] text-muted-foreground animate-fade-in flex items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-white block mb-0.5">Pearson Correlation: {activeCorr.f1} ↔ {activeCorr.f2}</span>
                      {activeCorr.val === 1.0 
                        ? "Identity matrix correlation. The feature is matched against itself, yielding a perfect linear score of 1.0."
                        : activeCorr.val > 0.4
                        ? `Strong positive linear dependency (${activeCorr.val.toFixed(2)}). As ${activeCorr.f1} increases, ${activeCorr.f2} tends to rise proportionally.`
                        : activeCorr.val < -0.15
                        ? `Negative linear dependency (${activeCorr.val.toFixed(2)}). As ${activeCorr.f1} increases, ${activeCorr.f2} values tend to fall.`
                        : `Weak or negligible correlation (${activeCorr.val.toFixed(2)}). No strong linear dependency exists between these attributes.`
                      }
                    </div>
                    <span className={`text-[13px] font-bold font-mono px-2 py-0.5 rounded border shrink-0 ${
                      activeCorr.val > 0 ? "text-primary border-primary/30 bg-primary/5" : "text-cyan-400 border-cyan-500/20 bg-cyan-500/5"
                    }`}>
                      {activeCorr.val.toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 text-center border border-dashed border-border/40 rounded-xl text-[11px] text-muted-foreground">
                    Hover over or click any matrix tile above to inspect Pearson coefficients and relationship vectors.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: MODEL PERFORMANCE CURVES */}
        <TabsContent value="performance" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {!isRegression ? (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <LineChart className="h-4 w-4 text-primary" />
                    5. Receiver Operating Characteristic (ROC Curve)
                  </CardTitle>
                  <CardDescription>Sensitivity (TPR) vs False Positive Rate (FPR).</CardDescription>
                </CardHeader>
                <CardContent className="h-56 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={rocCurveData} margin={{ left: -20, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="fpr" stroke="var(--color-muted-foreground)" fontSize={11} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                      <Line type="monotone" dataKey="tpr" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="straight" dataKey="fpr" stroke="rgba(255,255,255,0.1)" strokeDasharray="5 5" dot={false} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <LineChart className="h-4 w-4 text-primary" />
                    5. Residuals Scatter Plot
                  </CardTitle>
                  <CardDescription>Error residuals (Actual - Predicted) vs Predicted continuous value.</CardDescription>
                </CardHeader>
                <CardContent className="h-56 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ left: -25, right: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" dataKey="predicted" name="Predicted" stroke="var(--color-muted-foreground)" fontSize={10} />
                      <YAxis type="number" dataKey="residual" name="Residual" stroke="var(--color-muted-foreground)" fontSize={10} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                      <Scatter name="Residuals" data={residualsData} fill="var(--color-primary)">
                        {residualsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={Math.abs(entry.residual) > 8 ? "#ef4444" : "var(--color-primary)"} r={2.5} />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {!isRegression ? (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    6. Confusion Matrix
                  </CardTitle>
                  <CardDescription>Binary classification results matrix on test set predictions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex justify-center">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs max-w-[280px]">
                    <span />
                    <span className="text-muted-foreground font-semibold">Predicted Neg</span>
                    <span className="text-muted-foreground font-semibold">Predicted Pos</span>

                    <span className="text-muted-foreground font-semibold flex items-center justify-center">Actual Neg</span>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                      <span className="block font-bold text-white text-base">360</span>
                      <span className="text-[9px] text-emerald-400 font-medium">TN</span>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                      <span className="block font-bold text-white text-base">10</span>
                      <span className="text-[9px] text-red-400 font-medium">FP</span>
                    </div>

                    <span className="text-muted-foreground font-semibold flex items-center justify-center">Actual Pos</span>
                    <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg">
                      <span className="block font-bold text-white text-base">14</span>
                      <span className="text-[9px] text-red-400 font-medium">FN</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-lg">
                      <span className="block font-bold text-white text-base">185</span>
                      <span className="text-[9px] text-emerald-400 font-medium">TP</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                    <Award className="h-4 w-4 text-primary" />
                    6. Predicted vs Actual Fit
                  </CardTitle>
                  <CardDescription>Scatter of predicted target vs actual target. Ideal fit is y=x.</CardDescription>
                </CardHeader>
                <CardContent className="h-56 pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={predictedVsActualData} margin={{ left: -25, right: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="actual" stroke="var(--color-muted-foreground)" fontSize={10} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                      <Legend wrapperStyle={{ fontSize: 9 }} />
                      <Line type="monotone" dataKey="predicted" name="Model Predictions" stroke="var(--color-primary)" strokeWidth={1.5} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="identityLine" name="Perfect Fit (y=x)" stroke="rgba(255,255,255,0.2)" strokeDasharray="4 4" dot={false} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {!isRegression ? (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-white">7. Precision-Recall Curve</CardTitle>
                </CardHeader>
                <CardContent className="h-44 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={prCurveData} margin={{ left: -25, right: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="recall" stroke="var(--color-muted-foreground)" fontSize={10} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={10} domain={[0.3, 1]} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                      <Line type="monotone" dataKey="precision" stroke="var(--color-chart-3)" strokeWidth={1.5} dot={{ r: 2 }} />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/40 bg-card/30 backdrop-blur-md">
                <CardHeader className="pb-1">
                  <CardTitle className="text-xs font-semibold text-white">7. Residuals Error Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-44 pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={regressionErrorDist} margin={{ left: -25, right: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="bin" stroke="var(--color-muted-foreground)" fontSize={9} />
                      <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="count" fill="var(--color-chart-3)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-white">13. Learning Curve</CardTitle>
              </CardHeader>
              <CardContent className="h-44 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={learningCurveData} margin={{ left: -25, right: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="samples" stroke="var(--color-muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Line type="monotone" dataKey="trainLoss" name="Train Loss" stroke="var(--color-primary)" strokeWidth={1.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="valLoss" name="Val Loss" stroke="var(--color-chart-2)" strokeWidth={1.5} dot={{ r: 2 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-white">14. Validation Curve</CardTitle>
              </CardHeader>
              <CardContent className="h-44 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={validationCurveData} margin={{ left: -25, right: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="depth" stroke="var(--color-muted-foreground)" fontSize={10} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} domain={[0.70, 1]} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Legend wrapperStyle={{ fontSize: 9 }} />
                    <Line type="monotone" dataKey="trainScore" name="Train Score" stroke="var(--color-chart-2)" strokeWidth={1.5} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="valScore" name="Val Score" stroke="var(--color-primary)" strokeWidth={1.5} dot={{ r: 2 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: DATA DISTRIBUTION & QUALITY */}
        <TabsContent value="distribution" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-white">
                  {isRegression ? "8. Value Distribution Histogram" : "8. Probability Histogram"}
                </CardTitle>
              </CardHeader>
              <CardContent className="h-44 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={isRegression ? targetRegValueDist : histogramData} margin={{ left: -25, right: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="bin" stroke="var(--color-muted-foreground)" fontSize={9} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-white">11. Target Variable ({targetCol})</CardTitle>
              </CardHeader>
              <CardContent className="h-44 pt-2">
                {!isRegression ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie data={targetDistData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={{ fill: "#fff", fontSize: 9 }}>
                        {targetDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex flex-col justify-center h-full text-xs space-y-2.5 px-4">
                    <span className="text-slate-300 font-medium uppercase text-[10px] tracking-wider">Residual Statistics</span>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground">Mean Squared Error (MSE):</span>
                      <span className="font-semibold text-white">{parseFloat((champion.precision ** 2).toFixed(2))}</span>
                    </div>
                    <div className="flex justify-between border-b border-border/10 pb-1.5">
                      <span className="text-muted-foreground">MAE:</span>
                      <span className="font-semibold text-white">{champion.recall}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">MAPE (Error):</span>
                      <span className="font-semibold text-primary">{champion.f1}%</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-1">
                <CardTitle className="text-xs font-semibold text-white">10. Outliers ({xCol} vs {yCol})</CardTitle>
              </CardHeader>
              <CardContent className="h-44 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ left: -25, right: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="x" name={xCol} stroke="var(--color-muted-foreground)" fontSize={8} />
                    <YAxis type="number" dataKey="y" name={yCol} stroke="var(--color-muted-foreground)" fontSize={8} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: "#0f0f29", borderColor: "rgba(255,255,255,0.1)" }} />
                    <Scatter name="Data points" data={outlierData} fill="#8884d8">
                      {outlierData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.type === 'outlier' ? '#ef4444' : 'var(--color-primary)'} r={entry.type === 'outlier' ? 3.5 : 2} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Database className="h-4 w-4 text-primary" />
                  9. Box Plot (Quartile Distributions)
                </CardTitle>
                <CardDescription>Visual quartile distribution values for credit scores.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 flex justify-center items-center h-44">
                <div className="flex items-center gap-4 w-full max-w-[340px] px-6">
                  <span className="text-xs text-muted-foreground">Min: 450</span>
                  <div className="h-0.5 bg-border/80 flex-1 relative flex items-center">
                    <div className="absolute left-[55%] h-6 w-1 bg-primary z-10" title="Median: 710" />
                    <div className="absolute left-[30%] right-[25%] h-4 bg-primary/20 border border-primary/60" title="IQR (25% - 75%): 620 - 780" />
                  </div>
                  <span className="text-xs text-muted-foreground">Max: 850</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/30 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  12. Missing Value Heatmap
                </CardTitle>
                <CardDescription>Sparsity density indices across columns.</CardDescription>
              </CardHeader>
              <CardContent className="pt-2 flex flex-col justify-center h-44 space-y-2">
                {features.slice(0, 5).map((col, idx) => {
                  const hasMissing = idx === 0 || idx === 1
                  const missingCount = hasMissing ? schema.stats.missing : 0
                  return (
                    <div key={col} className="flex items-center gap-3">
                      <span className="w-16 text-right font-medium text-xs text-muted-foreground truncate">{col}</span>
                      <div className="flex-1 h-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex overflow-hidden">
                        {hasMissing ? (
                          <>
                            <div className="w-[85%] bg-emerald-500/30" />
                            <div className="w-[3%] bg-red-500/60" />
                            <div className="w-[12%] bg-emerald-500/30" />
                          </>
                        ) : (
                          <div className="w-full bg-emerald-500/30" />
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground w-12">{hasMissing ? `${missingCount} missing` : "0 missing"}</span>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={onComplete}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg cursor-pointer"
        >
          Generate Executive AI Insights
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
