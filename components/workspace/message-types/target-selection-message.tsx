"use client"

import { useState } from "react"
import { Crosshair, ChevronRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TargetSelectionMessageProps {
  metadata: {
    headers: string[]
  }
  onSelect: (target: string) => void
}

export function TargetSelectionMessage({ metadata, onSelect }: TargetSelectionMessageProps) {
  const { headers } = metadata
  const [selected, setSelected] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = () => {
    if (selected && !isSubmitted) {
      setIsSubmitted(true)
      onSelect(selected)
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10 rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30">
          <Crosshair className="w-4 h-4 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white/90">Select Target Column</h3>
          <p className="text-xs text-white/50 mt-0.5">Which column would you like to predict?</p>
        </div>
      </div>

      {/* Chips */}
      <div className="flex flex-wrap gap-2 pt-2">
        {headers.map((header) => {
          const isSelected = selected === header
          return (
            <button
              key={header}
              disabled={isSubmitted}
              onClick={() => setSelected(header)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-indigo-400"
                  : isSubmitted 
                    ? "bg-white/5 text-white/20 border border-transparent cursor-not-allowed"
                    : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10 hover:border-white/20"
              }`}
            >
              {header}
            </button>
          )
        })}
      </div>

      {/* Action */}
      {!isSubmitted && (
        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!selected}
            className={`h-8 px-4 rounded-lg text-xs font-medium transition-all ${
              selected
                ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                : "bg-white/10 text-white/30 cursor-not-allowed"
            }`}
          >
            Confirm Target <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      )}

      {isSubmitted && (
        <div className="flex justify-end pt-2">
          <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Target Locked
          </div>
        </div>
      )}
    </div>
  )
}
