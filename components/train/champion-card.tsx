import { Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { champion } from "@/lib/train-data"

const metrics = [
  { label: "Accuracy", value: `${(champion.accuracy * 100).toFixed(1)}%` },
  { label: "F1 score", value: champion.f1.toFixed(3) },
  { label: "Precision", value: champion.precision.toFixed(3) },
  { label: "Recall", value: champion.recall.toFixed(3) },
]

export function ChampionCard() {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/10 to-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
          Champion model
        </CardTitle>
        <CardDescription>The best performer across all trained, tuned and optimized models.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground">Selected algorithm</p>
          <p className="text-2xl font-bold text-primary">{champion.name}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-border/60 bg-background/40 p-4">
              <p className="text-xs text-muted-foreground">{m.label}</p>
              <p className="mt-1 text-xl font-semibold tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
