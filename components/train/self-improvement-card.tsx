"use client"

import { useState } from "react"
import { RefreshCw, Bot, MessageSquarePlus, Check } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function SelfImprovementCard() {
  const [running, setRunning] = useState(false)
  const [improved, setImproved] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [feedbackSent, setFeedbackSent] = useState(false)

  const runLoop = () => {
    setRunning(true)
    setImproved(false)
    setTimeout(() => {
      setRunning(false)
      setImproved(true)
    }, 1600)
  }

  return (
    <Card className="border-border/60 bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 text-primary" aria-hidden="true" />
          Self-improvement loop
        </CardTitle>
        <CardDescription>Let the model keep learning from AI suggestions and your feedback.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-lg border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="font-medium">AI improvement</h3>
          </div>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
            SnapML re-examines errors, engineers new features and re-tunes automatically to push accuracy higher.
          </p>
          {improved && (
            <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-primary">
              <Check className="h-4 w-4" aria-hidden="true" />
              Accuracy improved to 94.8%
            </p>
          )}
          <Button onClick={runLoop} disabled={running} variant="outline" className="mt-4 gap-2 bg-transparent">
            <RefreshCw className={running ? "h-4 w-4 animate-spin" : "h-4 w-4"} aria-hidden="true" />
            {running ? "Improving..." : "Run improvement loop"}
          </Button>
        </div>

        <div className="flex flex-col rounded-lg border border-border/60 bg-background/40 p-4">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="h-4 w-4 text-accent" aria-hidden="true" />
            <h3 className="font-medium">Feedback improvement</h3>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Tell SnapML what to prioritize (e.g. reduce false positives) and it retrains with your guidance.
          </p>
          <Textarea
            value={feedback}
            onChange={(e) => {
              setFeedback(e.target.value)
              setFeedbackSent(false)
            }}
            placeholder="e.g. Prioritize recall over precision for the churn class."
            className="mt-3 min-h-20 resize-none"
          />
          <Button
            onClick={() => setFeedbackSent(true)}
            disabled={!feedback.trim()}
            variant="outline"
            className="mt-3 gap-2 bg-transparent"
          >
            {feedbackSent ? <Check className="h-4 w-4" aria-hidden="true" /> : null}
            {feedbackSent ? "Feedback applied" : "Submit feedback"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
