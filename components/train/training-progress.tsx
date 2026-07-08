"use client"

import { useEffect, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const steps = [
  "Ingesting & validating dataset",
  "Cleaning and engineering features",
  "Training candidate models (AutoML)",
  "Tuning & optimizing hyperparameters",
  "Selecting champion model",
]

type Props = {
  onDone: () => void
}

export function TrainingProgress({ onDone }: Props) {
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (active >= steps.length) {
      const t = setTimeout(onDone, 600)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setActive((a) => a + 1), 1100)
    return () => clearTimeout(t)
  }, [active, onDone])

  const progress = Math.min(100, Math.round((active / steps.length) * 100))

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Training in progress</h1>
        <p className="mt-3 text-muted-foreground">
          SnapML is building, tuning and comparing models for you.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Overall progress</span>
              <span className="font-medium text-primary">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>

          <ul className="space-y-3">
            {steps.map((step, i) => {
              const done = i < active
              const current = i === active
              return (
                <li key={step} className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border",
                      done && "border-primary bg-primary text-primary-foreground",
                      current && "border-primary text-primary",
                      !done && !current && "border-border text-muted-foreground",
                    )}
                  >
                    {done ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : current ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <span className="text-xs">{i + 1}</span>
                    )}
                  </span>
                  <span className={cn("text-sm", done || current ? "text-foreground" : "text-muted-foreground")}>
                    {step}
                  </span>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
