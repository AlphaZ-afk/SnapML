"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  Cpu,
  Globe,
  Zap,
  TrendingUp,
  Timer,
  Server,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface TimelineEntry {
  time: string;
  event: string;
  done: boolean;
}

interface RightSidebarProps {
  phase: string;
  trainingProgress: number;
  activeModel: string;
  timeline: TimelineEntry[];
}

// ── Circular Progress Ring ──────────────────────────────────────────────
function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 3.5,
}: {
  progress: number;
  size?: number;
  strokeWidth?: number;
}) {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <svg
      width={size}
      height={size}
      className="transform -rotate-90"
      viewBox={`0 0 ${size} ${size}`}
    >
      {/* Background track */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc */}
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Animated Status Bar ─────────────────────────────────────────────────
function StatusBar({
  value,
  max,
  label,
  displayValue,
}: {
  value: number;
  max: number;
  label: string;
  displayValue: string;
}) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const pct = (value / max) * 100;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedWidth(pct), 150);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className="text-[10px] font-medium text-white/80">
          {displayValue}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 transition-all duration-700 ease-out"
          style={{ width: `${animatedWidth}%` }}
        />
      </div>
    </div>
  );
}

// ── Agents config ───────────────────────────────────────────────────────
const AGENTS = [
  { name: "Data Engineer", activePhases: ["ingestion", "preprocessing", "data_loading"] },
  { name: "ML Trainer", activePhases: ["training", "fine_tuning", "hyperparameter_tuning"] },
  { name: "Evaluator", activePhases: ["evaluation", "validation", "testing"] },
];

// ── Main Component ──────────────────────────────────────────────────────
export function RightSidebar({
  phase,
  trainingProgress,
  activeModel,
  timeline,
}: RightSidebarProps) {
  const isActive = phase !== "idle";

  return (
    <aside
      className="h-screen w-[280px] flex-shrink-0 overflow-y-auto
        bg-card/10 backdrop-blur-2xl border-l border-white/5 p-4
        flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/5"
    >
      {/* ── 1. Current Task ─────────────────────────────────────────── */}
      <Card
        className={`bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-3
          transition-all duration-500
          ${isActive ? "shadow-[0_0_15px_rgba(139,92,246,0.1)]" : ""}`}
      >
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Current Task
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Pulse dot */}
            <span className="relative flex h-2 w-2">
              {isActive && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
              <span
                className={`relative inline-flex h-2 w-2 rounded-full transition-colors duration-500
                  ${isActive ? "bg-emerald-400" : "bg-white/20"}`}
              />
            </span>
            <span className="text-xs font-medium text-white truncate">
              {isActive ? phase : "Idle"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* ── 2. Training Progress ────────────────────────────────────── */}
      <Card
        className={`bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-3
          transition-all duration-500
          ${trainingProgress > 0 ? "shadow-[0_0_15px_rgba(139,92,246,0.1)]" : ""}`}
      >
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Training Progress
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular ring */}
            <div className="relative flex-shrink-0">
              <ProgressRing progress={trainingProgress} />
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                {Math.round(trainingProgress)}%
              </span>
            </div>

            <div className="min-w-0 space-y-0.5">
              <p className="text-[10px] text-muted-foreground">Active Model</p>
              <p className="text-xs font-medium text-white truncate">
                {activeModel || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 3. Active Agents ────────────────────────────────────────── */}
      <Card className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-3 transition-all duration-500">
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Active Agents
            </span>
          </div>

          <div className="space-y-1.5">
            {AGENTS.map((agent) => {
              const agentActive = agent.activePhases.includes(
                phase.toLowerCase()
              );
              return (
                <div
                  key={agent.name}
                  className="flex items-center gap-2 px-1.5 py-1 rounded-md transition-colors duration-300
                    hover:bg-white/[0.03]"
                >
                  {/* Status dot */}
                  <span className="relative flex h-1.5 w-1.5">
                    {agentActive && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                    <span
                      className={`relative inline-flex h-1.5 w-1.5 rounded-full transition-colors duration-500
                        ${agentActive ? "bg-emerald-400" : "bg-white/20"}`}
                    />
                  </span>
                  <span
                    className={`text-[11px] transition-colors duration-500
                      ${agentActive ? "text-white font-medium" : "text-muted-foreground"}`}
                  >
                    {agent.name}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── 4. Project Timeline ─────────────────────────────────────── */}
      <Card className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-3 transition-all duration-500">
        <CardContent className="p-0 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              Project Timeline
            </span>
          </div>

          <div className="relative pl-3">
            {/* Vertical connector line */}
            <div className="absolute left-[4.5px] top-1 bottom-1 w-px bg-gradient-to-b from-violet-500/40 via-white/10 to-transparent" />

            <div className="space-y-2.5">
              {timeline.map((entry, i) => {
                const isLatest = i === timeline.length - 1;
                return (
                  <div key={i} className="relative flex items-start gap-2.5">
                    {/* Dot / Checkmark */}
                    <span
                      className={`relative z-10 mt-0.5 flex-shrink-0 flex items-center justify-center
                        h-2.5 w-2.5 rounded-full border transition-all duration-500
                        ${
                          entry.done
                            ? "bg-emerald-500 border-emerald-400"
                            : isLatest
                              ? "bg-violet-500 border-violet-400 shadow-[0_0_6px_rgba(139,92,246,0.5)]"
                              : "bg-white/10 border-white/20"
                        }`}
                    />

                    <div className="min-w-0 -mt-0.5">
                      <p
                        className={`text-[11px] leading-tight truncate transition-colors duration-300
                          ${isLatest ? "text-white font-medium" : entry.done ? "text-white/70" : "text-muted-foreground"}`}
                      >
                        {entry.event}
                      </p>
                      <p className="text-[9px] text-muted-foreground/60 mt-0.5">
                        {entry.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 5. System Status ────────────────────────────────────────── */}
      <Card className="bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-xl p-3 transition-all duration-500">
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center gap-2">
            <Server className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              System Status
            </span>
          </div>

          <StatusBar
            value={67}
            max={100}
            label="GPU Usage"
            displayValue="67%"
          />

          <StatusBar
            value={4.2}
            max={16}
            label="Memory"
            displayValue="4.2 GB / 16 GB"
          />

          <div className="flex items-center justify-between pt-0.5">
            <div className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">
                Cloud Cost
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400">
              $0.04/hr
            </span>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
