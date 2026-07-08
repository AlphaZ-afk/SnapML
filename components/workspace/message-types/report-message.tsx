"use client"

import { useState } from "react"
import { FileText, Download, Loader2, CheckCircle2, BarChart3, Brain, Zap, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReportMessageProps {
  metadata: {
    champion: string
    taskType: string
    datasetName: string
    metrics: any
    recommendations: any[]
    targetColumn: string
  }
}

export function ReportMessage({ metadata }: ReportMessageProps) {
  const { champion, taskType, datasetName, metrics, recommendations, targetColumn } = metadata
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const sections = [
    { icon: Brain, label: "Executive Summary", color: "text-violet-400", description: "Project overview, objective, and key findings" },
    { icon: BarChart3, label: "Model Performance", color: "text-emerald-400", description: `Champion: ${champion} — detailed metrics breakdown` },
    { icon: TrendingUp, label: "Feature Importance", color: "text-amber-400", description: "Top contributing features and SHAP analysis" },
    { icon: Zap, label: "Recommendations", color: "text-sky-400", description: `${recommendations?.length || 4} actionable improvement strategies` },
  ]

  const handleDownload = () => {
    setDownloading(true)

    // Generate report HTML content
    const isReg = taskType === "regression"
    const primaryMetric = isReg ? `RMSE: ${metrics?.rmse?.toFixed(4) || "N/A"}` : `F1 Score: ${metrics?.f1?.toFixed(4) || "N/A"}`
    const secondaryMetrics = isReg
      ? `MAE: ${metrics?.mae?.toFixed(4) || "N/A"} | R²: ${metrics?.r2?.toFixed(4) || "N/A"}`
      : `Accuracy: ${metrics?.accuracy?.toFixed(4) || "N/A"} | AUC: ${metrics?.auc?.toFixed(4) || "N/A"} | Precision: ${metrics?.precision?.toFixed(4) || "N/A"} | Recall: ${metrics?.recall?.toFixed(4) || "N/A"}`

    const recsHtml = (recommendations || [])
      .map((r: any) => `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee;font-weight:600">${r.title}</td><td style="padding:8px 12px;border-bottom:1px solid #eee">${r.description}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;color:#059669;font-weight:600">${r.impact}</td></tr>`)
      .join("")

    const reportHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>SnapML Report — ${datasetName}</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 30px; color: #1a1a2e; background: #fff; }
  .header { background: linear-gradient(135deg, #7c3aed, #4f46e5); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
  .header h1 { margin: 0 0 8px 0; font-size: 24px; }
  .header p { margin: 0; opacity: 0.85; font-size: 14px; }
  .section { margin-bottom: 24px; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; }
  .section h2 { margin: 0 0 12px 0; font-size: 16px; color: #4f46e5; }
  .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0; }
  .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
  .metric-card .value { font-size: 20px; font-weight: 700; color: #4f46e5; }
  .metric-card .label { font-size: 11px; color: #64748b; margin-top: 4px; }
  .champion-badge { display: inline-flex; align-items: center; gap: 6px; background: #f0fdf4; border: 1px solid #86efac; color: #166534; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #f8fafc; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; font-size: 12px; }
  .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #94a3b8; font-size: 12px; }
</style>
</head>
<body>
  <div class="header">
    <h1>🧠 SnapML — Model Evaluation Report</h1>
    <p>${datasetName} · ${taskType.charAt(0).toUpperCase() + taskType.slice(1)} · Target: ${targetColumn} · ${new Date().toLocaleDateString()}</p>
  </div>

  <div class="section">
    <h2>📋 Executive Summary</h2>
    <p>SnapML's autonomous AI pipeline analyzed <strong>${datasetName}</strong> to predict <strong>${targetColumn}</strong> (${taskType} task). After training 8 models with automated preprocessing, feature engineering, and hyperparameter optimization, <strong>${champion}</strong> was selected as the champion model.</p>
    <div style="margin-top:12px"><span class="champion-badge">🏆 Champion: ${champion}</span></div>
  </div>

  <div class="section">
    <h2>📊 Model Performance</h2>
    <div class="metric-grid">
      ${isReg ? `
        <div class="metric-card"><div class="value">${metrics?.rmse?.toFixed(4) || "—"}</div><div class="label">RMSE</div></div>
        <div class="metric-card"><div class="value">${metrics?.mae?.toFixed(4) || "—"}</div><div class="label">MAE</div></div>
        <div class="metric-card"><div class="value">${metrics?.r2?.toFixed(4) || "—"}</div><div class="label">R² Score</div></div>
      ` : `
        <div class="metric-card"><div class="value">${metrics?.f1?.toFixed(4) || "—"}</div><div class="label">F1 Score</div></div>
        <div class="metric-card"><div class="value">${metrics?.accuracy?.toFixed(4) || "—"}</div><div class="label">Accuracy</div></div>
        <div class="metric-card"><div class="value">${metrics?.auc?.toFixed(4) || "—"}</div><div class="label">AUC-ROC</div></div>
      `}
    </div>
    <p style="font-size:12px;color:#64748b">${secondaryMetrics}</p>
  </div>

  <div class="section">
    <h2>💡 Recommendations</h2>
    <table>
      <thead><tr><th>Strategy</th><th>Description</th><th>Expected Impact</th></tr></thead>
      <tbody>${recsHtml || "<tr><td colspan='3' style='padding:12px;text-align:center;color:#94a3b8'>No recommendations generated</td></tr>"}</tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated by SnapML AI · ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`

    // Download as HTML (opens in browser for PDF printing)
    setTimeout(() => {
      const blob = new Blob([reportHtml], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `SnapML_Report_${datasetName.replace(/\.[^.]+$/, "")}_${new Date().toISOString().slice(0, 10)}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setDownloading(false)
      setDownloaded(true)
    }, 1200)
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-cyan-500/[0.04] to-violet-500/[0.04] p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
          <FileText className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider">AI-Generated Report</h3>
          <p className="text-[10px] text-white/30">{datasetName} · {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Sections Preview */}
      <div className="space-y-2">
        {sections.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
              <Icon className={`w-3.5 h-3.5 ${s.color} flex-shrink-0`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/70">{s.label}</p>
                <p className="text-[10px] text-white/30 truncate">{s.description}</p>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/50 flex-shrink-0" />
            </div>
          )
        })}
      </div>

      {/* Download Button */}
      <Button
        onClick={handleDownload}
        disabled={downloading}
        className={`w-full h-9 rounded-xl text-xs font-medium gap-2 transition-all duration-300 ${
          downloaded
            ? "bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30"
            : "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-600/20"
        }`}
      >
        {downloading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Generating Report...
          </>
        ) : downloaded ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Downloaded — Open to Print as PDF
          </>
        ) : (
          <>
            <Download className="w-3.5 h-3.5" />
            Download Report
          </>
        )}
      </Button>
    </div>
  )
}
