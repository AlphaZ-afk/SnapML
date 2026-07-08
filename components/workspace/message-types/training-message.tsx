"use client";

import { Cpu, Loader2, CheckCircle2, Clock, Zap } from "lucide-react";

interface ModelInfo {
  name: string;
  status: string;
  progress: number;
  metrics: {
    accuracy?: number;
    f1?: number;
    [key: string]: any;
  };
}

interface TrainingMessageProps {
  metadata: {
    models: ModelInfo[];
  };
}

function StatusIndicator({ status }: { status: string }) {
  switch (status) {
    case "running":
      return (
        <Loader2 className="w-4 h-4 text-violet-400 animate-spin shrink-0" />
      );
    case "completed":
      return (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
      );
    case "queued":
    default:
      return <Clock className="w-4 h-4 text-white/30 shrink-0" />;
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "running":
      return (
        <span className="text-[10px] font-medium text-violet-400/90 uppercase tracking-wider">
          Training…
        </span>
      );
    case "completed":
      return (
        <span className="text-[10px] font-medium text-emerald-400/90 uppercase tracking-wider">
          Completed
        </span>
      );
    case "queued":
    default:
      return (
        <span className="text-[10px] font-medium text-white/30 uppercase tracking-wider">
          Queued
        </span>
      );
  }
}

function ModelCard({ model }: { model: ModelInfo }) {
  const isRunning = model.status === "running";
  const isCompleted = model.status === "completed";
  const isQueued = model.status === "queued";

  const cardClasses = [
    "relative rounded-xl p-4 border transition-all duration-500",
    "bg-gradient-to-br from-white/[0.03] to-white/[0.01]",
    isRunning &&
      "border-violet-500/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]",
    isCompleted && "border-emerald-500/10",
    isQueued && "border-white/5 opacity-50",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClasses}>
      {/* Running glow pulse */}
      {isRunning && (
        <div className="absolute inset-0 rounded-xl bg-violet-500/[0.03] animate-pulse pointer-events-none" />
      )}

      <div className="relative space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIndicator status={model.status} />
            <span className="text-sm font-medium text-white/85 truncate">
              {model.name}
            </span>
          </div>
          {statusLabel(model.status)}
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/30 font-medium">
              Progress
            </span>
            <span className="text-[10px] text-white/50 font-mono tabular-nums">
              {Math.round(model.progress)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-1000 ease-out"
              style={{ width: `${model.progress}%` }}
            >
              {isRunning && (
                <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </div>
          </div>
        </div>

        {/* Metrics (only for completed) */}
        {isCompleted && model.metrics && (
          <div className="flex items-center gap-4 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-500">
            {model.metrics.accuracy !== undefined && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-400/70" />
                <span className="text-[11px] text-white/50">
                  Accuracy{" "}
                  <span className="text-white/80 font-mono font-medium">
                    {(model.metrics.accuracy * 100).toFixed(1)}%
                  </span>
                </span>
              </div>
            )}
            {model.metrics.f1 !== undefined && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-cyan-400/70" />
                <span className="text-[11px] text-white/50">
                  F1{" "}
                  <span className="text-white/80 font-mono font-medium">
                    {model.metrics.f1.toFixed(3)}
                  </span>
                </span>
              </div>
            )}
            {model.metrics.rmse !== undefined && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-rose-400/70" />
                <span className="text-[11px] text-white/50">
                  RMSE{" "}
                  <span className="text-white/80 font-mono font-medium">
                    {model.metrics.rmse.toFixed(3)}
                  </span>
                </span>
              </div>
            )}
            {model.metrics.r2 !== undefined && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-400/70" />
                <span className="text-[11px] text-white/50">
                  R²{" "}
                  <span className="text-white/80 font-mono font-medium">
                    {model.metrics.r2.toFixed(3)}
                  </span>
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function TrainingMessage({ metadata }: TrainingMessageProps) {
  const { models } = metadata;

  return (
    <div className="bg-gradient-to-br from-blue-500/5 to-violet-500/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-violet-500/10">
          <Cpu className="w-4.5 h-4.5 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">
          🤖 Training Models
        </h3>
        <span className="ml-auto text-[10px] text-white/30 font-medium tabular-nums">
          {models.filter((m) => m.status === "completed").length}/{models.length}{" "}
          complete
        </span>
      </div>

      {/* Model cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {models.map((model, index) => (
          <ModelCard key={`${model.name}-${index}`} model={model} />
        ))}
      </div>
    </div>
  );
}
