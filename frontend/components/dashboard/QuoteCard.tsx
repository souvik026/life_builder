"use client";

import { Sprout } from "lucide-react";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Small daily improvements over time lead to stunning results.", author: "Robin Sharma" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "A journey of a thousand miles begins with a single step.", author: "Lao Tzu" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "We are what we repeatedly do. Excellence, then, is not an act but a habit.", author: "Aristotle" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Be patient with yourself. Growth is not linear.", author: "Unknown" },
  { text: "Every morning brings new potential, but if you dwell on the misfortunes of the day before, you tend to overlook tremendous opportunities.", author: "Harvey Mackay" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
];

function getDailyQuote() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  return QUOTES[dayOfYear % QUOTES.length];
}

export function QuoteCard() {
  const quote = getDailyQuote();

  return (
    <div className="mb-8 rounded-2xl border border-sand/60 bg-sage/5 px-6 py-5 animate-fade-in-up">
      <div className="flex items-start gap-4">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/10">
          <Sprout className="h-4 w-4 text-sage" />
        </div>
        <div>
          <p className="font-[family-name:var(--font-display)] text-base italic leading-relaxed text-bark">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="mt-2 text-xs font-medium text-stone">
            &mdash; {quote.author}
          </p>
        </div>
      </div>
    </div>
  );
}
