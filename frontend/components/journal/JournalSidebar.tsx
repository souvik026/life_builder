"use client";

import { Plus, BookOpen, PenLine } from "lucide-react";
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
  selectedId: string | null;
  onSelect: (id: string, date: string) => void;
  onNewEntry: () => void;
}

export function JournalSidebar({ entries, selectedId, onSelect, onNewEntry }: JournalSidebarProps) {
  const today = new Date().toISOString().slice(0, 10);

  // Group entries by date
  const grouped: Record<string, JournalListItem[]> = {};
  entries.forEach((e) => {
    if (!grouped[e.entry_date]) grouped[e.entry_date] = [];
    grouped[e.entry_date].push(e);
  });

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

      <div className="space-y-4 overflow-y-auto flex-1 custom-scrollbar">
        {entries.length === 0 && (
          <p className="text-xs text-stone-light py-4 text-center">No entries yet</p>
        )}
        
        {Object.entries(grouped).map(([date, dayEntries]) => {
          const isToday = date === today;
          const displayDate = isToday ? "Today" : new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
          
          return (
            <div key={date}>
              <h4 className="text-xs font-medium text-stone pl-2 mb-1.5">{displayDate}</h4>
              <div className="space-y-1">
                {dayEntries.map((e) => {
                  const isSelected = selectedId === e.id;
                  const isNote = e.entry_type === "note";
                  
                  return (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e.id, e.entry_date)}
                      className={`w-full flex items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-all ${
                        isSelected
                          ? "bg-sage/10 border border-sage/30"
                          : "hover:bg-cream-dark border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isNote ? (
                          <PenLine className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-sage" : "text-stone-light"}`} />
                        ) : (
                          <BookOpen className={`h-3.5 w-3.5 flex-shrink-0 ${isSelected ? "text-sage" : "text-stone-light"}`} />
                        )}
                        <span className={`block truncate ${isSelected ? "font-medium text-bark" : "text-bark-light"}`}>
                          {isNote ? (e.title || "Note") : "Journal"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded ${isNote ? 'bg-sand/30 text-stone-dark' : 'bg-sage/10 text-sage-dark'}`}>
                          {isNote ? 'Note' : 'Journal'}
                        </span>
                        {!isNote && e.mood && <span className="text-base">{MOOD_EMOJI[e.mood] || ""}</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
