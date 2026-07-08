"use client"

import { Trophy, BarChart2, Zap, Hourglass, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  leaderboard: ModelLeaderboardItem[]
  champion: ModelLeaderboardItem
}

const statusStyles: Record<string, string> = {
  champion: "bg-primary/20 text-primary border-primary/45 font-bold animate-pulse shadow-[0_0_8px_rgba(139,92,246,0.2)]",
  tuned: "bg-cyan-500/10 text-cyan-400 border-cyan-500/35",
  baseline: "bg-slate-500/10 text-slate-400 border-slate-500/25",
}

export function StepChampion({ onComplete, schema, leaderboard, champion }: Props) {
  const isRegression = schema.problemType === "regression"

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          AutoML <span className="text-primary">Leaderboard</span> & Champion Model
        </h2>
        <p className="mt-3 text-muted-foreground animate-fade-in">
          Compare cross-validated metrics on <span className="text-white font-semibold">{schema.fileName}</span>. The optimal model has been designated as the Champion for predicting <span className="text-primary font-semibold">{schema.targetColumn}</span>.
        </p>
      </div>

      {/* Champion glow card */}
      <Card className="relative overflow-hidden border-2 border-primary/40 bg-gradient-to-br from-primary/15 via-card/50 to-accent/5 shadow-[0_0_25px_rgba(139,92,246,0.15)]">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Trophy className="h-44 w-44 text-primary" />
        </div>
        <CardHeader className="pb-4 border-b border-border/20">
          <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/45 shadow-[0_0_12px_rgba(139,92,246,0.2)]">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div>
                <span className="text-xs font-bold text-primary tracking-widest uppercase block">Selected Winner</span>
                <CardTitle className="text-white text-xl sm:text-2xl mt-0.5">{champion.name}</CardTitle>
              </div>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs py-1 px-3">
              Deploy Ready
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-black/30 p-4 rounded-xl border border-border/30 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">
                {isRegression ? "R² Score" : "Accuracy"}
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tabular-nums">{(champion.accuracy * 100).toFixed(1)}%</span>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-border/30 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">
                {isRegression ? "MAPE (Error)" : "F1 Score"}
              </span>
              <span className="text-2xl font-bold text-white mt-1 block tabular-nums">
                {isRegression ? `${champion.f1.toFixed(2)}%` : champion.f1.toFixed(3)}
              </span>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-border/30 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Inference Speed</span>
              <span className="text-2xl font-bold text-primary mt-1 block tabular-nums flex items-center justify-center gap-1">
                <Zap className="h-4.5 w-4.5 text-primary fill-primary" />
                {champion.inferenceTime}
              </span>
            </div>
            <div className="bg-black/30 p-4 rounded-xl border border-border/30 text-center">
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Training Cost</span>
              <span className="text-2xl font-bold text-white mt-1 block tabular-nums flex items-center justify-center gap-1">
                <Hourglass className="h-4.5 w-4.5 text-muted-foreground" />
                {champion.trainTime}
              </span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            <strong>Rationale:</strong> The tuned {champion.name} achieved the optimal evaluation scores during 5-fold cross validation on target label <span className="text-primary font-semibold">{schema.targetColumn}</span>. It demonstrates a strong {isRegression ? `R² value of ${champion.accuracy.toFixed(3)} and minimal RMSE of ${champion.precision}` : `F1 Score of ${champion.f1.toFixed(3)} and area under the ROC curve of ${champion.auc.toFixed(3)}`}. It maintains an ultra-low inference latency profile of {champion.inferenceTime}, satisfying strict production SLA limits.
          </p>

          <div className="pt-4 border-t border-border/10">
            <span className="text-xs font-bold text-white block mb-2 uppercase tracking-wider">Optimized Hyperparameters</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-black/45 p-3 rounded-lg border border-border/20">
              {champion.name.includes("XGBoost") && (
                <>
                  <div><span className="text-muted-foreground">n_estimators:</span> <span className="text-emerald-400 font-bold">{champion.accuracy === 0.969 ? "1000" : "100"}</span></div>
                  <div><span className="text-muted-foreground">learning_rate:</span> <span className="text-emerald-400 font-bold">0.05</span></div>
                  <div><span className="text-muted-foreground">max_depth:</span> <span className="text-emerald-400 font-bold">6</span></div>
                  <div><span className="text-muted-foreground">subsample:</span> <span className="text-emerald-400 font-bold">0.80</span></div>
                  <div><span className="text-muted-foreground">colsample_bytree:</span> <span className="text-emerald-400 font-bold">0.85</span></div>
                  <div><span className="text-muted-foreground">early_stopping:</span> <span className="text-emerald-400 font-bold">50 rounds</span></div>
                </>
              )}
              {champion.name.includes("LightGBM") && (
                <>
                  <div><span className="text-muted-foreground">n_estimators:</span> <span className="text-emerald-400 font-bold">800</span></div>
                  <div><span className="text-muted-foreground">learning_rate:</span> <span className="text-emerald-400 font-bold">0.03</span></div>
                  <div><span className="text-muted-foreground">num_leaves:</span> <span className="text-emerald-400 font-bold">31</span></div>
                  <div><span className="text-muted-foreground">min_data_in_leaf:</span> <span className="text-emerald-400 font-bold">20</span></div>
                  <div><span className="text-muted-foreground">feature_fraction:</span> <span className="text-emerald-400 font-bold">0.8</span></div>
                </>
              )}
              {champion.name.includes("CatBoost") && (
                <>
                  <div><span className="text-muted-foreground">iterations:</span> <span className="text-emerald-400 font-bold">1000</span></div>
                  <div><span className="text-muted-foreground">depth:</span> <span className="text-emerald-400 font-bold">6</span></div>
                  <div><span className="text-muted-foreground">learning_rate:</span> <span className="text-emerald-400 font-bold">0.05</span></div>
                  <div><span className="text-muted-foreground">l2_leaf_reg:</span> <span className="text-emerald-400 font-bold">3.0</span></div>
                  <div><span className="text-muted-foreground">bootstrap_type:</span> <span className="text-emerald-400 font-bold">MVS</span></div>
                </>
              )}
              {!champion.name.includes("XGBoost") && !champion.name.includes("LightGBM") && !champion.name.includes("CatBoost") && (
                <>
                  <div><span className="text-muted-foreground">max_iter:</span> <span className="text-emerald-400 font-bold">100</span></div>
                  <div><span className="text-muted-foreground">alpha:</span> <span className="text-emerald-400 font-bold">0.1</span></div>
                  <div><span className="text-muted-foreground">tol:</span> <span className="text-emerald-400 font-bold">1e-4</span></div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Table Card */}
      <Card className="border-border/40 bg-card/40 backdrop-blur-md overflow-hidden">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-white text-base">Model Leaderboard Comparison</CardTitle>
          </div>
          <CardDescription>Cross-validated model evaluations sorted by performance score.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-border/20 hover:bg-transparent">
                  <TableHead className="text-white font-semibold">Model Name</TableHead>
                  <TableHead className="text-right text-white font-semibold">{isRegression ? "R² Score" : "Accuracy"}</TableHead>
                  <TableHead className="text-right text-white font-semibold">{isRegression ? "RMSE" : "F1 Score"}</TableHead>
                  <TableHead className="text-right text-white font-semibold">{isRegression ? "MAE" : "Precision"}</TableHead>
                  <TableHead className="text-right text-white font-semibold">{isRegression ? "MAPE" : "Recall"}</TableHead>
                  <TableHead className="text-right text-white font-semibold">{isRegression ? "Validation CV" : "ROC AUC"}</TableHead>
                  <TableHead className="text-right text-white font-semibold">Latency</TableHead>
                  <TableHead className="text-right text-white font-semibold">Train Time</TableHead>
                  <TableHead className="text-center text-white font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((item, idx) => (
                  <TableRow
                    key={item.name}
                    className={`border-border/25 transition-colors hover:bg-white/5 ${
                      idx === 0 ? "bg-primary/5 hover:bg-primary/10" : ""
                    }`}
                  >
                    <TableCell className="font-semibold text-white">{item.name}</TableCell>
                    <TableCell className="text-right font-mono font-medium text-slate-100">{(item.accuracy * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right font-mono text-slate-200">
                      {isRegression ? item.precision.toFixed(3) : item.f1.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {isRegression ? item.recall.toFixed(3) : item.precision.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">
                      {isRegression ? `${item.f1.toFixed(2)}%` : item.recall.toFixed(3)}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-300">{item.auc.toFixed(3)}</TableCell>
                    <TableCell className="text-right font-mono text-primary font-bold">{item.inferenceTime}</TableCell>
                    <TableCell className="text-right font-mono text-slate-400">{item.trainTime}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={`capitalize text-[10px] font-semibold border ${statusStyles[item.status]}`}>
                        {item.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={onComplete}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg cursor-pointer"
        >
          View Model Explainability Suite
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
