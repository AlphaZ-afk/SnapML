"use client"

import { useState } from "react"
import { Terminal, Play, CheckCircle2, ChevronDown, ChevronRight, Server } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PlaygroundMessageProps {
  metadata?: any
}

export function PlaygroundMessage({ metadata }: PlaygroundMessageProps) {
  const [expanded, setExpanded] = useState(true)
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  
  // Create mock input based on dataset info if available
  const mockHeaders = metadata?.datasetInfo?.headers?.slice(0, 4) || ["feature_1", "feature_2", "feature_3", "feature_4"]
  const initialJson = `{\n${mockHeaders.map((h: string) => `  "${h}": ${Math.round(Math.random() * 100)}`).join(",\n")}\n}`
  const [inputJson, setInputJson] = useState(initialJson)

  const handleRunPrediction = async () => {
    setIsRunning(true)
    setResult(null)
    
    // Simulate network latency
    await new Promise(r => setTimeout(r, 1200))
    
    let prediction;
    if (metadata?.datasetInfo?.taskType === "regression") {
      prediction = (Math.random() * 500 + 100).toFixed(2)
    } else {
      prediction = Math.random() > 0.5 ? 1 : 0
    }

    setResult(JSON.stringify({
      status: "success",
      prediction: prediction,
      confidence: (Math.random() * 0.2 + 0.8).toFixed(4),
      latency_ms: Math.round(Math.random() * 40 + 10)
    }, null, 2))
    
    setIsRunning(false)
  }

  return (
    <div className="bg-[#0f111a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl mt-4">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500/10">
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
              API Playground
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">Live</span>
            </h3>
            <p className="text-xs text-white/40 font-mono mt-0.5">POST /api/v1/predict</p>
          </div>
        </div>
        <div className="text-white/40">
          {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="p-5 border-t border-white/5 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5" /> Request Payload (JSON)
            </label>
            <textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/50 resize-none transition-colors"
              spellCheck={false}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleRunPrediction} 
              disabled={isRunning}
              className="bg-emerald-500 hover:bg-emerald-600 text-white gap-2 h-9 px-4 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
            >
              {isRunning ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              {isRunning ? "Running..." : "Execute Prediction"}
            </Button>
          </div>

          {/* Response Area */}
          <div className={`transition-all duration-500 ${result ? "opacity-100 h-auto mt-4" : "opacity-0 h-0 overflow-hidden"}`}>
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Response
            </label>
            <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-4 relative group">
              <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
              <pre className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                {result}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
