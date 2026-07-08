import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PipelineVisual } from "@/components/pipeline-visual"

export function HeroSection({ onStartTraining }: { onStartTraining?: () => void }) {
  return (
    <section className="mx-auto max-w-7xl px-6 pt-10 pb-16 lg:pt-16">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        {/* Left: copy */}
        <div className="max-w-xl">

          <h1 className="text-5xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
            Your AI <span className="text-primary">Machine Learning</span> Engineer
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-muted-foreground text-pretty">
            Upload a dataset, tell SnapML what to predict, and watch your AI engineer build, train, evaluate, and deploy production-ready models — all from a single conversation.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              onClick={onStartTraining}
              size="lg"
              className="gap-2 rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 cursor-pointer"
            >
              Start Building
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-lg border-border bg-transparent font-medium hover:bg-secondary"
            >
              Book a demo
            </Button>
          </div>

          <p className="mt-5 text-sm text-muted-foreground">Unlimited free training with SnapML</p>
        </div>

        {/* Right: pipeline visualization */}
        <div className="relative">
          <PipelineVisual />
        </div>
      </div>
    </section>
  )
}
