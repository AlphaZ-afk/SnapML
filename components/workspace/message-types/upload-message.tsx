"use client";

import { useState, useEffect, useRef } from "react";
import {
  Database,
  Rows3,
  Columns3,
  HardDrive,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface UploadMetadata {
  name: string;
  rows: number;
  cols: number;
  headers: string[];
  missingPct: string;
  size: number;
}

interface UploadMessageProps {
  metadata: UploadMetadata;
}

function AnimatedCounter({
  target,
  duration = 1000,
  suffix = "",
}: {
  target: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isNumber = false,
  highlight = false,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  isNumber?: boolean;
  highlight?: boolean;
  delay?: number;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        group relative bg-white/[0.03] rounded-xl p-3 
        border border-white/[0.06] 
        transition-all duration-500 ease-out
        hover:bg-white/[0.06] hover:border-white/[0.12] hover:scale-[1.02]
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}
      `}
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500/0 to-blue-500/0 group-hover:from-violet-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

      <div className="relative flex items-start gap-3">
        <div
          className={`
            mt-0.5 p-1.5 rounded-lg 
            ${highlight ? "bg-amber-500/10 text-amber-400" : "bg-violet-500/10 text-violet-400"}
            transition-colors duration-300
          `}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={`
              text-2xl font-bold tracking-tight leading-none
              ${highlight ? "text-amber-400" : "text-white/90"}
            `}
          >
            {isNumber ? (
              <AnimatedCounter target={value as number} />
            ) : (
              <span>{value}</span>
            )}
          </div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1.5 font-medium">
            {label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function UploadMessage({ metadata }: UploadMessageProps) {
  const { name, rows, cols, headers, missingPct, size } = metadata;
  const [showPills, setShowPills] = useState(false);
  const missingValue = parseFloat(missingPct);
  const isHighMissing = missingValue > 5;

  const sizeInKB = (size / 1024).toFixed(1);

  useEffect(() => {
    const timer = setTimeout(() => setShowPills(true), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-violet-500/5 to-blue-500/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md max-w-md w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative p-2 rounded-xl bg-violet-500/10 border border-violet-500/20">
          <FileSpreadsheet className="w-5 h-5 text-violet-400" />
          <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white/90 truncate">
            {name}
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Dataset uploaded successfully
          </p>
        </div>
        <Database className="w-4 h-4 text-muted-foreground/40" />
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          icon={Rows3}
          label="Rows"
          value={rows}
          isNumber
          delay={100}
        />
        <StatCard
          icon={Columns3}
          label="Columns"
          value={cols}
          isNumber
          delay={200}
        />
        <StatCard
          icon={HardDrive}
          label="Size"
          value={`${sizeInKB} KB`}
          delay={300}
        />
        <StatCard
          icon={AlertTriangle}
          label="Missing Values"
          value={`${missingPct}%`}
          highlight={isHighMissing}
          delay={400}
        />
      </div>

      {/* Column Pills */}
      {headers.length > 0 && (
        <div className="mt-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-2.5">
            Columns
          </div>
          <div className="flex flex-wrap gap-1.5">
            {headers.map((header, index) => (
              <span
                key={header}
                className={`
                  inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium
                  bg-white/[0.04] text-white/60 border border-white/[0.06]
                  hover:bg-white/[0.08] hover:text-white/80 hover:border-white/[0.12]
                  transition-all duration-300 cursor-default
                  ${showPills ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
                `}
                style={{
                  transitionDelay: showPills ? `${index * 40}ms` : "0ms",
                }}
              >
                {header}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadMessage;
