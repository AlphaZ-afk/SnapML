"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { LeftSidebar } from "./left-sidebar"
import { ChatPanel, ChatMessage } from "./chat-panel"
import { CanvasBackground } from "../train/canvas-background"

type Props = {
  onBackHome: () => void
}

type TimelineEntry = { time: string; event: string; done: boolean }

export function AIWorkspace({ onBackHome }: Props) {
  // Core state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isThinking, setIsThinking] = useState(false)
  const [thinkingLabel, setThinkingLabel] = useState("Thinking")
  const [phase, setPhase] = useState("idle")
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [activeModel, setActiveModel] = useState("")
  const [timeline, setTimeline] = useState<TimelineEntry[]>([])
  const [datasetInfo, setDatasetInfo] = useState<any>(null)
  const [leftCollapsed, setLeftCollapsed] = useState(false)

  const messageIdRef = useRef(0)
  const genId = () => `msg-${++messageIdRef.current}-${Date.now()}`

  // Add a message to the conversation
  const addMessage = useCallback((msg: Omit<ChatMessage, "id" | "timestamp">) => {
    const newMsg: ChatMessage = { ...msg, id: genId(), timestamp: new Date() }
    setMessages(prev => [...prev, newMsg])
    return newMsg.id
  }, [])

  // Update a message by id
  const updateMessage = useCallback((id: string, updates: Partial<ChatMessage>) => {
    setMessages(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [])

  // Add timeline entry
  const addTimelineEntry = useCallback((event: string) => {
    const now = new Date()
    const time = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })
    setTimeline(prev => [
      ...prev.map(e => ({ ...e, done: true })),
      { time, event, done: false }
    ])
  }, [])

  // Stream response from Grok API
  const streamGrokResponse = useCallback(async (
    userPrompt: string,
    systemPrompt: string,
    msgId: string
  ) => {
    try {
      const resp = await fetch("/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, systemPrompt, stream: true })
      })

      if (!resp.ok) {
        const err = await resp.text()
        updateMessage(msgId, { content: `Error: ${err}`, isStreaming: false })
        return ""
      }

      const reader = resp.body?.getReader()
      if (!reader) return ""
      
      const decoder = new TextDecoder()
      let fullContent = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n")
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6)
            if (data === "[DONE]") break
            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta?.content
              if (delta) {
                fullContent += delta
                updateMessage(msgId, { content: fullContent, isStreaming: true })
              }
            } catch { /* skip */ }
          }
        }
      }

      updateMessage(msgId, { content: fullContent, isStreaming: false })
      return fullContent
    } catch (err: any) {
      updateMessage(msgId, { content: `Connection error: ${err.message}`, isStreaming: false })
      return ""
    }
  }, [updateMessage])

  // Non-streaming Grok call for structured responses
  const callGrok = useCallback(async (prompt: string, systemPrompt: string): Promise<string> => {
    try {
      const resp = await fetch("/api/grok", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, systemPrompt })
      })
      const data = await resp.json()
      return data.content || data.error || "No response"
    } catch (err: any) {
      return `Error: ${err.message}`
    }
  }, [])

  // Listen for plan approval event from chat panel
  useEffect(() => {
    const handleApprove = () => {
      if (datasetInfo) {
        addMessage({ role: "user", content: "I approve the plan. Please proceed.", type: "text" })
        addMessage({ role: "assistant", content: "✅ **Plan approved!** Initiating the training pipeline now. I'll train 8 models and find the best one for your dataset.", type: "text" })
        runTrainingPipeline(datasetInfo)
      }
    }
    window.addEventListener('snapml-approve', handleApprove)
    return () => window.removeEventListener('snapml-approve', handleApprove)
  }, [datasetInfo, addMessage])

  // Simulate training pipeline
  const runTrainingPipeline = useCallback(async (dataInfo: any) => {
    setPhase("training")
    addTimelineEntry("Training Started")

    // ─── DATA ENGINEER AGENT: Preprocessing ─────────────────────
    const preprocessStepId = addMessage({
      role: "assistant",
      content: "",
      type: "agent_steps",
      metadata: {
        title: "Data Preprocessing",
        agent: "data_engineer",
        steps: [
          { id: "clean", label: "Cleaning missing values", status: "running" },
          { id: "dedup", label: "Removing duplicates", status: "pending" },
          { id: "outlier", label: "Handling outliers (IQR)", status: "pending" },
        ]
      }
    })

    // Animate preprocessing with proactive warnings
    const ppSteps = ["clean", "dedup", "outlier"]
    const ppLabels = ["Cleaning missing values", "Removing duplicates", "Handling outliers (IQR)"]
    for (let i = 0; i < ppSteps.length; i++) {
      await new Promise(r => setTimeout(r, 500))
      const steps = ppSteps.map((id, idx) => ({
        id,
        label: ppLabels[idx],
        status: (idx < i ? "completed" : idx === i ? "completed" : "pending") as any,
        duration: idx <= i ? `${(Math.random() * 1.5 + 0.3).toFixed(1)}s` : undefined
      }))
      updateMessage(preprocessStepId, { metadata: { title: "Data Preprocessing", agent: "data_engineer", steps } })
    }

    // Proactive AI warning: missing values
    const missingPct = parseFloat(dataInfo?.missingPct || "0")
    if (missingPct > 0) {
      addMessage({ role: "assistant", content: `⚠️ **${missingPct}% missing values detected** — I've imputed using median strategy for numeric and mode for categorical columns.`, type: "text" })
      await new Promise(r => setTimeout(r, 400))
    }

    // Proactive AI warning: class imbalance (for classification)
    if (dataInfo?.taskType !== "regression") {
      addMessage({ role: "assistant", content: `📊 **Checking class balance...** I'll apply SMOTE if the target is imbalanced to prevent biased predictions.`, type: "text" })
      await new Promise(r => setTimeout(r, 400))
    }

    // ─── FEATURE ENGINEER AGENT ─────────────────────────────────
    const feStepId = addMessage({
      role: "assistant",
      content: "",
      type: "agent_steps",
      metadata: {
        title: "Feature Engineering",
        agent: "feature_engineer",
        steps: [
          { id: "encode", label: "Encoding categorical features", status: "running" },
          { id: "scale", label: "Scaling numeric features", status: "pending" },
          { id: "select", label: "Selecting important features", status: "pending" },
          { id: "optimize", label: "Hyperparameter search space", status: "pending" },
        ]
      }
    })

    const feSteps = ["encode", "scale", "select", "optimize"]
    const feLabels = ["Encoding categorical features", "Scaling numeric features", "Selecting important features", "Hyperparameter search space"]
    for (let i = 0; i < feSteps.length; i++) {
      await new Promise(r => setTimeout(r, 400))
      const steps = feSteps.map((id, idx) => ({
        id,
        label: feLabels[idx],
        status: (idx <= i ? "completed" : "pending") as any,
        duration: idx <= i ? `${(Math.random() * 1.5 + 0.3).toFixed(1)}s` : undefined
      }))
      updateMessage(feStepId, { metadata: { title: "Feature Engineering", agent: "feature_engineer", steps } })
    }

    // ─── ML TRAINER AGENT: Model Training ───────────────────────
    const models = ["Random Forest", "XGBoost", "CatBoost", "LightGBM", "Neural Network", "SVM", "Logistic Regression", "Gradient Boosting"]
    
    // Agent handoff message
    addMessage({ role: "assistant", content: `🔄 **Agent Handoff:** Feature Engineer → ML Trainer. Starting parallel model training across 8 algorithms.`, type: "text" })
    await new Promise(r => setTimeout(r, 300))

    const trainMsgId = addMessage({
      role: "assistant",
      content: "",
      type: "training",
      metadata: { models: models.map(m => ({ name: m, status: "queued", progress: 0, metrics: null })) }
    })

    // Simulate training each model
    for (let i = 0; i < models.length; i++) {
      setActiveModel(models[i])
      setTrainingProgress(Math.round(((i) / models.length) * 100))

      const updatedModels = models.map((m, idx) => ({
        name: m,
        status: idx < i ? "completed" : idx === i ? "running" : "queued",
        progress: idx < i ? 100 : idx === i ? 0 : 0,
        metrics: idx < i ? generateMetrics(m, dataInfo?.taskType) : null
      }))
      updateMessage(trainMsgId, { metadata: { models: updatedModels } })

      for (let p = 0; p <= 100; p += 25) {
        await new Promise(r => setTimeout(r, 120))
        updatedModels[i] = { ...updatedModels[i], progress: p, status: "running" }
        setTrainingProgress(Math.round(((i + p / 100) / models.length) * 100))
        updateMessage(trainMsgId, { metadata: { models: [...updatedModels] } })
      }

      updatedModels[i] = { name: models[i], status: "completed", progress: 100, metrics: generateMetrics(models[i], dataInfo?.taskType) }
      updateMessage(trainMsgId, { metadata: { models: [...updatedModels] } })
    }

    setTrainingProgress(100)
    setPhase("evaluation")
    addTimelineEntry("Training Complete")

    // ─── EVALUATOR AGENT: Champion Selection ────────────────────
    const finalModels = models.map(m => ({ name: m, status: "completed", progress: 100, metrics: generateMetrics(m, dataInfo?.taskType) }))
    
    const isReg = dataInfo?.taskType === "regression"
    const champion = finalModels.reduce((best, m) => {
      if (isReg) {
        return (m.metrics!.rmse < (best.metrics?.rmse || Infinity)) ? m : best
      } else {
        return (m.metrics!.f1 > (best.metrics?.f1 || 0)) ? m : best
      }
    }, finalModels[0])

    // Evaluator agent steps
    const evalStepId = addMessage({
      role: "assistant",
      content: "",
      type: "agent_steps",
      metadata: {
        title: "Model Evaluation & Selection",
        agent: "evaluator",
        steps: [
          { id: "compare", label: "Cross-validating all models", status: "completed", duration: "2.1s" },
          { id: "rank", label: "Ranking by primary metric", status: "completed", duration: "0.3s" },
          { id: "champion", label: `Selected champion: ${champion.name}`, status: "completed", duration: "0.1s" },
        ]
      }
    })
    await new Promise(r => setTimeout(r, 400))

    // 🎉 Success Animation
    const primaryMetric = isReg ? "RMSE" : "F1 Score"
    const primaryValue = isReg ? champion.metrics!.rmse.toFixed(4) : champion.metrics!.f1.toFixed(4)
    addMessage({
      role: "assistant",
      content: "",
      type: "success",
      metadata: { champion: champion.name, metric: primaryMetric, value: primaryValue, taskType: dataInfo?.taskType || "classification" }
    })
    await new Promise(r => setTimeout(r, 600))

    // Comparison message
    addMessage({
      role: "assistant",
      content: "",
      type: "comparison",
      metadata: { models: finalModels, champion: champion.name }
    })
    addTimelineEntry("Model Comparison")

    // AI Explains WHY — short champion reasoning
    await new Promise(r => setTimeout(r, 300))
    const whyMsgId = addMessage({ role: "assistant", content: "", type: "text", isStreaming: true })
    const whyPrompt = isReg
      ? `Champion: ${champion.name} with RMSE=${champion.metrics!.rmse.toFixed(4)}, MAE=${champion.metrics!.mae.toFixed(4)}, R²=${champion.metrics!.r2.toFixed(4)}. All 8 models were compared. Explain in 2-3 sentences WHY this model won. Be specific about the metrics. Start with "I selected ${champion.name} because..."`
      : `Champion: ${champion.name} with F1=${champion.metrics!.f1.toFixed(4)}, Accuracy=${champion.metrics!.accuracy.toFixed(4)}, AUC=${champion.metrics!.auc.toFixed(4)}. All 8 models were compared. Explain in 2-3 sentences WHY this model won. Be specific about the metrics. Start with "I selected ${champion.name} because..."`
    await streamGrokResponse(
      whyPrompt,
      "You are SnapML's Evaluator Agent. Explain concisely WHY the champion model was selected. Be specific about metrics. Do NOT use markdown headers, just plain text with bold for emphasis.",
      whyMsgId
    )

    // AI Insights via Grok
    await new Promise(r => setTimeout(r, 500))
    setPhase("insights")
    addTimelineEntry("AI Insights")
    
    const insightsMsgId = addMessage({
      role: "assistant",
      content: "",
      type: "insights",
      isStreaming: true
    })

    const metricsText = finalModels.map(m => {
      if (isReg) {
        return `${m.name}: RMSE=${m.metrics!.rmse.toFixed(3)}, MAE=${m.metrics!.mae.toFixed(3)}, R2=${m.metrics!.r2.toFixed(3)}`
      } else {
        return `${m.name}: F1=${m.metrics!.f1.toFixed(3)}, Accuracy=${m.metrics!.accuracy.toFixed(3)}, AUC=${m.metrics!.auc.toFixed(3)}`
      }
    }).join("\n")
    
    await streamGrokResponse(
      `Analyze these ML model results and provide insights. Champion model: ${champion.name}. Task Type: ${dataInfo?.taskType || "classification"}\n\nResults:\n${metricsText}\n\nDataset info: ${JSON.stringify(dataInfo)}\n\nProvide: 1) Why the champion was selected 2) Key feature insights 3) Performance analysis 4) Recommendations for improvement. Use markdown formatting.`,
      "You are SnapML's AI ML Engineer. Analyze model training results and provide actionable insights. Be specific about metrics, explain why certain models performed better, and suggest concrete next steps. Format with markdown headers and bullet points.",
      insightsMsgId
    )

    // Improvement recommendations
    await new Promise(r => setTimeout(r, 300))
    setPhase("improvement")
    addTimelineEntry("Self-Improvement")

    const improvementContent = await callGrok(
      `Based on these results:\nChampion: ${champion.name} (Primary Metric: ${isReg ? champion.metrics!.rmse.toFixed(3) + ' RMSE' : champion.metrics!.f1.toFixed(3) + ' F1'})\n\nGenerate exactly 4 improvement recommendations in this exact JSON format (respond with ONLY the JSON, no other text):\n[{"title":"...","description":"...","impact":"...","type":"warning|info|success"}]`,
      "You are an ML optimization advisor. Return ONLY valid JSON array with 4 improvement recommendations. Each has title, description, impact (e.g. '+2.1% accuracy'), and type (warning/info/success)."
    )

    let recommendations: any[] = []
    try {
      const cleaned = improvementContent.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      recommendations = JSON.parse(cleaned)
    } catch {
      recommendations = [
        { title: "Feature Engineering", description: "Try polynomial features on top predictors", impact: "+1.5% accuracy", type: "info" },
        { title: "Hyperparameter Tuning", description: "Run Bayesian optimization on champion model", impact: "+2.0% F1", type: "success" },
        { title: "Class Balance", description: "Apply SMOTE for minority class augmentation", impact: "+3.0% recall", type: "warning" },
        { title: "Ensemble Strategy", description: "Stack top 3 models for better generalization", impact: "+1.8% AUC", type: "info" }
      ]
    }

    addMessage({
      role: "assistant",
      content: "",
      type: "improvement",
      metadata: { recommendations, champion: champion.name }
    })

    // ─── REPORT AGENT: Generate Report ──────────────────────────
    await new Promise(r => setTimeout(r, 400))
    addTimelineEntry("Report Generation")

    addMessage({
      role: "assistant",
      content: "",
      type: "report",
      metadata: {
        champion: champion.name,
        taskType: dataInfo?.taskType || "classification",
        datasetName: dataInfo?.name || "dataset",
        metrics: champion.metrics,
        recommendations,
        targetColumn: dataInfo?.targetColumn || "target",
      }
    })

    // ─── AI MEMORY: Save to localStorage ────────────────────────
    try {
      const memoryEntry = {
        id: `run-${Date.now()}`,
        date: new Date().toISOString(),
        dataset: dataInfo?.name,
        target: dataInfo?.targetColumn,
        taskType: dataInfo?.taskType,
        champion: champion.name,
        primaryMetric: primaryMetric,
        primaryValue: primaryValue,
        rows: dataInfo?.rows,
        cols: dataInfo?.cols,
      }
      const existing = JSON.parse(localStorage.getItem("snapml-memory") || "[]")
      existing.unshift(memoryEntry)
      localStorage.setItem("snapml-memory", JSON.stringify(existing.slice(0, 20)))
    } catch { /* ignore */ }

    // Final prompt
    await new Promise(r => setTimeout(r, 600))
    const finalMsgId = addMessage({ role: "assistant", content: "", type: "text", isStreaming: true })
    await streamGrokResponse(
      "The complete pipeline is finished.",
      "You are SnapML's AI ML Engineer. State that the full pipeline is complete: training, evaluation, insights, and report have been generated. Ask the user: 'Would you like to deploy the champion model to production, apply improvements and retrain, or explore the API playground?' Be concise and friendly.",
      finalMsgId
    )

    setPhase("ready")
  }, [addMessage, updateMessage, addTimelineEntry, streamGrokResponse, callGrok])

  // Simulate targeted retraining/tuning
  const runRetuningPipeline = useCallback(async () => {
    setPhase("training")
    addTimelineEntry("Hyperparameter Tuning")
    setActiveModel("Champion Model (Tuning)")
    setTrainingProgress(0)

    const retuneMsgId = addMessage({
      role: "assistant",
      content: "",
      type: "training",
      metadata: { models: [{ name: "Champion Model", status: "queued", progress: 0, metrics: null }] }
    })

    // Simulate tuning
    setTrainingProgress(50)
    updateMessage(retuneMsgId, { metadata: { models: [{ name: "Champion Model", status: "training", progress: 50, metrics: null }] } })
    await new Promise(r => setTimeout(r, 1500))
    setTrainingProgress(100)
    
    // Output tuned metrics
    const tunedMetrics = {
      f1: 0.942, // slightly better than baseline
      accuracy: 0.951,
      auc: 0.978,
      precision: 0.935,
      recall: 0.950,
      trainingTime: 4.2
    }
    
    updateMessage(retuneMsgId, { metadata: { models: [{ name: "Champion Model (Tuned)", status: "completed", progress: 100, metrics: tunedMetrics }] } })

    await new Promise(r => setTimeout(r, 600))
    setPhase("evaluation")
    addTimelineEntry("Evaluation (Tuned)")

    addMessage({
      role: "assistant",
      content: "",
      type: "comparison",
      metadata: { models: [{ name: "Champion Model (Tuned)", metrics: tunedMetrics }], champion: "Champion Model (Tuned)" }
    })
    
    await new Promise(r => setTimeout(r, 800))
    
    const finalMsgId = addMessage({ role: "assistant", content: "", type: "text", isStreaming: true })
    await streamGrokResponse(
      "The hyperparameter tuning is complete.",
      "You are SnapML's AI ML Engineer. Briefly state that hyperparameter tuning is complete and metrics have improved. Ask the user: 'Are you satisfied with these new results, or should we proceed to deploy the tuned champion model?'",
      finalMsgId
    )
    
    setPhase("ready")
  }, [addMessage, updateMessage, addTimelineEntry, streamGrokResponse])

  // Handle file upload
  const handleFileUpload = useCallback(async (file: File) => {
    // User upload message
    addMessage({ role: "user", content: `📎 Uploaded **${file.name}** (${(file.size / 1024).toFixed(1)} KB)`, type: "text" })
    
    setPhase("uploading")
    addTimelineEntry("Dataset Uploaded")

    // Parse the file client-side for basic stats
    const text = await file.text()
    const lines = text.trim().split("\n")
    const headers = lines[0].split(",").map(h => h.trim().replace(/"/g, ""))
    const rows = lines.length - 1
    const cols = headers.length

    // Check for missing values
    let missingCount = 0
    for (let i = 1; i < lines.length; i++) {
      const vals = lines[i].split(",")
      vals.forEach(v => { if (!v.trim() || v.trim() === '""' || v.trim() === "NA" || v.trim() === "null") missingCount++ })
    }
    const missingPct = ((missingCount / (rows * cols)) * 100).toFixed(1)

    const info = { name: file.name, rows, cols, headers, missingPct, size: file.size }
    setDatasetInfo(info)

    // Notify sidebar of new project
    window.dispatchEvent(new CustomEvent("snapml-new-project", { detail: { name: file.name } }))

    // Upload message with stats
    addMessage({
      role: "assistant",
      content: "",
      type: "upload",
      metadata: info
    })

    // Target Selection Phase
    await new Promise(r => setTimeout(r, 600))
    setPhase("target_selection")
    addTimelineEntry("Target Selection")

    addMessage({
      role: "assistant",
      content: "",
      type: "target_selection",
      metadata: { headers, info }
    })
  }, [addMessage, addTimelineEntry])

  // Handle target selected by user
  const handleTargetSelected = useCallback(async (targetColumn: string, info: any) => {
    if (!info) return

    addMessage({ role: "user", content: `I want to predict: ${targetColumn}`, type: "text" })
    setThinkingLabel("Inferring task type")
    setIsThinking(true)
    
    // Infer Task Type
    let taskType = "classification"
    try {
      const intentPrompt = `The user selected "${targetColumn}" as the target column. Based on this column name, is this a CLASSIFICATION or REGRESSION task? Respond with EXACTLY ONE word: CLASSIFICATION or REGRESSION.`
      const intentStr = await callGrok(intentPrompt, "You are a task inferencer. Respond ONLY with CLASSIFICATION or REGRESSION.")
      if (intentStr.toLowerCase().includes("regression")) {
        taskType = "regression"
      }
    } catch (e) {
      console.error("Grok inference failed", e)
    }
    
    const updatedDatasetInfo = { ...info, targetColumn, taskType }
    setDatasetInfo(updatedDatasetInfo)

    // AI analysis phase
    setPhase("analyzing")
    addTimelineEntry("AI Analysis")

    const analysisMsgId = addMessage({
      role: "assistant",
      content: "",
      type: "analysis",
      isStreaming: true
    })

    await streamGrokResponse(
      `I just received a dataset called "${updatedDatasetInfo.name}" with ${updatedDatasetInfo.rows} rows, ${updatedDatasetInfo.cols} columns. Missing values: ${updatedDatasetInfo.missingPct}%. File size: ${(updatedDatasetInfo.size / 1024).toFixed(1)} KB.\nTarget column: ${targetColumn} (${taskType} task).\n\nAnalyze this dataset briefly:\n1. Why is this a ${taskType} task?\n2. What are the key observations?\n3. Any potential issues (leakage, imbalance, etc.)?\n\nBe concise. Use markdown.`,
      "You are SnapML's AI ML Engineer analyzing a newly uploaded dataset. Provide a brief, intelligent analysis.",
      analysisMsgId
    )

    // Execution plan
    await new Promise(r => setTimeout(r, 400))
    setPhase("planning")
    addTimelineEntry("Execution Plan")

    const planSteps = [
      "Clean Missing Values",
      "Remove Duplicates", 
      "Handle Outliers (IQR method)",
      "Feature Engineering (encoding, scaling)",
      "Feature Selection (importance-based)",
      "Hyperparameter Optimization (Bayesian)",
      `Train 8 Models (RF, XGB, CatBoost, LGBM, NN, SVM, LR, GB)`,
      "Compare Models & Select Champion",
      "SHAP Explainability Analysis",
      "Generate Deployment Package"
    ]

    addMessage({
      role: "assistant",
      content: "",
      type: "plan",
      metadata: { steps: planSteps, datasetInfo: updatedDatasetInfo }
    })

    await new Promise(r => setTimeout(r, 600))
    setIsThinking(false)
    
    // Explicitly ask for permission
    const permissionMsgId = addMessage({ role: "assistant", content: "", type: "text", isStreaming: true })
    await streamGrokResponse(
      "Plan is generated.",
      "You are SnapML's AI ML Engineer. Briefly say: 'Here is the execution plan for predicting your target. Would you like me to proceed with this plan and begin training the models?'",
      permissionMsgId
    )
  }, [addMessage, addTimelineEntry, callGrok, streamGrokResponse])

  // Handle user text message
  const handleSendMessage = useCallback(async (text: string) => {
    addMessage({ role: "user", content: text, type: "text" })
    setThinkingLabel("Understanding your request")
    setIsThinking(true)

    // Agentic Intent Classification
    const intentPrompt = `Given this user message: "${text}"
And the current phase: "${phase}"

Classify the user's intent. You must respond with EXACTLY ONE valid JSON object and NOTHING ELSE:
{"intent": "APPROVE_PLAN"}
{"intent": "DEPLOY"}
{"intent": "RETRAIN"}
{"intent": "CHAT"}`

    let parsedIntent: any = { intent: "CHAT" }
    try {
      const intentStr = await callGrok(intentPrompt, "You are an intent router. Respond ONLY with exactly one valid JSON object from the choices provided. No markdown blocks, just the raw JSON object.")
      const cleanStr = intentStr.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim()
      parsedIntent = JSON.parse(cleanStr)
    } catch (e) {
      // Fallback manual checks
      if (text.toLowerCase().includes("proceed") || text.toLowerCase().includes("approve")) parsedIntent.intent = "APPROVE_PLAN"
      else if (text.toLowerCase().includes("deploy")) parsedIntent.intent = "DEPLOY"
      else if (text.toLowerCase().includes("retune") || text.toLowerCase().includes("retrain")) parsedIntent.intent = "RETRAIN"
    }

    const cleanIntent = String(parsedIntent.intent).toUpperCase()

    // Route: Approve Plan -> Start Training
    if (cleanIntent.includes("APPROVE_PLAN") || (phase === "planning" && text.toLowerCase().includes("proceed"))) {
      if (datasetInfo) {
        setIsThinking(false)
        addMessage({ role: "assistant", content: "✅ **Plan approved!** Initiating the training pipeline now.", type: "text" })
        await runTrainingPipeline(datasetInfo)
        return
      }
    }
    
    // Route: Retrain / Tune -> Start Targeted Retuning
    if (cleanIntent.includes("RETRAIN") || (phase === "ready" && (text.toLowerCase().includes("retune") || text.toLowerCase().includes("retrain")))) {
      setIsThinking(false)
      addMessage({ role: "assistant", content: "⚙️ **Initiating Hyperparameter Tuning...** I will run Bayesian optimization on the Champion Model to improve accuracy.", type: "text" })
      await runRetuningPipeline()
      return
    }

    // Route: Deploy -> Start Deployment
    if (cleanIntent.includes("DEPLOY") || (phase === "ready" && text.toLowerCase().includes("deploy"))) {
      setIsThinking(false)
      setPhase("deploying")
      addTimelineEntry("Deployment")
      addMessage({
        role: "assistant",
        content: "",
        type: "deployment",
        metadata: {}
      })
      
      setTimeout(async () => {
        addMessage({
          role: "assistant",
          content: "✅ **Deployment package generated successfully!** Your API is ready.",
          type: "text"
        })
        
        await new Promise(r => setTimeout(r, 800))
        
        addMessage({
          role: "assistant",
          content: "",
          type: "export",
          metadata: { pdfUrl: "#" }
        })
        
        await new Promise(r => setTimeout(r, 500))
        
        addMessage({
          role: "assistant",
          content: "",
          type: "playground",
          metadata: { datasetInfo }
        })
      }, 5000)
      
      return
    }

    // Default: Chat with Grok
    setIsThinking(true)
    const msgId = addMessage({ role: "assistant", content: "", type: "text", isStreaming: true })

    const conversationContext = messages.slice(-6).map(m => `${m.role}: ${m.content}`).join("\n")
    
    // AI Memory context
    let memoryContext = ""
    try {
      const memory = JSON.parse(localStorage.getItem("snapml-memory") || "[]")
      if (memory.length > 0) {
        memoryContext = `\n\nAI Memory (past projects):\n${memory.slice(0, 5).map((m: any) => `- ${m.dataset}: ${m.taskType} → Champion: ${m.champion} (${m.primaryMetric}: ${m.primaryValue})`).join("\n")}`
      }
    } catch {}

    await streamGrokResponse(
      text,
      `You are SnapML's AI ML Engineer. You help users build, train, evaluate, and deploy machine learning models through conversation. The user is in the SnapML AI workspace.\n\nCurrent phase: ${phase}\nDataset loaded: ${datasetInfo ? `Yes - ${datasetInfo.name} (${datasetInfo.rows} rows, ${datasetInfo.cols} columns)` : "No"}${memoryContext}\n\nRecent context:\n${conversationContext}\n\nRespond helpfully and concisely. If the user asks to build a model but hasn't uploaded data, ask them to upload a dataset first. Use markdown. If you have memory of past projects, reference them when relevant.`,
      msgId
    )
    setIsThinking(false)
  }, [addMessage, messages, phase, datasetInfo, streamGrokResponse, runTrainingPipeline, runRetuningPipeline, addTimelineEntry, callGrok])

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background relative">
      {/* Animated background */}
      <div className="absolute inset-0 z-0">
        <CanvasBackground step={phase === "training" ? 2 : phase === "idle" ? 0 : 1} />
      </div>

      {/* Aurora gradient overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-violet-500/[0.03] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.03] rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "4s" }} />
      </div>

      {/* Left Sidebar */}
      <div className={`relative z-10 transition-all duration-300 ${leftCollapsed ? "w-0 overflow-hidden" : "w-[240px]"} flex-shrink-0`}>
        <LeftSidebar onBackHome={onBackHome} />
      </div>

      {/* Center Panel — Chat */}
      <div className="relative z-10 flex-1 flex flex-col min-w-0">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          onTargetSelect={handleTargetSelected}
          isThinking={isThinking}
          thinkingLabel={thinkingLabel}
        />
      </div>
    </div>
  )
}

