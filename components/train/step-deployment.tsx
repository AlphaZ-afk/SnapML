"use client"

import { useState } from "react"
import { ShieldCheck, Copy, Check, Eye, EyeOff, Server, Terminal, ArrowRight, Cloud, Activity, DollarSign } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { DatasetSchema } from "./step-upload"
import { ModelLeaderboardItem } from "./dashboard-workflow"

type Props = {
  onComplete: () => void
  schema: DatasetSchema
  champion: ModelLeaderboardItem
}

type CloudTarget = "fastapi" | "docker" | "k8s" | "vertex" | "azure" | "sagemaker"

export function StepDeployment({ onComplete, schema, champion }: Props) {
  const [showApiKey, setShowApiKey] = useState(false)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [cloudTarget, setCloudTarget] = useState<CloudTarget>("fastapi")

  const targetConfigs = {
    fastapi: {
      name: "FastAPI REST Server",
      cost: "$0.01 / hr",
      costDesc: "Self-hosted locally or inside virtual servers.",
      framework: "FastAPI (Python 3.11)",
      port: "8000",
      cmd: `uvicorn app.main:app --host 0.0.0.0 --port 8000`,
      snippet: `import requests\n\nresp = requests.post(\n    "http://localhost:8000/predict",\n    headers={"X-API-Key": "sml_live_key"},\n    json=payload\n)`
    },
    docker: {
      name: "Docker Container Image",
      cost: "$0.02 / hr",
      costDesc: "Containerized hosting inside any cloud instance.",
      framework: "Docker Engine (Alpine Linux)",
      port: "8000",
      cmd: `docker build -t snapml-xgb-v2 .\ndocker run -p 8000:8000 snapml-xgb-v2`,
      snippet: `FROM python:3.11-slim\nWORKDIR /app\nCOPY requirements.txt .\nRUN pip install -r requirements.txt\nCOPY . .\nCMD ["uvicorn", "app:app", "--host", "0.0.0.0"]`
    },
    k8s: {
      name: "Kubernetes Cluster Node",
      cost: "$0.15 / hr",
      costDesc: "Scalable container pods with ingress rules.",
      framework: "K8s Pod (Helm Orchestrated)",
      port: "80",
      cmd: `kubectl apply -f snapml-deployment.yaml`,
      snippet: `apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: snapml-xgb-inference\nspec:\n  replicas: 3\n  selector:\n    matchLabels:\n      app: snapml-xgb`
    },
    vertex: {
      name: "Google Cloud Vertex AI",
      cost: "$0.42 / hr",
      costDesc: "Fully managed GCP endpoint nodes.",
      framework: "Vertex AI Prediction Endpoint",
      port: "443 (GCP Ingress)",
      cmd: `gcloud ai endpoints deploy-model $ENDPOINT_ID \\\n  --model=$MODEL_ID --display-name="SnapML-XGB"`,
      snippet: `from google.cloud import aiplatform\n\nendpoint = aiplatform.Endpoint(endpoint_name="snapml-xgb-endpoint")\nprediction = endpoint.predict(instances=[payload])`
    },
    azure: {
      name: "Azure Machine Learning",
      cost: "$0.48 / hr",
      costDesc: "Managed Azure AKS container nodes.",
      framework: "Azure ML Online Endpoint",
      port: "443 (Azure REST)",
      cmd: `az ml online-endpoint update --name snapml-endpoint --file endpoint.yml`,
      snippet: `from azure.ai.ml import MLClient\nfrom azure.identity import DefaultAzureCredential\n\nml_client = MLClient(DefaultAzureCredential(), subscription_id, group, workspace)\nml_client.online_endpoints.invoke(endpoint_name, request_file)`
    },
    sagemaker: {
      name: "AWS SageMaker Endpoint",
      cost: "$0.54 / hr",
      costDesc: "Managed ml.m5.large inference instances.",
      framework: "SageMaker Real-Time Hosting",
      port: "443 (AWS SDK)",
      cmd: `aws sagemaker create-model --model-name snapml-xgb-v2 \\\n  --primary-container Image=$IMAGE_URI`,
      snippet: `import boto3\n\nclient = boto3.client('sagemaker-runtime')\nresponse = client.invoke_endpoint(\n    EndpointName='snapml-xgb-endpoint',\n    ContentType='application/json',\n    Body=json.dumps(payload)\n)`
    }
  }

  const activeConfig = targetConfigs[cloudTarget]

  const deploymentDetails = {
    status: "Active",
    model: `${champion.name} (tuned - v2)`,
    endpoint: `https://api.snapml.ai/v1/predict/xgb-model-4091`,
    healthEndpoint: "https://api.snapml.ai/v1/health",
    swaggerDocs: "https://api.snapml.ai/docs/xgb-model-4091",
    apiKey: "sml_live_8f3a9d72c10b4f8a9e7d3c5b2a6f7d",
    deployedAt: "July 3, 2026, 1:15 PM",
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(id)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Create example JSON payload based on features
  const features = schema.columns.filter((c) => c.toLowerCase() !== schema.targetColumn.toLowerCase()).slice(0, 5)
  const isMedical = schema.fileName.toLowerCase().includes("cancer") || schema.targetColumn.toLowerCase() === "diagnosis"
  const isRegression = schema.problemType === "regression"
  
  const mockValues: Record<string, any> = {
    annual_income: 82000,
    credit_score: 710,
    account_age: 36,
    num_transactions: 24,
    region: "North",
    has_mortgage: "Yes",
    radius_mean: 17.99,
    texture_mean: 10.38,
    perimeter_mean: 122.8,
    area_mean: 1001.0,
    smoothness_mean: 0.1184,
  }

  const payload: Record<string, any> = {}
  features.forEach((feat) => {
    payload[feat] = mockValues[feat] !== undefined 
      ? mockValues[feat] 
      : (isMedical ? parseFloat((10 + Math.random() * 40).toFixed(2)) : isRegression ? parseFloat((2 + Math.random() * 10).toFixed(1)) : 50)
  })

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Production <span className="text-primary">API Deployment</span>
        </h2>
        <p className="mt-3 text-muted-foreground text-xs">
          Deploy your champion model to cloud-agnostic targets. The Deployment Agent optimizes containers for low latency.
        </p>
      </div>

      {/* Cloud target selector with cost estimation details */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {(["fastapi", "docker", "k8s", "vertex", "azure", "sagemaker"] as CloudTarget[]).map((tgt) => {
          const cfg = targetConfigs[tgt]
          const isSelected = cloudTarget === tgt
          return (
            <button
              key={tgt}
              onClick={() => setCloudTarget(tgt)}
              className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected 
                  ? "bg-primary/20 border-primary text-white font-bold" 
                  : "bg-black/25 border-border/20 text-muted-foreground hover:text-white"
              }`}
            >
              <span className="text-[10px] block font-bold capitalize">{tgt}</span>
              <span className="text-[9px] text-emerald-400 font-semibold block mt-0.5">{cfg.cost}</span>
            </button>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Active Deploy</span>
          <span className="text-xs font-bold text-white mt-1.5 block truncate">{activeConfig.name}</span>
        </Card>
        <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">Cost Estimate</span>
          <span className="text-xs font-bold text-emerald-400 mt-1.5 block truncate" title={activeConfig.costDesc}>
            {activeConfig.cost} ({activeConfig.costDesc.split(" ")[0]} host)
          </span>
        </Card>
        <Card className="border-border/40 bg-card/45 backdrop-blur-md p-4 text-center">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest block">API Port / Type</span>
          <span className="text-xs font-bold text-white mt-1.5 block">{activeConfig.port}</span>
        </Card>
      </div>

      {/* Main Endpoint Details */}
      <Card className="border-border/40 bg-card/45 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Server className="h-4.5 w-4.5 text-primary" />
            Deployment Endpoints
          </CardTitle>
          <CardDescription>REST APIs generated for application integrations.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-semibold">REST Prediction Endpoint (POST)</span>
            <div className="flex bg-black/45 rounded-lg border border-border/20 overflow-hidden text-xs sm:text-sm">
              <span className="p-2.5 px-3 bg-primary/20 text-primary font-bold border-r border-border/20">POST</span>
              <span className="p-2.5 px-4 font-mono text-white flex-1 truncate">{deploymentDetails.endpoint}</span>
              <button
                onClick={() => copyToClipboard(deploymentDetails.endpoint, "endpoint")}
                className="p-2.5 px-3 text-muted-foreground hover:text-white border-l border-border/20 bg-background/20 cursor-pointer"
              >
                {copiedKey === "endpoint" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs text-muted-foreground font-semibold">Deployment Command</span>
            <div className="flex bg-black/45 rounded-lg border border-border/20 overflow-hidden text-xs">
              <span className="p-2 bg-secondary/30 text-white font-bold border-r border-border/20 flex items-center px-3">CMD</span>
              <span className="p-2 px-4 font-mono text-slate-300 flex-1 truncate">{activeConfig.cmd}</span>
              <button
                onClick={() => copyToClipboard(activeConfig.cmd, "cmd")}
                className="p-2.5 px-3 text-muted-foreground hover:text-white border-l border-border/20 bg-background/20 cursor-pointer"
              >
                {copiedKey === "cmd" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Key Security Card */}
      <Card className="border-border/40 bg-card/45 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4.5 w-4.5 text-primary" />
            API Key Authentication
          </CardTitle>
          <CardDescription>Include this token in the header of requests: `X-API-Key`</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex bg-black/45 rounded-lg border border-border/20 overflow-hidden text-xs sm:text-sm">
            <span className="p-2.5 px-4 font-mono text-white flex-1 truncate">
              {showApiKey ? deploymentDetails.apiKey : "••••••••••••••••••••••••••••••••••••••••"}
            </span>
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="p-2.5 px-3 text-muted-foreground hover:text-white border-l border-border/20 bg-background/20 cursor-pointer"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button
              onClick={() => copyToClipboard(deploymentDetails.apiKey, "apiKey")}
              className="p-2.5 px-3 text-muted-foreground hover:text-white border-l border-border/20 bg-background/20 cursor-pointer"
            >
              {copiedKey === "apiKey" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Code example */}
      <Card className="border-border/40 bg-card/45 backdrop-blur-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="h-4.5 w-4.5 text-primary" />
            Inference Code Snippet
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <pre className="p-4 bg-black/45 border border-border/20 rounded-lg font-mono text-xs text-slate-200 overflow-x-auto select-all">
{activeConfig.snippet}
          </pre>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-2">
        <Button
          size="lg"
          onClick={onComplete}
          className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg shadow-lg cursor-pointer text-xs"
        >
          Test Endpoints in API Playground
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
