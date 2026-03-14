"use client";

const MOODS = [
  { value: "great", emoji: "\u{1F60A}", label: "Great" },
  { value: "good", emoji: "\u{1F642}", label: "Good" },
  { value: "okay", emoji: "\u{1F610}", label: "Okay" },
  { value: "bad", emoji: "\u{1F641}", label: "Bad" },
  { value: "terrible", emoji: "\u{1F62D}", label: "Terrible" },
];

interface MoodPickerProps {
  value: string | null;
  onChange: (mood: string) => void;
  readonly?: boolean;
}

export function MoodPicker({ value, onChange, readonly }: MoodPickerProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-bark-light mb-3">How are you feeling today?</label>
      <div className="flex gap-2">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => !readonly && onChange(m.value)}
            disabled={readonly}
            className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2.5 text-xs transition-all ${
              value === m.value
                ? "bg-sage/15 border-2 border-sage shadow-sm scale-105"
                : "bg-cream border-2 border-transparent hover:bg-sand/40"
            } ${readonly ? "cursor-default opacity-80" : "cursor-pointer"}`}
          >
            <span className="text-xl">{m.emoji}</span>
            <span className={value === m.value ? "font-medium text-sage-dark" : "text-stone"}>{m.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
