"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Heart, Scale, Brain, Swords, ChevronLeft, Search, BookOpen, Star, Filter } from "lucide-react";
import { Badge, Input } from "@/components/ui";
import { techniques, techniqueCategories } from "@/data/techniques";
import { cn, getCategoryInfo } from "@/lib/utils";
import type { TechniqueCategory } from "@/types";

const categoryIcons: Record<string, React.ReactNode> = {
  tactical_empathy: <Heart size={20} />,
  harvard: <Scale size={20} />,
  psychology: <Brain size={20} />,
  hardball: <Swords size={20} />,
};

const categoryColors: Record<string, string> = {
  tactical_empathy: "from-rose-500 to-pink-600",
  harvard: "from-sky-500 to-blue-600",
  psychology: "from-violet-500 to-purple-600",
  hardball: "from-red-500 to-orange-600",
};

const categoryAccentColors: Record<string, string> = {
  tactical_empathy: "text-rose-400",
  harvard: "text-sky-400",
  psychology: "text-violet-400",
  hardball: "text-red-400",
};

export default function TechniquesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory | "all">("all");

  const filteredTechniques = useMemo(() => {
    return techniques.filter((tech) => {
      const matchesSearch =
        searchQuery === "" ||
        tech.name.includes(searchQuery) ||
        tech.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tech.description.includes(searchQuery);

      const matchesCategory = selectedCategory === "all" || tech.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    techniqueCategories.forEach((cat) => {
      counts[cat.id] = techniques.filter((t) => t.category === cat.id).length;
    });
    return counts;
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header - Minimal */}
      <div className="mb-8 fade-in">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center">
            <BookOpen size={22} className="text-black" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">
            ספריית טכניקות
          </h1>
        </div>
        <p className="text-[var(--text-secondary)] text-lg">
          {techniques.length} טכניקות מקצועיות מעולם המשא ומתן
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-[var(--bg-primary)]/90 backdrop-blur-sm border-b border-[var(--border-subtle)] mb-6 slide-up">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <Input
              placeholder="חפש טכניקה…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} />}
              className="w-full"
            />
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            <div className="hidden md:flex items-center gap-1 text-[var(--text-muted)] ml-2">
              <Filter size={14} aria-hidden="true" />
              <span className="text-sm">סנן:</span>
            </div>
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                selectedCategory === "all"
                  ? "bg-[var(--accent)] text-black"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
              )}
              aria-pressed={selectedCategory === "all"}
            >
              הכל ({techniques.length})
            </button>
            {techniqueCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as TechniqueCategory)}
                className={cn(
                  "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  selectedCategory === cat.id
                    ? "bg-[var(--accent)] text-black"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                )}
                aria-pressed={selectedCategory === cat.id}
              >
                <span className="hidden md:inline">{cat.name}</span>
                <span className="md:hidden">{cat.name.split(' ')[0]}</span>
                <span className="opacity-60">({categoryCounts[cat.id]})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      {searchQuery && (
        <p className="text-sm text-[var(--text-muted)] mb-4 fade-in">
          נמצאו {filteredTechniques.length} תוצאות עבור &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* Techniques Grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTechniques.map((tech, index) => {
          const catInfo = getCategoryInfo(tech.category);
          return (
            <Link 
              key={tech.code} 
              href={`/techniques/${tech.code}`}
              className="group block"
              style={{ animationDelay: `${(index % 9) * 30}ms` }}
            >
              <article
                className={cn(
                  "h-full rounded-2xl p-5 transition-colors",
                  "bg-[var(--bg-elevated)] border border-[var(--border-subtle)]",
                  "hover:border-[var(--border-default)]",
                  "focus-within:ring-2 focus-within:ring-[var(--accent)]"
                )}
              >
                {/* Category color bar */}
                <div 
                  className={cn(
                    "w-10 h-1 rounded-full bg-gradient-to-r mb-4",
                    categoryColors[tech.category]
                  )}
                  aria-hidden="true"
                />

                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                      `bg-gradient-to-br ${categoryColors[tech.category]} text-white`
                    )}
                    aria-hidden="true"
                  >
                    {categoryIcons[tech.category]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1">
                      {tech.name}
                    </h3>
                    
                    <p className="text-xs text-[var(--text-muted)] font-mono mb-2">
                      {tech.nameEn}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                      {tech.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3">
                      <span className={cn("text-xs font-medium", categoryAccentColors[tech.category])}>
                        {catInfo.name}
                      </span>
                      
                      {/* Difficulty Stars */}
                      <div className="flex items-center gap-0.5" aria-label={`רמת קושי: ${tech.difficulty} מתוך 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={10}
                            className={cn(
                              i < tech.difficulty 
                                ? "text-[var(--accent)] fill-[var(--accent)]" 
                                : "text-[var(--border-default)]"
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronLeft 
                    size={18} 
                    className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] group-hover:-translate-x-1 transition-all shrink-0 mt-1" 
                    aria-hidden="true"
                  />
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredTechniques.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center fade-in">
          <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Search size={28} className="text-[var(--text-muted)]" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            לא נמצאו טכניקות
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md mb-4">
            נסה לחפש במילים אחרות או לבחור קטגוריה אחרת
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="text-sm text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
          >
            נקה את החיפוש
          </button>
        </div>
      )}
    </div>
  );
}
