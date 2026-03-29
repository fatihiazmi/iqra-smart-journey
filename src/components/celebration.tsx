"use client";

import { useEffect, useCallback } from "react";

interface CelebrationProps {
  type: "page_complete" | "level_complete";
  level?: number;
  onDone: () => void;
}

export default function Celebration({ type, level, onDone }: CelebrationProps) {
  const fireConfetti = useCallback(async () => {
    const confetti = (await import("canvas-confetti")).default as (
      opts?: Record<string, unknown>
    ) => void;

    if (type === "page_complete") {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f87171", "#34d399", "#60a5fa", "#a78bfa"],
      });
    } else {
      // level_complete: bigger celebration
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#fbbf24", "#f87171", "#34d399", "#60a5fa"],
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#a78bfa", "#ec4899", "#14b8a6", "#f59e0b"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }
  }, [type]);

  useEffect(() => {
    fireConfetti();
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [fireConfetti, onDone]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-in fade-in">
      <div className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/90 shadow-2xl animate-in zoom-in-95">
        {/* Mascot */}
        <span
          className={`text-7xl ${
            type === "level_complete" ? "animate-bounce" : ""
          }`}
          role="img"
          aria-label="mascot"
        >
          {"\u{1F430}"}
        </span>

        {/* Message */}
        {type === "page_complete" ? (
          <p className="text-2xl font-bold text-amber-500">Bagus!</p>
        ) : (
          <div className="text-center">
            <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
              TAHNIAH!
            </p>
            <p className="text-lg font-semibold text-gray-700 mt-1">
              Level {level ?? "?"} selesai!
            </p>
          </div>
        )}

        {/* Stars burst */}
        <div className="flex gap-1 text-3xl">
          {Array.from({ length: type === "level_complete" ? 5 : 3 }).map(
            (_, i) => (
              <span
                key={i}
                className="animate-ping"
                style={{ animationDelay: `${i * 150}ms`, animationDuration: "1s" }}
              >
                {"\u2B50"}
              </span>
            )
          )}
        </div>

        {type === "level_complete" && (
          <p className="text-sm text-indigo-600 font-medium bg-indigo-50 px-4 py-2 rounded-full">
            {"\u{1F513}"} Item baru dibuka!
          </p>
        )}
      </div>
    </div>
  );
}
