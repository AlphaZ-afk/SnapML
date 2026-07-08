import Image from "next/image"
import { BarChart3, LineChart, Table2, PieChart, TrendingUp, CircleCheck } from "lucide-react"

const featureIcons = [BarChart3, LineChart, Table2, PieChart]

function StageLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">{children}</span>
}

export function PipelineVisual() {
  return (
    <div className="relative aspect-[4/3] w-full">
      {/* Glowing neural network sphere (background, centered) */}
      <Image
        src="/network-sphere.png"
        alt="Glowing neural network sphere representing model training"
        fill
        priority
        className="select-none object-contain"
      />

      {/* Overlaid pipeline stages */}
      <div className="absolute inset-0 flex items-stretch justify-between gap-1 px-1 sm:px-2">
        {/* DATA */}
        <div className="flex w-1/5 flex-col items-center justify-center gap-3">
          <StageLabel>Data</StageLabel>
          <div className="relative h-28 w-16 sm:h-36 sm:w-20">
            <Image src="/data-grid.png" alt="Binary data input" fill className="select-none object-contain" />
          </div>
        </div>

        {/* FEATURES */}
        <div className="flex w-1/5 flex-col items-center justify-center gap-3">
          <StageLabel>Features</StageLabel>
          <div className="flex flex-col gap-2.5">
            {featureIcons.map((Icon, i) => (
              <div
                key={i}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm sm:h-12 sm:w-12"
              >
                <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        {/* MODEL TRAINING (label only; sphere sits behind) */}
        <div className="flex w-1/5 flex-col items-center pt-2">
          <StageLabel>
            <span className="block text-center leading-tight">Model</span>
            <span className="block text-center leading-tight">Training</span>
          </StageLabel>
        </div>

        {/* PREDICTIONS */}
        <div className="flex w-1/5 flex-col items-center justify-center gap-3">
          <StageLabel>Predictions</StageLabel>
          <div className="flex flex-col gap-2.5">
            {/* line chart + 0.89 */}
            <div className="flex h-11 w-14 items-center justify-center gap-1 rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm sm:h-12 sm:w-16">
              <TrendingUp className="h-4 w-4 text-accent" aria-hidden="true" />
              <span className="text-[10px] font-medium text-foreground">0.89</span>
            </div>
            {/* scatter dots */}
            <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm sm:h-12 sm:w-16">
              <div className="grid grid-cols-3 gap-1">
                {[0.9, 0.5, 0.7, 0.4, 0.85, 0.6].map((o, i) => (
                  <span key={i} className="h-1 w-1 rounded-full bg-primary" style={{ opacity: o }} />
                ))}
              </div>
            </div>
            {/* json */}
            <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 font-mono text-[11px] text-muted-foreground backdrop-blur-sm sm:h-12 sm:w-16">
              {"{ ... }"}
            </div>
            {/* check */}
            <div className="flex h-11 w-14 items-center justify-center rounded-lg border border-primary/30 bg-primary/5 backdrop-blur-sm sm:h-12 sm:w-16">
              <CircleCheck className="h-5 w-5 text-chart-3" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
