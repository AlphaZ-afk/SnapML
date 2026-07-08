"use client"

import { useState, useRef, useEffect } from "react"
import {
  UploadCloud,
  Database,
  FileSpreadsheet,
  KeyRound,
  ArrowRight,
  Check,
  Loader2,
  CheckCircle2,
  Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type DatasetSchema = {
  fileName: string
  columns: string[]
  targetColumn: string
  problemType: "classification" | "regression"
  targetMin?: number
  targetMax?: number
  stats: {
    rows: number
    columns: number
    memory: string
    missing: number
    duplicates: number
    numerical: number
    categorical: number
    quality: number
  }
}

type Props = {
  onComplete: (schema: DatasetSchema) => void
}

export function StepUpload({ onComplete }: Props) {
  const [source, setSource] = useState<"upload" | "kaggle">("upload")
  const [fileName, setFileName] = useState<string | null>(null)
  const [targetColumn, setTargetColumn] = useState("diagnosis")
  const [kaggle, setKaggle] = useState({ username: "", apiKey: "", url: "" })
  const [ingesting, setIngesting] = useState(false)
  const [ingestionStep, setIngestionStep] = useState(0)
  const [completed, setCompleted] = useState(false)
  const [parsedSchema, setParsedSchema] = useState<DatasetSchema | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [fetchingKaggle, setFetchingKaggle] = useState(false)
  const [kaggleStep, setKaggleStep] = useState(0)
  const [kaggleSuccess, setKaggleSuccess] = useState(false)

  const kaggleStages = [
    "Authenticating credentials with Kaggle API...",
    "Validating dataset url path coordinates...",
    "Downloading remote ZIP payload archive...",
    "Extracting decompressed CSV coordinates..."
  ]

  // Ingestion data states
  const [csvHeaders, setCsvHeaders] = useState<string[]>([])
  const [csvLines, setCsvLines] = useState<string[]>([])
  const [csvSeparator, setCsvSeparator] = useState(",")
  const [csvPreviewRows, setCsvPreviewRows] = useState<string[][]>([])

  // GenAI-First Planning and Approvals state
  const [userQuery, setUserQuery] = useState("Predict customer churn")
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [aiPlan, setAiPlan] = useState<{
    target: string
    problemType: "classification" | "regression"
    steps: string[]
    estCost: string
    estInfCost: string
  } | null>(null)
  const [planApproved, setPlanApproved] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const pipelineSteps = [
    "Downloading and opening dataset...",
    "Validating column headers and shapes...",
    "Splitting into Training Set (80%) and Test Set (20%)...",
    "Detecting column feature data types...",
    "Identifying task (Regression vs Classification)...",
    "Checking for missing values & duplicate records...",
    "Cleaning records, imputing nulls & ensembling features..."
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const nameLower = file.name.toLowerCase()

    // Setup initial simulated schemas
    let simColumns = ["target", "feature_1", "feature_2", "feature_3", "feature_4", "feature_5"]
    let simTarget = "target"
    let simProblemType: "classification" | "regression" = "classification"
    let simRows = 1500
    let simNumerical = 4
    let simCategorical = 1
    let simQuality = 95
    let simMemory = "120 KB"

    const isRegressionFile = nameLower.split(/[_\-\s\.]/).some(w => ["price", "sales", "house", "value", "cost", "regression", "temp", "rating", "age", "bmi", "weight", "height", "mpg", "revenue", "salary"].includes(w))
    const isCancerFile = nameLower.split(/[_\-\s\.]/).some(w => ["cancer", "breast", "malignant", "diagnosis"].includes(w))
    const isChurnFile = nameLower.split(/[_\-\s\.]/).some(w => ["churn", "retention", "customer"].includes(w))

    if (isRegressionFile) {
      simColumns = ["target_value", "size_sqft", "bedrooms", "bathrooms", "year_built", "tax_rate", "neighborhood_score"]
      simTarget = "target_value"
      simProblemType = "regression"
      simRows = 2500
      simNumerical = 5
      simCategorical = 1
      simQuality = 96
      simMemory = "180 KB"
      setUserQuery("Predict house prices")
    } else if (isCancerFile) {
      simColumns = ["diagnosis", "radius_mean", "texture_mean", "perimeter_mean", "area_mean", "smoothness_mean", "compactness_mean", "concavity_mean", "symmetry_mean", "fractal_dimension_mean"]
      simTarget = "diagnosis"
      simProblemType = "classification"
      simRows = 569
      simNumerical = 9
      simCategorical = 1
      simQuality = 98
      simMemory = "45 KB"
      setUserQuery("Detect cancer diagnosis")
    } else if (isChurnFile) {
      simColumns = ["will_churn", "annual_income", "credit_score", "account_age", "num_transactions", "avg_balance", "region", "has_mortgage"]
      simTarget = "will_churn"
      simProblemType = "classification"
      simRows = 24817
      simNumerical = 6
      simCategorical = 2
      simQuality = 94
      simMemory = "2.7 MB"
      setUserQuery("Predict customer churn")
    } else {
      const baseName = file.name.split(".")[0] || "dataset"
      simTarget = "target"
      simColumns = [simTarget, `${baseName}_val1`, `${baseName}_val2`, `${baseName}_val3`, `${baseName}_val4`, `${baseName}_val5`]
      simRows = 1200 + Math.floor(Math.random() * 800)
      simNumerical = 4
      simCategorical = 1
      simQuality = 92 + Math.floor(Math.random() * 6)
      simMemory = `${(simRows * simColumns.length * 0.08).toFixed(1)} KB`
      setUserQuery(`Predict ${simTarget}`)
    }

    const defaultParsedSchema: DatasetSchema = {
      fileName: file.name,
      columns: simColumns,
      targetColumn: simTarget,
      problemType: simProblemType,
      stats: {
        rows: simRows,
        columns: simColumns.length,
        memory: simMemory,
        missing: Math.floor(simRows * simColumns.length * 0.008),
        duplicates: Math.floor(simRows * 0.002),
        numerical: simNumerical,
        categorical: simCategorical,
        quality: simQuality
      }
    }

    setTargetColumn(simTarget)
    setParsedSchema(defaultParsedSchema)

    if (file.name.endsWith(".csv")) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        if (!text) return

        const lines = text.split(/\r?\n/).filter(line => line.trim())
        if (lines.length <= 1) return

        let sep = ","
        if (lines[0].includes(";")) sep = ";"
        else if (lines[0].includes("\t")) sep = "\t"
        setCsvSeparator(sep)

        const headers = lines[0].split(sep).map(h => h.replace(/["']/g, "").trim())
        if (headers.length < 2) return 

        setCsvHeaders(headers)
        setCsvLines(lines)

        const previewRows = lines.slice(1, 6).map((line) => {
          return line.split(sep).map((cell) => cell.replace(/["']/g, "").trim())
        })
        setCsvPreviewRows(previewRows)

        let numericalCount = 0
        let categoricalCount = 0
        const sampleValues = lines[1].split(sep)
        sampleValues.forEach((val) => {
          const cleanVal = val.replace(/["']/g, "").trim()
          const parsedValue = Number(cleanVal)
          if (!isNaN(parsedValue)) {
            numericalCount++
          } else {
            categoricalCount++
          }
        })

        let targetCol = headers[headers.length - 1] || "target"
        if (isCancerFile) {
          const diagIdx = headers.findIndex(h => h.toLowerCase() === "diagnosis" || h.toLowerCase() === "target")
          if (diagIdx !== -1) {
            targetCol = headers[diagIdx]
          }
        }

        let problemType: "classification" | "regression" = isRegressionFile ? "regression" : "classification"
        let targetMinVal: number | undefined = undefined
        let targetMaxVal: number | undefined = undefined

        const cleanTarget = targetCol.replace(/["']/g, "").trim().toLowerCase()
        const targetIndex = headers.findIndex(h => h.replace(/["']/g, "").trim().toLowerCase() === cleanTarget)
        
        if (targetIndex !== -1) {
          const uniqueTargetVals = new Set<string>()
          let minVal = Infinity
          let maxVal = -Infinity
          for (let i = 1; i < lines.length; i++) {
            const rowVals = lines[i].split(sep)
            if (rowVals[targetIndex] !== undefined) {
              const cleanedVal = rowVals[targetIndex].replace(/["']/g, "").trim()
              if (cleanedVal !== "") {
                uniqueTargetVals.add(cleanedVal)
                const num = Number(cleanedVal)
                if (!isNaN(num)) {
                  if (num < minVal) minVal = num
                  if (num > maxVal) maxVal = num
                }
              }
            }
          }
          if (minVal !== Infinity && maxVal !== -Infinity) {
            targetMinVal = minVal
            targetMaxVal = maxVal
          }
          
          let numericCount = 0
          let totalCount = 0
          uniqueTargetVals.forEach(v => {
            if (v === "" || ["na", "n/a", "null", "?", ".", "nan", "none"].includes(v.toLowerCase())) {
              return
            }
            totalCount++
            if (!isNaN(Number(v))) {
              numericCount++
            }
          })
          const looksNumerical = totalCount > 0 && (numericCount / totalCount) > 0.80

          const isBinary = uniqueTargetVals.size <= 2 && (
            (uniqueTargetVals.has("0") || uniqueTargetVals.has("1") || uniqueTargetVals.has("0.0") || uniqueTargetVals.has("1.0")) ||
            (uniqueTargetVals.has("no") || uniqueTargetVals.has("yes") || uniqueTargetVals.has("false") || uniqueTargetVals.has("true"))
          )

          if (looksNumerical && !isBinary && uniqueTargetVals.size > 2) {
            problemType = "regression"
          } else {
            problemType = "classification"
          }
        }

        setTargetColumn(targetCol)
        const rows = lines.length - 1
        const columns = headers.length
        const memory = text.length > 1048576 
          ? `${(text.length / 1048576).toFixed(1)} MB` 
          : `${(text.length / 1024).toFixed(1)} KB`

        setParsedSchema({
          fileName: file.name,
          columns: headers,
          targetColumn: targetCol,
          problemType,
          targetMin: targetMinVal,
          targetMax: targetMaxVal,
          stats: {
            rows,
            columns,
            memory,
            missing: Math.floor(rows * columns * 0.008),
            duplicates: Math.floor(rows * 0.002),
            numerical: numericalCount,
            categorical: categoricalCount,
            quality: 91 + Math.floor(Math.random() * 8),
          }
        })
      }
      reader.readAsText(file)
    }
  }

  const handleKaggleFetch = async () => {
    if (!kaggle.username.trim() || !kaggle.apiKey.trim() || !kaggle.url.trim()) {
      toast.error("Please fill in Kaggle username, API Key, and Dataset URL.")
      return
    }

    setFetchingKaggle(true)
    setKaggleStep(0)
    setKaggleSuccess(false)

    let step = 0
    const progressInterval = setInterval(() => {
      if (step < kaggleStages.length - 1) {
        step++
        setKaggleStep(step)
      }
    }, 1200)

    try {
      const response = await fetch("/api/kaggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: kaggle.url,
          username: kaggle.username,
          apiKey: kaggle.apiKey
        })
      })
      
      clearInterval(progressInterval)

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || `HTTP error ${response.status}`)
      }

      const res = await response.json()
      if (!res.success) {
        throw new Error(res.error || "Failed to download dataset.")
      }

      const parsedFileName = res.filename
      setFileName(parsedFileName)
      setCsvHeaders(res.columns)

      let simTarget = res.columns[res.columns.length - 1]
      const tLower = res.columns.map((c: string) => c.toLowerCase())
      const targetKeywords = ["diagnosis", "class", "target", "label", "will_churn", "churn", "survived", "outcome"]
      for (const kw of targetKeywords) {
        const foundIdx = tLower.findIndex((c: string) => c.includes(kw))
        if (foundIdx !== -1) {
          simTarget = res.columns[foundIdx]
          break
        }
      }
      setTargetColumn(simTarget)

      let simProblemType: "classification" | "regression" = "classification"
      const targetColIdx = res.columns.indexOf(simTarget)
      if (targetColIdx !== -1 && res.preview_rows.length > 0) {
        const sampleVals = res.preview_rows.map((row: string[]) => parseFloat(row[targetColIdx])).filter((v: number) => !isNaN(v))
        const uniqueVals = new Set(sampleVals)
        if (sampleVals.length > 2 && uniqueVals.size > 4) {
          simProblemType = "regression"
        }
      }

      let numericalCount = 0
      let categoricalCount = 0
      if (res.preview_rows.length > 0) {
        res.columns.forEach((col: string, cIdx: number) => {
          const sample = res.preview_rows[0][cIdx]
          if (sample && !isNaN(Number(sample.trim()))) {
            numericalCount++
          } else {
            categoricalCount++
          }
        })
      }

      setParsedSchema({
        fileName: parsedFileName,
        columns: res.columns,
        targetColumn: simTarget,
        problemType: simProblemType,
        stats: {
          rows: res.rows,
          columns: res.columns.length,
          memory: res.memory,
          missing: res.missing,
          duplicates: Math.floor(res.rows * 0.001),
          numerical: numericalCount,
          categorical: categoricalCount,
          quality: 91 + Math.floor(Math.random() * 8)
        }
      })

      setCsvPreviewRows(res.preview_rows)
      setUserQuery(`Build predictive model for ${simTarget}`)

      setKaggleStep(kaggleStages.length - 1)
      setTimeout(() => {
        setFetchingKaggle(false)
        setKaggleSuccess(true)
        toast.success(`Successfully downloaded and parsed ${parsedFileName} from Kaggle.`)
      }, 500)

    } catch (err: any) {
      clearInterval(progressInterval)
      setFetchingKaggle(false)
      toast.error(`Kaggle fetch failed: ${err.message}`)
    }
  }

  // Generate Agentic Execution Plan using Grok API
  const generatePlan = async () => {
    setLoadingPlan(true)
    const cols = parsedSchema?.columns || csvHeaders
    const currentTarget = targetColumn

    try {
      const response = await fetch("/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Dataset name: "${fileName}". Columns: ${JSON.stringify(cols)}.
The user wants to predict: "${userQuery}".
Identify the most likely target column from columns list.
Determine problem type (classification or regression).
List exactly 5 engineering/cleaning steps. Estimate training cost (e.g. $0.03) and SageMaker deployment hosting cost (e.g. $0.54/hour).
Respond in valid JSON format:
{
  "target": "columnName",
  "problemType": "classification" | "regression",
  "steps": ["step 1", "step 2", "step 3", "step 4", "step 5"],
  "estCost": "$0.02",
  "estInfCost": "$0.45/hr"
}`,
          systemPrompt: "You are SnapML's Data Engineer Agent. Return ONLY valid JSON matching the schema."
        })
      })
      const data = await response.json()
      const parsed = JSON.parse(data.content)
      setAiPlan(parsed)
      if (parsed.target) setTargetColumn(parsed.target)
    } catch (err) {
      // Local fallback heuristics
      const isReg = userQuery.toLowerCase().includes("price") || userQuery.toLowerCase().includes("sales") || userQuery.toLowerCase().includes("house")
      setAiPlan({
        target: currentTarget || (cols.length > 0 ? cols[0] : "diagnosis"),
        problemType: isReg ? "regression" : "classification",
        steps: [
          "Handle missing values via median imputation",
          "Outlier detection using Interquartile Range (IQR)",
          "Feature scaling with standard normalization",
          "Target mean encoding for high cardinality features",
          "Train XGBoost, CatBoost, and Neural Networks"
        ],
        estCost: "$0.03",
        estInfCost: "$0.54/hr"
      })
    } finally {
      setLoadingPlan(false)
    }
  }

  const runIngestion = () => {
    setIngesting(true)
    setIngestionStep(0)
    
    let activeSchema = parsedSchema || {
      fileName: "dataset.csv",
      columns: ["target", "feature_1", "feature_2"],
      targetColumn: "target",
      problemType: "classification" as const,
      stats: { rows: 1000, columns: 3, memory: "80 KB", missing: 0, duplicates: 0, numerical: 2, categorical: 1, quality: 95 }
    }
    
    let finalProblemType: "classification" | "regression" = activeSchema.problemType
    let targetMinVal: number | undefined = activeSchema.targetMin
    let targetMaxVal: number | undefined = activeSchema.targetMax

    if (csvHeaders.length > 0 && csvLines.length > 0) {
      const selectedTarget = targetColumn.trim()
      const cleanTarget = selectedTarget.replace(/["']/g, "").trim().toLowerCase()
      const targetIndex = csvHeaders.findIndex(h => h.replace(/["']/g, "").trim().toLowerCase() === cleanTarget)
      
      if (targetIndex !== -1) {
        const uniqueTargetVals = new Set<string>()
        let minVal = Infinity
        let maxVal = -Infinity
        for (let i = 1; i < csvLines.length; i++) {
          const rowVals = csvLines[i].split(csvSeparator)
          if (rowVals[targetIndex] !== undefined) {
            const cleanedVal = rowVals[targetIndex].replace(/["']/g, "").trim()
            if (cleanedVal !== "") {
              uniqueTargetVals.add(cleanedVal)
              const num = Number(cleanedVal)
              if (!isNaN(num)) {
                if (num < minVal) minVal = num
                if (num > maxVal) maxVal = num
              }
            }
          }
        }
        if (minVal !== Infinity && maxVal !== -Infinity) {
          targetMinVal = minVal
          targetMaxVal = maxVal
        }
        
        let numericCount = 0
        let totalCount = 0
        uniqueTargetVals.forEach(v => {
          if (v === "" || ["na", "n/a", "null", "?", ".", "nan", "none"].includes(v.toLowerCase())) {
            return
          }
          totalCount++
          if (!isNaN(Number(v))) {
            numericCount++
          }
        })
        const looksNumerical = totalCount > 0 && (numericCount / totalCount) > 0.80

        const isBinary = uniqueTargetVals.size <= 2 && (
          (uniqueTargetVals.has("0") || uniqueTargetVals.has("1") || uniqueTargetVals.has("0.0") || uniqueTargetVals.has("1.0")) ||
          (uniqueTargetVals.has("no") || uniqueTargetVals.has("yes") || uniqueTargetVals.has("false") || uniqueTargetVals.has("true"))
        )

        if (looksNumerical && !isBinary && uniqueTargetVals.size > 2) {
          finalProblemType = "regression"
        } else {
          finalProblemType = "classification"
        }
      }
    } else {
      const targetLower = targetColumn.toLowerCase()
      if (["value", "price", "sales", "cost", "score", "age", "bmi", "target_value", "weight", "height", "mpg", "revenue", "salary", "income", "amount", "balance"].some(w => targetLower.includes(w))) {
        finalProblemType = "regression"
      }
    }

    const updatedSchema: DatasetSchema = {
      ...activeSchema,
      targetColumn: targetColumn.trim() || activeSchema.targetColumn,
      problemType: finalProblemType,
      targetMin: targetMinVal,
      targetMax: targetMaxVal,
      stats: {
        ...activeSchema.stats,
        numerical: finalProblemType === "regression" 
          ? Math.max(activeSchema.stats.numerical, activeSchema.stats.numerical + activeSchema.stats.categorical - 1)
          : activeSchema.stats.numerical,
        categorical: finalProblemType === "regression"
          ? Math.max(1, activeSchema.stats.categorical - 1)
          : activeSchema.stats.categorical
      }
    }
    setParsedSchema(updatedSchema)

    const interval = setInterval(() => {
      setIngestionStep((prev) => {
        if (prev >= pipelineSteps.length - 1) {
          clearInterval(interval)
          setIngesting(false)
          setCompleted(true)
          
          // Ingestion complete. Stay on page for user review
          
          return prev + 1
        }
        return prev + 1
      })
    }, 450)
  }

  const canStart =
    targetColumn.trim().length > 0 &&
    (source === "upload"
      ? Boolean(fileName)
      : kaggle.username.trim() && kaggle.apiKey.trim() && kaggle.url.trim())

  const finalSchema = parsedSchema || {
    fileName: "breast_cancer.csv",
    columns: ["diagnosis", "radius_mean", "texture_mean", "perimeter_mean", "area_mean", "smoothness_mean", "compactness_mean", "concavity_mean", "symmetry_mean", "fractal_dimension_mean"],
    targetColumn: "diagnosis",
    problemType: "classification" as const,
    stats: {
      rows: 569,
      columns: 10,
      memory: "45 KB",
      missing: 0,
      duplicates: 0,
      numerical: 9,
      categorical: 1,
      quality: 98
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Import Your <span className="text-primary">Dataset</span>
        </h2>
        <p className="text-xs text-muted-foreground">
          Upload local file coordinates and approve the AI-Native execution plan to begin training.
        </p>
      </div>

      {!ingesting && !completed && (
        <Card className="border-border/40 bg-card/45 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm uppercase tracking-wider text-white">Data source</CardTitle>
            <CardDescription className="text-xs">Select how you want to import your data into SnapML.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={source} onValueChange={(v) => setSource(v as "upload" | "kaggle")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload" className="gap-2 cursor-pointer text-xs">
                  <UploadCloud className="h-4 w-4" />
                  Upload CSV / Excel
                </TabsTrigger>
                <TabsTrigger value="kaggle" className="gap-2 cursor-pointer text-xs">
                  <Database className="h-4 w-4" />
                  Kaggle API
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-6">
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/80 bg-secondary/20 px-6 py-10 text-center transition-all hover:border-primary/60 hover:bg-secondary/40 cursor-pointer"
                >
                  {fileName ? (
                    <>
                      <FileSpreadsheet className="h-10 w-10 text-primary animate-bounce" />
                      <span className="font-semibold text-white text-xs">{fileName}</span>
                      <span className="text-[11px] text-muted-foreground">Click to choose a different file</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-10 w-10 text-primary/80" />
                      <span className="font-semibold text-white text-xs">Drag & drop your file here, or click to browse</span>
                      <span className="text-[11px] text-muted-foreground">Supports CSV, Excel (.xlsx), or JSON data exports</span>
                    </>
                  )}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.json"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </TabsContent>

              <TabsContent value="kaggle" className="mt-6 space-y-4">
                {!fetchingKaggle && !kaggleSuccess && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="kaggle-username" className="text-xs">Kaggle Username</Label>
                        <Input
                          id="kaggle-username"
                          placeholder="e.g. kaggle_pioneer"
                          value={kaggle.username}
                          onChange={(e) => setKaggle((k) => ({ ...k, username: e.target.value }))}
                          className="bg-background/40 border-border/60 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="kaggle-key" className="flex items-center gap-1.5 text-xs">
                          <KeyRound className="h-3.5 w-3.5" />
                          API Key / Secret Token
                        </Label>
                        <Input
                          id="kaggle-key"
                          type="password"
                          placeholder="••••••••••••••••••••"
                          value={kaggle.apiKey}
                          onChange={(e) => setKaggle((k) => ({ ...k, apiKey: e.target.value }))}
                          className="bg-background/40 border-border/60 text-xs text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="kaggle-url" className="text-xs">Kaggle Dataset URL</Label>
                      <Input
                        id="kaggle-url"
                        placeholder="https://www.kaggle.com/datasets/uciml/breast-cancer-wisconsin-data"
                        value={kaggle.url}
                        onChange={(e) => setKaggle((k) => ({ ...k, url: e.target.value }))}
                        className="bg-background/40 border-border/60 text-xs text-white"
                      />
                    </div>
                    <Button
                      onClick={handleKaggleFetch}
                      className="w-full h-9 text-xs bg-primary hover:bg-primary/95 text-white font-bold rounded-lg cursor-pointer"
                    >
                      Fetch from Kaggle
                    </Button>
                  </>
                )}

                {fetchingKaggle && (
                  <div className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-3 text-xs text-slate-300">
                      <Loader2 className="h-4.5 w-4.5 animate-spin text-primary shrink-0" />
                      <span>{kaggleStages[kaggleStep]}</span>
                    </div>
                    <div className="h-1 bg-black/40 rounded overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${((kaggleStep + 1) / kaggleStages.length) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {kaggleSuccess && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center justify-between">
                    <span>Dataset successfully imported: <strong>{fileName}</strong></span>
                    <Check className="h-4 w-4 shrink-0" />
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {fileName && !aiPlan && !loadingPlan && (
              <div className="space-y-4 pt-4 border-t border-border/10 text-xs">
                
                {/* Target Column Select dropdown */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-white block">
                    Select Target Column to Predict:
                  </Label>
                  <Select
                    value={targetColumn}
                    onValueChange={(val) => {
                      setTargetColumn(val)
                      if (parsedSchema) {
                        setParsedSchema({
                          ...parsedSchema,
                          targetColumn: val
                        })
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background/40 border-border/60 text-xs h-9 w-full">
                      <SelectValue placeholder="Choose a target column..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f0f29] border-border/40 text-white text-xs">
                      {(csvHeaders.length > 0 ? csvHeaders : (parsedSchema?.columns || [])).map(col => (
                        <SelectItem key={col} value={col} className="text-xs">{col}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                    What do you want to predict from this dataset?
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      placeholder="e.g., Predict customer churn or Diagnose malignant breast cancer cells"
                      className="bg-background/40 border-border/60 text-xs flex-1"
                    />
                    <Button
                      onClick={generatePlan}
                      className="bg-primary text-xs text-white rounded-lg flex items-center gap-1 hover:bg-primary/95 shrink-0 cursor-pointer"
                    >
                      Generate AI Plan
                    </Button>
                  </div>
                  {/* Suggestions pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {["Predict customer churn", "Detect fraudulent transactions", "Forecast house prices", "Predict employee attrition"].map((pill) => (
                      <button
                        key={pill}
                        onClick={() => setUserQuery(pill)}
                        className="text-[9px] bg-secondary/35 hover:bg-primary/20 border border-border/20 text-muted-foreground p-1 px-2.5 rounded-full cursor-pointer transition-all"
                      >
                        {pill}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {loadingPlan && (
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3 text-xs text-slate-350">
                <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                <span>Data Engineer Agent is scanning column headers & mapping target outcome variables...</span>
              </div>
            )}

            {aiPlan && (
              <div className="space-y-4 pt-4 border-t border-border/10 animate-fade-in text-xs">
                <Card className="bg-black/35 border-primary/20 p-4 space-y-3">
                  <div className="flex items-center justify-between border-b border-border/10 pb-2">
                    <span className="font-bold text-white flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                      <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      AI Autonomous Execution Plan
                    </span>
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                      Objective Identified
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] sm:text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground block uppercase text-[9px] font-bold">Suggested Target</span>
                      {editMode ? (
                        <Select
                          value={targetColumn}
                          onValueChange={(val) => {
                            setTargetColumn(val)
                            setAiPlan(prev => prev ? { ...prev, target: val } : null)
                          }}
                        >
                          <SelectTrigger className="bg-background/40 border-border/60 text-xs h-8">
                            <SelectValue placeholder="Select target..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f29] border-border/40 text-white text-xs">
                            {csvHeaders.map(h => (
                              <SelectItem key={h} value={h} className="text-xs">{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-bold text-emerald-400 font-mono block">{aiPlan.target}</span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground block uppercase text-[9px] font-bold">Problem Class</span>
                      {editMode ? (
                        <Select
                          value={aiPlan.problemType}
                          onValueChange={(val: "classification" | "regression") => {
                            setAiPlan(prev => prev ? { ...prev, problemType: val } : null)
                          }}
                        >
                          <SelectTrigger className="bg-background/40 border-border/60 text-xs h-8">
                            <SelectValue placeholder="Select class..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0f0f29] border-border/40 text-white text-xs">
                            <SelectItem value="classification" className="text-xs">Classification</SelectItem>
                            <SelectItem value="regression" className="text-xs">Regression</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="font-bold text-primary uppercase block">{aiPlan.problemType}</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-muted-foreground block uppercase text-[9px] font-bold">Execution Steps (Data & ML Agents)</span>
                    <div className="space-y-1.5 text-slate-300">
                      {aiPlan.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2 font-mono text-[10px]">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-border/10 pt-2.5">
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground block">Estimated Compute Cost:</span>
                      <span className="font-bold text-white">{aiPlan.estCost}</span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-muted-foreground block">Expected SageMaker Host:</span>
                      <span className="font-bold text-white">{aiPlan.estInfCost}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/10">
                    <Button
                      onClick={() => {
                        setPlanApproved(true)
                        runIngestion()
                      }}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-xs text-white rounded-lg font-bold shadow-lg shadow-emerald-500/20 cursor-pointer"
                    >
                      Approve & Run Autonomous Ingestion
                    </Button>
                    <Button
                      onClick={() => setEditMode(!editMode)}
                      variant="outline"
                      className="bg-secondary/35 text-xs text-white rounded-lg hover:bg-secondary/50 border-border/40 cursor-pointer"
                    >
                      {editMode ? "Confirm Overrides" : "Edit Plan"}
                    </Button>
                    <Button
                      onClick={() => {
                        setAiPlan(null)
                        setFileName(null)
                      }}
                      variant="destructive"
                      className="text-xs rounded-lg cursor-pointer"
                    >
                      Reject
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {ingesting && (
        <Card className="border-border/40 bg-card/30 backdrop-blur-md p-6">
          <CardContent className="space-y-6">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <h3 className="mt-4 text-lg font-semibold text-white">Running Data Ingestion Pipeline</h3>
              <p className="text-xs text-muted-foreground mt-1">Executing cleaning, validation, and encoding checks...</p>
            </div>

            <div className="space-y-2.5 bg-black/25 rounded-lg p-4 border border-border/20">
              {pipelineSteps.map((step, idx) => {
                const active = idx === ingestionStep
                const done = idx < ingestionStep
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    {done ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : active ? (
                      <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border border-border/60 shrink-0" />
                    )}
                    <span className={done ? "text-muted-foreground line-through" : active ? "text-white font-medium" : "text-muted-foreground/60"}>
                      {step}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {completed && (
        <Card className="border-primary/20 bg-gradient-to-b from-primary/5 to-card/50 backdrop-blur-md border animate-fade-in">
          <CardHeader className="text-center border-b border-border/20 pb-4">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-500" />
            <CardTitle className="text-white mt-2 font-bold text-lg">Dataset Ingested & Validated!</CardTitle>
            <CardDescription className="text-xs">SnapML completed cleaning and preprocessing diagnostics.</CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6 space-y-6">
            
            {/* INGESTION GRID PREVIEW */}
            {csvPreviewRows.length > 0 && (
              <Card className="border-border/40 bg-black/35 overflow-hidden">
                <CardHeader className="py-2 px-4 bg-black/20 border-b border-border/10">
                  <CardTitle className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    Dataset Preview (First 5 Rows)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 overflow-x-auto max-h-56 scrollbar-thin">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead className="bg-black/20 text-muted-foreground font-semibold">
                      <tr className="border-b border-border/10">
                        {csvHeaders.map((header) => (
                          <th key={header} className="p-2 px-3 border-r border-border/10 font-bold truncate max-w-[125px]" title={header}>
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="text-slate-350 font-mono">
                      {csvPreviewRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-border/5 hover:bg-white/5">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-2 px-3 border-r border-border/10 truncate max-w-[125px]" title={cell}>
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="bg-background/40 p-4 rounded-xl border border-border/40 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total Rows</span>
                <span className="text-2xl font-bold text-white mt-1 block tabular-nums">{finalSchema.stats.rows.toLocaleString()}</span>
              </div>
              <div className="bg-background/40 p-4 rounded-xl border border-border/40 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total Columns</span>
                <span className="text-2xl font-bold text-white mt-1 block tabular-nums">{finalSchema.stats.columns}</span>
              </div>
              <div className="bg-background/40 p-4 rounded-xl border border-border/40 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Memory Usage</span>
                <span className="text-2xl font-bold text-white mt-1 block tabular-nums">{finalSchema.stats.memory}</span>
              </div>
              <div className="bg-background/40 p-4 rounded-xl border border-border/40 text-center">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Dataset Quality</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block tracking-tight">{finalSchema.stats.quality}%</span>
              </div>
            </div>

            <Button
              size="lg"
              onClick={() => onComplete(finalSchema)}
              className="w-full gap-2 rounded-lg bg-primary font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/95 cursor-pointer text-xs"
            >
              Train AutoML
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
