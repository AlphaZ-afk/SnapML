"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell } from "recharts"
import { BarChart3 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { featureImportances } from "@/lib/train-data"

export function FeatureImportanceCard() {
  const data = [...featureImportances].sort((a, b) => b.importance - a.importance)

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
          Feature importance
        </CardTitle>
        <CardDescription>Which inputs drive the champion model&apos;s predictions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24 }}>
              <XAxis type="number" domain={[0, "dataMax"]} hide />
              <YAxis
                type="category"
                dataKey="feature"
                width={120}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Bar dataKey="importance" radius={[0, 6, 6, 0]}>
                {data.map((entry, i) => (
                  <Cell
                    key={entry.feature}
                    fill={i === 0 ? "var(--color-primary)" : "var(--color-chart-2)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
