"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts"
import { Trophy, LineChart as LineChartIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { modelResults, performanceHistory } from "@/lib/train-data"

const statusStyles: Record<string, string> = {
  champion: "bg-primary/15 text-primary border-primary/30",
  tuned: "bg-accent/15 text-accent border-accent/30",
  baseline: "bg-muted text-muted-foreground border-border",
}

export function ModelPerformanceCard() {
  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          Best model performance
        </CardTitle>
        <CardDescription>Every model SnapML trained, tuned and compared for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={performanceHistory} margin={{ left: -12, right: 12, top: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis
                dataKey="round"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <YAxis
                domain={[0.8, 1]}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "var(--color-muted-foreground)", fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                dot={{ r: 4, fill: "var(--color-primary)" }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Accuracy</TableHead>
                <TableHead className="text-right">F1</TableHead>
                <TableHead className="text-right">Precision</TableHead>
                <TableHead className="text-right">Recall</TableHead>
                <TableHead className="text-right">Train time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {modelResults.map((m) => (
                <TableRow key={m.name}>
                  <TableCell className="font-medium">
                    <span className="flex items-center gap-1.5">
                      {m.status === "champion" && (
                        <Trophy className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                      )}
                      {m.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{(m.accuracy * 100).toFixed(1)}%</TableCell>
                  <TableCell className="text-right tabular-nums">{m.f1.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.precision.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums">{m.recall.toFixed(3)}</TableCell>
                  <TableCell className="text-right tabular-nums text-muted-foreground">{m.trainTime}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusStyles[m.status]}>
                      {m.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
