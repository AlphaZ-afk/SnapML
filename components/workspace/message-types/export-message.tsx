"use client"

import { FileText, Download, ArrowRight, Home, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportMessageProps {
  metadata?: {
    pdfUrl?: string
  }
}

export function ExportMessage({ metadata }: ExportMessageProps) {
  const handleHome = () => {
    window.location.href = "/"
  }
  
  const handleNewProject = () => {
    window.location.reload()
  }

  const handleDownload = () => {
    // Dynamically import jsPDF to avoid SSR issues
    import("jspdf").then(({ jsPDF }) => {
      const doc = new jsPDF()
      
      // Title
      doc.setFontSize(22)
      doc.setTextColor(30, 41, 59)
      doc.text("SnapML Executive Summary Report", 20, 30)
      
      // Subtitle / Date
      doc.setFontSize(10)
      doc.setTextColor(100, 116, 139)
      doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 40)
      
      // Divider
      doc.setDrawColor(226, 232, 240)
      doc.line(20, 45, 190, 45)
      
      // Section: Model Performance
      doc.setFontSize(16)
      doc.setTextColor(15, 23, 42)
      doc.text("Model Performance", 20, 60)
      
      doc.setFontSize(12)
      doc.setTextColor(51, 65, 85)
      doc.text("Champion Model: Tuned Model", 20, 75)
      doc.text("Accuracy: 95.1%", 20, 85)
      doc.text("F1-Score: 94.2%", 20, 95)
      doc.text("AUC: 97.8%", 20, 105)
      
      // Section: Deployment Status
      doc.setFontSize(16)
      doc.setTextColor(15, 23, 42)
      doc.text("Deployment Status", 20, 125)
      
      doc.setFontSize(12)
      doc.setTextColor(51, 65, 85)
      doc.text("API successfully deployed and ready for traffic.", 20, 140)
      
      // Footer
      doc.setFontSize(9)
      doc.setTextColor(148, 163, 184)
      doc.text("*This is an automatically generated simulated report.*", 20, 280)
      
      doc.save("model_evaluation_report.pdf")
    })
  }

  return (
    <div className="bg-gradient-to-br from-indigo-500/5 to-rose-500/5 border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-500/10">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white/90">Executive Summary Report</h3>
          <p className="text-sm text-white/50">Comprehensive report with metrics and visualizations</p>
        </div>
      </div>
      
      <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <span className="text-xs font-bold text-rose-400">PDF</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white/80">model_evaluation_report.pdf</p>
            <p className="text-xs text-white/40">Generated just now • 1.2 KB</p>
          </div>
        </div>
        
        <Button 
          onClick={handleDownload}
          variant="outline" 
          className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 hover:bg-indigo-500/20 gap-2"
        >
          <Download className="w-4 h-4" />
          Download
        </Button>
      </div>

      <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
        <p className="text-sm font-medium text-white/60 text-center mb-1">What would you like to do next?</p>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={handleNewProject}
            className="w-full bg-white/10 hover:bg-white/15 text-white/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Start New Project
          </Button>
          
          <Button 
            onClick={handleHome}
            variant="outline"
            className="w-full bg-transparent border-white/10 hover:bg-white/5 text-white/70 gap-2"
          >
            <Home className="w-4 h-4" />
            Go to Home Page
          </Button>
        </div>
      </div>
    </div>
  )
}
