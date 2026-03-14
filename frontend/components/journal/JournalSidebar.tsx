"use client";

import { Plus, BookOpen } from "lucide-react";
import type { JournalListItem } from "@/lib/types";

const MOOD_EMOJI: Record<string, string> = {
  great: "\u{1F60A}",
  good: "\u{1F642}",
  okay: "\u{1F610}",
  bad: "\u{1F641}",
  terrible: "\u{1F62D}",
};

interface JournalSidebarProps {
  entries: JournalListItem[];
  selectedDate: string | null;
  onSelect: (date: string) => void;
  onNewEntry: () => void;
}

export function JournalSidebar({ entries, selectedDate, onSelect, onNewEntry }: JournalSidebarProps) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <button
          onClick={onNewEntry}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-sage px-4 py-2.5 text-sm font-medium text-warm-white hover:bg-sage-dark transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" /> New Entry
        </button>
      </div>

      <h3 className="text-xs font-semibold text-stone uppercase tracking-wide mb-3">Past Entries</h3>

      <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        {entries.length === 0 && (
          <p className="text-xs text-stone-light py-4 text-center">No entries yet</p>
        )}
        {entries.map((e) => {
          const isSelected = selectedDate === e.entry_date;
          const isToday = e.entry_date === today;
          return (
            <button
              key={e.id}
              onClick={() => onSelect(e.entry_date)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                isSelected
                  ? "bg-sage/10 border border-sage/30"
                  : "hover:bg-cream-dark border border-transparent"
              }`}
            >
              <BookOpen className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-sage" : "text-stone-light"}`} />
              <div className="flex-1 min-w-0">
                <span className={`block truncate ${isSelected ? "font-medium text-bark" : "text-bark-light"}`}>
                  {isToday ? "Today" : new Date(e.entry_date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
              {e.mood && <span className="text-base flex-shrink-0">{MOOD_EMOJI[e.mood] || ""}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
