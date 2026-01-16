"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Heart, Scale, Brain, Swords, ChevronLeft, Search, BookOpen, Sparkles, Star, Filter } from "lucide-react";
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
  tactical_empathy: "from-rose-500 to-pink-600",
  harvard: "from-sky-500 to-blue-600",
  psychology: "from-violet-500 to-purple-600",
  hardball: "from-red-500 to-orange-600",
};

const categoryBgColors: Record<string, string> = {
  tactical_empathy: "bg-rose-500/10 border-rose-500/20 hover:bg-rose-500/15",
  harvard: "bg-sky-500/10 border-sky-500/20 hover:bg-sky-500/15",
  psychology: "bg-violet-500/10 border-violet-500/20 hover:bg-violet-500/15",
  hardball: "bg-red-500/10 border-red-500/20 hover:bg-red-500/15",
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
    <div className="max-w-6xl mx-auto relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-rose-500/5 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -left-20 w-80 h-80 bg-sky-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-20 right-1/4 w-72 h-72 bg-violet-500/5 rounded-full blur-[100px]" />
      </div>

      {/* Hero Header */}
      <div className="relative mb-10 animate-fade-in-up">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-dark)] flex items-center justify-center shadow-[0_0_20px_var(--accent-glow)]">
                <BookOpen size={24} className="text-black" aria-hidden="true" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)]">
                ספריית טכניקות
              </h1>
            </div>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl">
              {techniques.length} טכניקות מקצועיות מעולם המשא ומתן, מאמפתיה טקטית ועד משחק קשה
            </p>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4">
            {techniqueCategories.map((cat) => (
              <div 
                key={cat.id}
                className="hidden md:flex flex-col items-center gap-1 px-4 py-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  `bg-gradient-to-br ${categoryColors[cat.id]} text-white`
                )}>
                  {categoryIcons[cat.id]}
                </div>
                <span className="text-xs text-[var(--text-muted)]">{categoryCounts[cat.id]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-20 py-4 -mx-4 px-4 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--border-subtle)] mb-6 animate-fade-in-up">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Input
              placeholder="חפש טכניקה לפי שם, תיאור או מונח באנגלית…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search size={18} />}
              className="w-full"
            />
          </div>
          
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
            <div className="hidden md:flex items-center gap-1 text-[var(--text-muted)] ml-2">
              <Filter size={16} aria-hidden="true" />
              <span className="text-sm">סנן:</span>
            </div>
            <button
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                selectedCategory === "all"
                  ? "bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent-glow)]"
                  : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-dark)]"
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
                  "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
                  selectedCategory === cat.id
                    ? "bg-[var(--accent)] text-black shadow-[0_0_15px_var(--accent-glow)]"
                    : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] hover:border-[var(--accent-dark)]"
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
        <p className="text-sm text-[var(--text-muted)] mb-4 animate-fade-in-up">
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
              style={{ animationDelay: `${(index % 9) * 50}ms` }}
            >
              <article
                className={cn(
                  "relative h-full overflow-hidden rounded-2xl p-5 transition-all duration-300",
                  "bg-[var(--bg-card)] border border-[var(--border-subtle)]",
                  "hover:border-[var(--accent-dark)] hover:shadow-[0_4px_30px_rgba(0,0,0,0.3)]",
                  "hover:-translate-y-1",
                  "focus-within:ring-2 focus-within:ring-[var(--accent)]"
                )}
              >
                {/* Category gradient accent */}
                <div 
                  className={cn(
                    "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r",
                    categoryColors[tech.category]
                  )}
                  aria-hidden="true"
                />

                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle at 50% 0%, ${
                      tech.category === 'tactical_empathy' ? 'rgba(244,63,94,0.1)' :
                      tech.category === 'harvard' ? 'rgba(14,165,233,0.1)' :
                      tech.category === 'psychology' ? 'rgba(139,92,246,0.1)' :
                      'rgba(239,68,68,0.1)'
                    }, transparent 70%)`
                  }}
                  aria-hidden="true"
                />

                <div className="relative flex items-start gap-4">
                  {/* Category Icon */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300",
                      `bg-gradient-to-br ${categoryColors[tech.category]} text-white`,
                      "group-hover:scale-110 group-hover:shadow-lg"
                    )}
                    aria-hidden="true"
                  >
                    {categoryIcons[tech.category]}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title & English Name */}
                    <div className="flex items-start gap-2 mb-2 flex-wrap">
                      <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {tech.name}
                      </h3>
                    </div>
                    
                    <p className="text-xs text-[var(--text-muted)] font-mono mb-2">
                      {tech.nameEn}
                    </p>

                    {/* Description */}
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mb-3">
                      {tech.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs border",
                        categoryBgColors[tech.category]
                      )}>
                        {catInfo.name}
                      </span>
                      
                      {/* Difficulty Stars */}
                      <div className="flex items-center gap-0.5" aria-label={`רמת קושי: ${tech.difficulty} מתוך 5`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={cn(
                              "transition-colors",
                              i < tech.difficulty 
                                ? "text-[var(--accent)] fill-[var(--accent)]" 
                                : "text-[var(--text-muted)]"
                            )}
                            aria-hidden="true"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Arrow */}
                  <ChevronLeft 
                    size={20} 
                    className="text-[var(--text-muted)] group-hover:text-[var(--accent)] group-hover:-translate-x-2 transition-all duration-300 shrink-0 mt-1" 
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
        <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mb-4">
            <Search size={32} className="text-[var(--text-muted)]" aria-hidden="true" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            לא נמצאו טכניקות
          </h3>
          <p className="text-[var(--text-secondary)] max-w-md">
            נסה לחפש במילים אחרות או לבחור קטגוריה אחרת
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-2 text-sm text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors"
          >
            נקה את החיפוש
          </button>
        </div>
      )}

      {/* Featured Tip */}
      {selectedCategory === "all" && !searchQuery && (
        <div className="mt-10 animate-fade-in-up">
          <div className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-[var(--accent-dark)]/40 to-[var(--bg-card)] border border-[var(--accent-dark)]">
            <div className="absolute top-0 right-0 w-40 h-40 bg-[var(--accent)]/10 rounded-full blur-3xl" aria-hidden="true" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-subtle)] flex items-center justify-center shrink-0">
                <Sparkles size={24} className="text-[var(--accent)]" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-[var(--accent)] mb-2">
                  טיפ למתחילים
                </h3>
                <p className="text-[var(--text-secondary)]">
                  התחל עם טכניקות מקטגוריית <strong>&ldquo;אמפתיה טקטית&rdquo;</strong> - הן קלות ליישום ויעילות מאוד. 
                  שליטה בהקשבה אקטיבית ושיקוף תעזור לך בכל סוג של משא ומתן.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
