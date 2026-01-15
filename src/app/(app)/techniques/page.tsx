"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Scale, Brain, Swords, ChevronLeft, Search } from "lucide-react";
import { Card, Badge, Input } from "@/components/ui";
import { techniques, techniqueCategories } from "@/data/techniques";
import { cn, getCategoryInfo } from "@/lib/utils";
import type { TechniqueCategory } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  tactical_empathy: <Heart size={24} />,
  harvard: <Scale size={24} />,
  psychology: <Brain size={24} />,
  hardball: <Swords size={24} />,
};

const categoryColors: Record<string, string> = {
  tactical_empathy: "from-pink-500 to-pink-700",
  harvard: "from-blue-500 to-blue-700",
  psychology: "from-purple-500 to-purple-700",
  hardball: "from-red-500 to-red-700",
};

export default function TechniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | "all">("all");

  const filteredTechniques = techniques.filter((tech) => {
    const matchesSearch =
      searchQuery === "" ||
      tech.name.includes(searchQuery) ||
      tech.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.description.includes(searchQuery);

    const matchesCategory = selectedCategory === "all" || tech.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-[var(--text-primary)]">ספריית טכניקות</h1>
        <p className="text-[var(--text-secondary)] mt-2">
          18 טכניקות מקצועיות למשא ומתן מוצלח
        </p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up stagger-1">
        <div className="flex-1">
          <Input
            placeholder="חפש טכניקה..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search size={18} />}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-8 animate-fade-in-up stagger-2">
        <button
          onClick={() => setSelectedCategory("all")}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-all",
            selectedCategory === "all"
              ? "bg-[var(--accent)] text-black"
              : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
          )}
        >
          הכל ({techniques.length})
        </button>
        {techniqueCategories.map((cat) => {
          const count = techniques.filter((t) => t.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as TechniqueCategory)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedCategory === cat.id
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
              )}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Techniques Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {filteredTechniques.map((tech, index) => {
          const catInfo = getCategoryInfo(tech.category);
          return (
            <Link key={tech.code} href={`/techniques/${tech.code}`}>
              <Card
                className={cn("group cursor-pointer h-full", `stagger-${(index % 4) + 1}`)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                      `bg-gradient-to-br ${categoryColors[tech.category]} text-white`
                    )}
                  >
                    {categoryIcons[tech.category]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-[var(--text-primary)]">
                        {tech.name}
                      </h3>
                      <Badge variant="default" size="sm">
                        {tech.nameEn}
                      </Badge>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2">
                      {tech.description}
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <span className={cn("text-xs", catInfo.color)}>{catInfo.name}</span>
                      <span className="text-xs text-[var(--text-muted)]">•</span>
                      <span className="text-xs text-[var(--text-muted)]">
                        קושי: {tech.difficulty}/5
                      </span>
                    </div>
                  </div>
                  <ChevronLeft size={20} className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-1 transition-all shrink-0 mt-1" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {filteredTechniques.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--text-secondary)]">לא נמצאו טכניקות מתאימות</p>
        </div>
      )}
    </div>
  );
}
