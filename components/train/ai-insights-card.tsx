import { Sparkles, Database, Columns3, Target, Wand2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { aiInsights, datasetSummary } from "@/lib/train-data"

const stats = [
  { label: "Rows", value: datasetSummary.rows.toLocaleString(), icon: Database },
  { label: "Columns", value: String(datasetSummary.columns), icon: Columns3 },
  { label: "Target", value: datasetSummary.target, icon: Target },
  { label: "Missing handled", value: String(datasetSummary.missingHandled), icon: Wand2 },
]

export function AiInsightsCard() {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          AI insights
        </CardTitle>
        <CardDescription>A plain-language summary of your model and dataset.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-background/40 p-3">
              <s.icon className="h-4 w-4 text-accent" aria-hidden="true" />
              <p className="mt-2 text-xs text-muted-foreground">{s.label}</p>
              <p className="truncate text-sm font-semibold">{s.value}</p>
            </div>
          ))}
        </div>

        <ul className="space-y-3">
          {aiInsights.map((insight) => (
            <li key={insight} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span>{insight}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
