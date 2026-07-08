"use client"

import { useRef, useState } from "react"
import { UploadCloud, Database, FileSpreadsheet, KeyRound, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = {
  onStart: () => void
}

export function DataSourceStep({ onStart }: Props) {
  const [source, setSource] = useState<"upload" | "kaggle">("upload")
  const [fileName, setFileName] = useState<string | null>(null)
  const [targetColumn, setTargetColumn] = useState("")
  const [kaggle, setKaggle] = useState({ username: "", apiKey: "", url: "" })
  const inputRef = useRef<HTMLInputElement>(null)

  const canStart =
    targetColumn.trim().length > 0 &&
    (source === "upload"
      ? Boolean(fileName)
      : kaggle.username.trim() && kaggle.apiKey.trim() && kaggle.url.trim())

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Train your first <span className="text-primary">model</span>
        </h1>
        <p className="mt-3 text-muted-foreground text-pretty">
          Upload a dataset or pull one straight from Kaggle, choose your target column, and SnapML handles the rest.
        </p>
      </div>

      <Card className="border-border/60 bg-card/60">
        <CardHeader>
          <CardTitle>Data source</CardTitle>
          <CardDescription>Point SnapML at the data you want to learn from.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={source} onValueChange={(v) => setSource(v as "upload" | "kaggle")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload" className="gap-2">
                <UploadCloud className="h-4 w-4" aria-hidden="true" />
                Upload dataset
              </TabsTrigger>
              <TabsTrigger value="kaggle" className="gap-2">
                <Database className="h-4 w-4" aria-hidden="true" />
                Fetch from Kaggle
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-6">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-6 py-12 text-center transition-colors hover:border-primary/60 hover:bg-secondary/70"
              >
                {fileName ? (
                  <>
                    <FileSpreadsheet className="h-9 w-9 text-primary" aria-hidden="true" />
                    <span className="font-medium">{fileName}</span>
                    <span className="text-sm text-muted-foreground">Click to choose a different file</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="h-9 w-9 text-primary" aria-hidden="true" />
                    <span className="font-medium">Drop your file or click to browse</span>
                    <span className="text-sm text-muted-foreground">CSV, Excel, or a database export</span>
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json"
                className="hidden"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
              />
            </TabsContent>

            <TabsContent value="kaggle" className="mt-6 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="kaggle-username">Kaggle username</Label>
                  <Input
                    id="kaggle-username"
                    placeholder="your-username"
                    value={kaggle.username}
                    onChange={(e) => setKaggle((k) => ({ ...k, username: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kaggle-key" className="flex items-center gap-1.5">
                    <KeyRound className="h-3.5 w-3.5" aria-hidden="true" />
                    Kaggle API key
                  </Label>
                  <Input
                    id="kaggle-key"
                    type="password"
                    placeholder="••••••••••••"
                    value={kaggle.apiKey}
                    onChange={(e) => setKaggle((k) => ({ ...k, apiKey: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="kaggle-url">Dataset URL</Label>
                <Input
                  id="kaggle-url"
                  placeholder="https://www.kaggle.com/datasets/owner/dataset-name"
                  value={kaggle.url}
                  onChange={(e) => setKaggle((k) => ({ ...k, url: e.target.value }))}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="target-column">Target column</Label>
            <Input
              id="target-column"
              placeholder="The column you want the model to predict, e.g. will_churn"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">This is what SnapML learns to predict.</p>
          </div>

          <Button
            size="lg"
            disabled={!canStart}
            onClick={onStart}
            className="w-full gap-2 rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
          >
            Start training
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
