import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteHeader({ onStartTraining }: { onStartTraining?: () => void }) {
  return (
    <header className="w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <button onClick={() => window.location.reload()} className="flex items-center gap-3 bg-transparent border-0 cursor-pointer text-left">
          <img
            src="/snapml-logo.png"
            alt="SnapML Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="text-2xl font-bold tracking-tight">Snap<span className="text-primary">ML</span></span>
        </button>

        <nav className="flex items-center gap-3 sm:gap-6">
          <a
            href="#"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </a>
          <Button
            onClick={onStartTraining}
            className="gap-1.5 rounded-lg bg-primary font-medium text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 cursor-pointer"
          >
            Start Training
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </nav>
      </div>
    </header>
  )
}
