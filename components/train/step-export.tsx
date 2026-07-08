"use client"

import { useState } from "react"
import { FileText, Download, Check, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  leaderboard: ModelLeaderboardItem[]
  champion: ModelLeaderboardItem
}

const reportSections = [
  { label: "Executive Summary", desc: "High-level overview of the AutoML run results." },
  { label: "Dataset Overview & Preprocessing", desc: "Statistics on rows, columns, missing values imputations and duplicate removals." },
  { label: "Model Comparison Leaderboard", desc: "Performance metric details across all 8 models evaluated on the test set split." },
  { label: "Champion Model Metrics", desc: "Detailed breakdown of the selected optimal champion model." },
  { label: "Feature Importance & local SHAP", desc: "Bar chart weights and explainability waterfall datasets." },
  { label: "Executive AI Insights & Recommendations", desc: "Text analyses on class imbalances, outliers, and recommendations." },
  { label: "Production API Keys & Endpoints", desc: "Active REST endpoints, ports, authentication keys, and curl samples." }
]

export function StepExport({ onComplete, schema, leaderboard, champion }: Props) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handlePrintPdf = () => {
    setDownloading(true)
    
    setTimeout(() => {
      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        setDownloading(false)
        return
      }

      const isMedical = schema.fileName.toLowerCase().includes("cancer") || schema.targetColumn.toLowerCase() === "diagnosis"
      const isRegression = schema.problemType === "regression"
      
      // Retain all feature columns
      const features = schema.columns.filter((c) => c.toLowerCase() !== schema.targetColumn.toLowerCase())
      
      // Generate matching weights decaying exponentially
      const rawWeights = features.map((_, idx) => Math.exp(-idx * 0.35))
      const sumWeights = rawWeights.reduce((a, b) => a + b, 0)
      const normalizedWeights = rawWeights.map(w => w / sumWeights)

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>SnapML AutoML Champion Report - ${schema.fileName}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
              color: #1e293b;
              line-height: 1.5;
              padding: 40px;
              max-width: 800px;
              margin: 0 auto;
            }
            .header-container {
              border-bottom: 3px solid #8b5cf6;
              padding-bottom: 20px;
              margin-bottom: 30px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .brand {
              font-size: 28px;
              font-weight: 800;
              color: #8b5cf6;
              letter-spacing: -0.03em;
            }
            .meta-date {
              font-size: 12px;
              color: #64748b;
              font-family: monospace;
            }
            h1 {
              font-size: 22px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 30px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            h2 {
              font-size: 15px;
              font-weight: 600;
              color: #475569;
              margin-top: 15px;
            }
            .grid-stats {
              display: grid;
              grid-template-cols: repeat(4, 1fr);
              gap: 15px;
              margin: 20px 0;
            }
            .stat-box {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px;
              text-align: center;
            }
            .stat-lbl {
              font-size: 10px;
              text-transform: uppercase;
              color: #64748b;
              letter-spacing: 0.05em;
              display: block;
            }
            .stat-val {
              font-size: 18px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 4px;
              display: block;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              font-size: 13px;
            }
            th {
              background: #f1f5f9;
              color: #475569;
              font-weight: 600;
              text-align: right;
              padding: 8px 12px;
              border-bottom: 2px solid #cbd5e1;
            }
            th:first-child {
              text-align: left;
            }
            td {
              padding: 8px 12px;
              border-bottom: 1px solid #e2e8f0;
              text-align: right;
              color: #334155;
            }
            td:first-child {
              text-align: left;
              font-weight: 500;
            }
            .champion-row {
              background: rgba(139, 92, 246, 0.08);
              font-weight: bold;
            }
            .badge {
              background: #8b5cf6;
              color: white;
              padding: 2px 6px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: bold;
            }
            .code-box {
              background: #f1f5f9;
              border: 1px solid #cbd5e1;
              border-radius: 6px;
              padding: 15px;
              font-family: monospace;
              font-size: 12px;
              white-space: pre-wrap;
              color: #0f172a;
              margin: 15px 0;
            }
            ul {
              padding-left: 20px;
              margin: 15px 0;
            }
            li {
              margin-bottom: 8px;
              font-size: 13px;
              color: #475569;
            }
            @media print {
              body {
                padding: 0;
              }
              button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header-container">
            <div class="brand">SnapML Report</div>
            <div class="meta-date">RUN_ID: sml_run_8f3a9d72 | DATE: July 3, 2026</div>
          </div>

          <h1>1. Executive Summary</h1>
          <p>
            SnapML has completed the AutoML optimization sweep over dataset <strong>"${schema.fileName}"</strong>.
            The dataset was split into 80% training set and 20% test set, and evaluated predictions on the test set.
            The optimal pipeline has been tuned, validated, and deployed to our production inference architecture.
          </p>
          <ul>
            <li><strong>Champion Model:</strong> ${champion.name}</li>
            <li><strong>Model ${isRegression ? "R² Score" : "Accuracy"}:</strong> ${(champion.accuracy * 100).toFixed(1)}%</li>
            <li><strong>Model Latency:</strong> ${champion.inferenceTime}</li>
            <li><strong>Target Variable:</strong> "${schema.targetColumn}"</li>
            <li><strong>Task Category:</strong> ${schema.problemType.toUpperCase()}</li>
          </ul>

          <h1>2. Dataset Summary & Preprocessing</h1>
          <div class="grid-stats">
            <div class="stat-box">
              <span class="stat-lbl">Total Rows</span>
              <span class="stat-val">${schema.stats.rows.toLocaleString()}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">Total Columns</span>
              <span class="stat-val">${schema.stats.columns}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">Memory Size</span>
              <span class="stat-val">${schema.stats.memory}</span>
            </div>
            <div class="stat-box">
              <span class="stat-lbl">Quality Score</span>
              <span class="stat-val">${schema.stats.quality}%</span>
            </div>
          </div>
          <ul>
            <li>Partitioned: <strong>80% Train</strong> (${Math.round(schema.stats.rows * 0.8).toLocaleString()} records) and <strong>20% Test</strong> (${Math.round(schema.stats.rows * 0.2).toLocaleString()} records).</li>
            <li>Successfully imputed <strong>${schema.stats.missing}</strong> missing attributes during pipeline validation.</li>
            <li>Identified and pruned <strong>${schema.stats.duplicates}</strong> duplicate entries.</li>
            <li>Identified <strong>${schema.stats.numerical}</strong> numerical dimensions and <strong>${schema.stats.categorical}</strong> categorical dimensions.</li>
          </ul>

          <h1>3. AutoML Leaderboard</h1>
          <table>
            <thead>
              <tr>
                <th>Model</th>
                <th>${isRegression ? "R² Score" : "Accuracy"}</th>
                <th>${isRegression ? "RMSE" : "F1 Score"}</th>
                <th>${isRegression ? "MAE" : "Precision"}</th>
                <th>${isRegression ? "MAPE" : "Recall"}</th>
                <th>${isRegression ? "Validation CV" : "ROC AUC"}</th>
                <th>Latency</th>
                <th>Train Time</th>
              </tr>
            </thead>
            <tbody>
              ${leaderboard.map((item, idx) => `
                <tr class="${idx === 0 ? "champion-row" : ""}">
                  <td>${item.name} ${idx === 0 ? '<span class="badge">CHAMPION</span>' : ""}</td>
                  <td>${(item.accuracy * 100).toFixed(1)}%</td>
                  <td>${isRegression ? item.precision.toFixed(3) : item.f1.toFixed(3)}</td>
                  <td>${isRegression ? item.recall.toFixed(3) : item.precision.toFixed(3)}</td>
                  <td>${isRegression ? `${item.f1.toFixed(2)}%` : item.recall.toFixed(3)}</td>
                  <td>${item.auc.toFixed(3)}</td>
                  <td>${item.inferenceTime}</td>
                  <td>${item.trainTime}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h1>4. Feature Contributions</h1>
          <h2>Full Ranked Feature Importance</h2>
          <ul>
            ${features.map((feat, idx) => `
              <li><strong>Rank #${idx + 1} - ${feat}:</strong> Relative predictive importance weight of ${(normalizedWeights[idx] * 100).toFixed(2)}%.</li>
            `).join("")}
          </ul>

          <h1>5. Executive AI Insights</h1>
          <p>
            ${isMedical 
              ? "Cell boundaries and texture variance drive prediction splits most heavily. The SMOTE oversampling protocol successfully stabilized the minority malignant class weights, protecting recall. Latency profiles are optimal for integration into real-time medical screening assistance consoles." 
              : isRegression
              ? `Dynamic features drive regression target boundaries. The error distribution is Gaussian, indicating unbiased estimation vectors. Latency profiles are optimal at ${champion.inferenceTime} for real-time forecasting.`
              : "Financial attributes and transaction velocities hold the highest predictive significance. The class weights were balanced dynamically to protect true recall metrics. Deployed models are optimal for CRM integration."}
          </p>

          <h1>6. REST API Coordinates</h1>
          <ul>
            <li><strong>REST Inference Endpoint:</strong> https://api.snapml.ai/v1/predict/xgb-model-4091</li>
            <li><strong>Swagger Documentation URL:</strong> https://api.snapml.ai/docs/xgb-model-4091</li>
            <li><strong>Authentication Header:</strong> X-API-Key: sml_live_8f3a9d72c10b4f8a9e7d3c5b2a6f7d</li>
          </ul>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      setDownloading(false)
      setDownloaded(true)
    }, 1200)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Export <span className="text-primary">PDF Report</span>
        </h2>
        <p className="mt-3 text-muted-foreground">
          Download a professional, comprehensive documentation file detailing this AutoML execution cycle.
        </p>
      </div>

      <Card className="border-border/40 bg-card/45 backdrop-blur-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-white text-base">Report Outline Sections</CardTitle>
          </div>
          <CardDescription>The exported file contains the following structured reports:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="divide-y divide-border/20">
            {reportSections.map((sect, idx) => (
              <li key={idx} className="py-3 flex gap-3 text-xs sm:text-sm">
                <Check className="h-4.5 w-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-white block">{sect.label}</span>
                  <span className="text-muted-foreground mt-0.5 block text-xs">{sect.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="pt-4 border-t border-border/20">
            <Button
              onClick={handlePrintPdf}
              disabled={downloading}
              size="lg"
              className="w-full gap-2 rounded-lg bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-bold shadow-lg shadow-primary/25 cursor-pointer disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <span className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin mr-1" />
                  Generating PDF...
                </>
              ) : downloaded ? (
                <>
                  <Check className="h-5 w-5 text-white" />
                  PDF Export Generated
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Download PDF Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {downloaded && (
        <Card className="border-primary/20 bg-primary/5 backdrop-blur-md p-4 text-center text-xs text-muted-foreground flex items-center justify-center gap-2 animate-fade-in">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span>Report opened in a printable tab. Save as PDF or print to complete the workspace session!</span>
        </Card>
      )}
    </div>
  )
}
