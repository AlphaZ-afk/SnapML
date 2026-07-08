"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Circle,
  ListChecks,
  ThumbsUp,
  ThumbsDown,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanMessageProps {
  metadata: {
    steps: string[];
    datasetInfo: any;
  };
  onApprove?: () => void;
}

export function PlanMessage({ metadata, onApprove }: PlanMessageProps) {
  const { steps } = metadata;
  const [visibleCount, setVisibleCount] = useState(0);
  const [filledSteps, setFilledSteps] = useState<Set<number>>(new Set());
  const [approved, setApproved] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  // Stagger each step appearing with 150ms delay
  useEffect(() => {
    if (visibleCount < steps.length) {
      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 150);
      return () => clearTimeout(timer);
    } else {
      // All steps visible — show buttons after a brief pause
      const timer = setTimeout(() => setShowButtons(true), 300);
      return () => clearTimeout(timer);
    }
  }, [visibleCount, steps.length]);

  // Fill each circle green shortly after it appears
  useEffect(() => {
    if (visibleCount > 0) {
      const stepIndex = visibleCount - 1;
      const timer = setTimeout(() => {
        setFilledSteps((prev) => new Set(prev).add(stepIndex));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);

  const handleApprove = () => {
    setApproved(true);
    window.dispatchEvent(new CustomEvent("snapml-approve"));
    onApprove?.();
  };

  return (
    <div className="bg-gradient-to-br from-emerald-500/5 to-violet-500/5 border border-emerald-500/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
          <ListChecks className="w-4.5 h-4.5 text-emerald-400" />
        </div>
        <h3 className="text-sm font-semibold text-white/90 tracking-wide">
          📋 Execution Plan
        </h3>
      </div>

      {/* Steps checklist */}
      <div className="space-y-2.5 pl-1">
        {steps.map((step, index) => {
          const isVisible = index < visibleCount;
          const isFilled = filledSteps.has(index);

          return (
            <div
              key={index}
              className={`flex items-start gap-3 transition-all duration-500 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-3 pointer-events-none h-0 overflow-hidden"
              }`}
              style={{
                transitionDelay: isVisible ? "0ms" : `${index * 150}ms`,
              }}
            >
              <div className="mt-0.5 shrink-0 transition-all duration-500">
                {isFilled ? (
                  <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.4)] transition-all duration-300 scale-110" />
                ) : (
                  <Circle className="w-4.5 h-4.5 text-white/20 transition-all duration-300" />
                )}
              </div>
              <span
                className={`text-sm leading-relaxed transition-colors duration-500 ${
                  isFilled ? "text-white/80" : "text-white/40"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Approval state */}
      {approved && (
        <div className="flex items-center gap-2 pt-2 pl-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-medium text-emerald-400/90">
            Plan approved — executing…
          </span>
        </div>
      )}

      {/* Action buttons */}
      {showButtons && !approved && (
        <div className="flex items-center gap-2 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <Button
            size="sm"
            onClick={handleApprove}
            className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 rounded-xl px-4 h-9 text-xs font-medium shadow-[0_0_20px_rgba(52,211,153,0.15)] transition-all duration-300 hover:shadow-[0_0_25px_rgba(52,211,153,0.25)] cursor-pointer"
          >
            <ThumbsUp className="w-3.5 h-3.5 mr-1.5" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white/70 hover:text-white/90 rounded-xl px-4 h-9 text-xs font-medium transition-all duration-300 cursor-pointer"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Modify Plan
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-white/40 hover:text-red-400/80 hover:bg-red-500/5 rounded-xl px-4 h-9 text-xs font-medium transition-all duration-300 cursor-pointer"
          >
            <ThumbsDown className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>
        </div>
      )}
    </div>
  );
}