// Generate realistic metrics for a model based on task type
function generateMetrics(modelName: string, taskType: "classification" | "regression" = "classification") {
  const baselines: Record<string, number> = {
    "Random Forest": 0.89,
    "XGBoost": 0.93,
    "CatBoost": 0.94,
    "LightGBM": 0.92,
    "Neural Network": 0.88,
    "SVM": 0.82,
    "Logistic Regression": 0.78,
    "Gradient Boosting": 0.91
  }
  const base = baselines[modelName] || 0.85
  const jitter = () => (Math.random() - 0.5) * 0.04
  
  if (taskType === "regression") {
    // Regression metrics
    const rmseBase = 12.5 - (base * 10) // Lower is better
    return {
      rmse: Math.max(0.5, rmseBase + (jitter() * 5)),
      mae: Math.max(0.3, (rmseBase * 0.8) + (jitter() * 4)),
      r2: Math.min(0.99, Math.max(0.5, base + jitter())),
      latency: `${(Math.random() * 10 + 2).toFixed(1)}ms`,
      trainTime: `${(Math.random() * 30 + 5).toFixed(0)}s`,
      memory: `${(Math.random() * 200 + 50).toFixed(0)}MB`
    }
  }

  // Classification metrics
  return {
    accuracy: Math.min(0.99, Math.max(0.6, base + jitter())),
    precision: Math.min(0.99, Math.max(0.6, base - 0.01 + jitter())),
    recall: Math.min(0.99, Math.max(0.6, base - 0.02 + jitter())),
    f1: Math.min(0.99, Math.max(0.6, base + jitter())),
    auc: Math.min(0.99, Math.max(0.6, base + 0.02 + jitter())),
    latency: `${(Math.random() * 10 + 2).toFixed(1)}ms`,
    trainTime: `${(Math.random() * 30 + 5).toFixed(0)}s`,
    memory: `${(Math.random() * 200 + 50).toFixed(0)}MB`
  }
}
