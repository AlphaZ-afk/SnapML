import { UploadCloud, Network, BarChart3, Rocket, type LucideIcon } from "lucide-react"

type Feature = {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  { icon: UploadCloud, title: "Upload Data", description: "CSV, Excel, or Database" },
  { icon: Network, title: "Train Model", description: "AutoML in Action" },
  { icon: BarChart3, title: "Evaluate", description: "Compare & Optimize" },
  { icon: Rocket, title: "Deploy", description: "API in One Click" },
]

export function FeatureCards() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-xl border border-border bg-card/60 p-6 transition-colors hover:border-primary/50 hover:bg-card"
          >
            <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
