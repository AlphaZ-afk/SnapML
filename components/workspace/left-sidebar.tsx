"use client";

import { useState, useEffect } from "react";
import {
  FolderKanban,
  Brain,
  Plus,
  Clock,
  Sparkles,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeftSidebarProps {
  onBackHome: () => void;
}

type SavedProject = {
  id: string;
  name: string;
  status: "Active" | "Training" | "Completed" | "Idle";
  dotColor: string;
  createdAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Active: "bg-emerald-400",
  Training: "bg-violet-400",
  Completed: "bg-sky-400",
  Idle: "bg-white/30",
};

export function LeftSidebar({ onBackHome }: LeftSidebarProps) {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("snapml-projects");
      if (stored) {
        setProjects(JSON.parse(stored));
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Listen for new project events (fired by ai-workspace when dataset is uploaded)
  useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { name } = e.detail;
      const newProject: SavedProject = {
        id: `proj-${Date.now()}`,
        name,
        status: "Active",
        dotColor: STATUS_COLORS["Active"],
        createdAt: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      };
      setProjects((prev) => {
        // Avoid duplicates by name
        const filtered = prev.filter((p) => p.name !== name);
        const updated = [newProject, ...filtered].slice(0, 10); // Keep max 10
        localStorage.setItem("snapml-projects", JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener("snapml-new-project" as any, handler);
    return () => window.removeEventListener("snapml-new-project" as any, handler);
  }, []);

  const removeProject = (id: string) => {
    setProjects((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem("snapml-projects", JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <aside
      className="h-screen w-[240px] bg-card/10 backdrop-blur-2xl border-r border-white/5 flex flex-col select-none"
    >
      {/* ── Logo Area ── */}
      <div className="flex items-center justify-between px-4 pt-5 pb-3">
        <div className="flex items-center gap-2">
          <img
            src="/snapml-logo.png"
            alt="SnapML"
            className="h-7 w-7 object-contain"
          />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Snap<span className="text-primary">ML</span>
          </span>
        </div>
        <button
          onClick={onBackHome}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors rounded-md px-2 py-1 hover:bg-white/5"
        >
          Back
        </button>
      </div>

      {/* ── New Project Button ── */}
      <div className="px-3 pt-2 pb-4">
        <Button
          className="w-full justify-center gap-2 text-xs font-medium h-9 rounded-lg"
          size="sm"
        >
          <Plus className="h-3.5 w-3.5" />
          New Project
        </Button>
      </div>

      {/* ── Projects Section ── */}
      <div className="flex-1 px-3 overflow-y-auto">
        <div className="flex items-center gap-2 px-3 pb-2">
          <FolderKanban className="h-3 w-3 text-primary/60" />
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-medium">
            Projects
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3">
              <Sparkles className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-xs text-white/30 leading-relaxed">
              Upload a dataset to start your first project
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group flex items-center gap-2.5 w-full rounded-lg p-2.5 px-3 text-xs text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200 ease-out cursor-pointer"
                onMouseEnter={() => setHoveredId(project.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span
                  className={`h-2 w-2 rounded-full ${STATUS_COLORS[project.status] || "bg-white/30"} flex-shrink-0 ring-2 ring-black/20`}
                />
                <span className="truncate flex-1">{project.name}</span>
                {hoveredId === project.id ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeProject(project.id);
                    }}
                    className="text-white/20 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground/40">
                    {project.createdAt}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="mt-auto border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-2 text-[10px] text-white/20">
          <Clock className="w-3 h-3" />
          <span>SnapML v2.0 · AI-Native</span>
        </div>
      </div>
    </aside>
  );
}
