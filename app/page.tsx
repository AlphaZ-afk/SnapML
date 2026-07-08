"use client"

import { useState } from "react"
import { SiteHeader } from "@/components/site-header"
import { HeroSection } from "@/components/hero-section"
import { FeatureCards } from "@/components/feature-cards"
import { AIWorkspace } from "@/components/workspace/ai-workspace"
import { CanvasBackground } from "@/components/train/canvas-background"

export default function Page() {
  const [view, setView] = useState<"landing" | "workspace">("landing")

  return (
    <main className="min-h-screen bg-background relative">
      {view === "landing" ? (
        <div className="animate-fade-in relative z-10">
          <CanvasBackground step={0} />
          <SiteHeader onStartTraining={() => setView("workspace")} />
          <HeroSection onStartTraining={() => setView("workspace")} />
          <FeatureCards />
        </div>
      ) : (
        <div className="animate-fade-in">
          <AIWorkspace onBackHome={() => setView("landing")} />
        </div>
      )}
    </main>
  )
}
