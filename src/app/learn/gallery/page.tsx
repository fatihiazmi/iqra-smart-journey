"use client";

import { UNLOCKABLES, getUnlockedItems, getNextUnlock } from "@/lib/unlockables";

// Mock star count — will connect to real progress later
const MOCK_STARS = 12;

export default function GalleryPage() {
  const totalStars = MOCK_STARS;
  const unlocked = getUnlockedItems(totalStars);
  const unlockedIds = new Set(unlocked.map((u) => u.id));
  const nextUnlock = getNextUnlock(totalStars);

  const colors = UNLOCKABLES.filter((u) => u.type === "color");
  const stickers = UNLOCKABLES.filter((u) => u.type === "sticker");

  return (
    <div className="px-4 py-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">
          Galeri Saya {"\u{1F3C6}"}
        </h1>
        <p className="text-white/80 mt-1">
          {totalStars} {"\u2B50"} dikumpul
        </p>
        {nextUnlock && (
          <p className="text-sm text-yellow-200 mt-2">
            {nextUnlock.requiredStars - totalStars} lagi {"\u2B50"} untuk buka{" "}
            <span className="font-bold">{nextUnlock.label}</span>!
          </p>
        )}
      </div>

      {/* Koleksi Warna */}
      <section>
        <h2 className="text-xl font-bold text-white mb-3">
          {"\u{1F3A8}"} Koleksi Warna
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {colors.map((item) => {
            const isUnlocked = unlockedIds.has(item.id);
            const starsNeeded = item.requiredStars - totalStars;

            return (
              <div key={item.id} className="flex flex-col items-center gap-1">
                <div
                  className={`w-16 h-16 rounded-full border-4 transition-all ${
                    isUnlocked
                      ? "border-white shadow-lg scale-105"
                      : "border-gray-400/50 opacity-60"
                  }`}
                  style={{
                    background: isUnlocked
                      ? item.value === "rainbow"
                        ? "linear-gradient(135deg, #ef4444, #f59e0b, #22c55e, #3b82f6, #8b5cf6)"
                        : item.value
                      : "#9ca3af",
                  }}
                >
                  {!isUnlocked && (
                    <div className="w-full h-full flex items-center justify-center text-lg">
                      {"\u{1F512}"}
                    </div>
                  )}
                </div>
                <span className="text-xs text-white font-medium">
                  {item.label}
                </span>
                {!isUnlocked && (
                  <span className="text-[10px] text-yellow-200">
                    {starsNeeded} lagi {"\u2B50"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Buku Stiker */}
      <section>
        <h2 className="text-xl font-bold text-white mb-3">
          {"\u{1F4D6}"} Buku Stiker
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {stickers.map((item) => {
            const isUnlocked = unlockedIds.has(item.id);
            const starsNeeded = item.requiredStars - totalStars;

            return (
              <div
                key={item.id}
                className={`rounded-2xl p-4 transition-all ${
                  isUnlocked
                    ? "bg-white/90 shadow-lg"
                    : "bg-gray-400/30 border-2 border-dashed border-gray-400/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold ${
                      isUnlocked ? "text-gray-800" : "text-white/60"
                    }`}
                  >
                    {item.label}
                  </span>
                  {!isUnlocked && (
                    <span className="text-xs text-yellow-200 bg-white/10 px-2 py-1 rounded-full">
                      {"\u{1F512}"} {starsNeeded} lagi {"\u2B50"}
                    </span>
                  )}
                </div>
                <div className="text-3xl mt-2 tracking-widest">
                  {isUnlocked
                    ? item.value
                    : item.value.replace(/./gu, "\u2753")}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Karya Saya */}
      <section>
        <h2 className="text-xl font-bold text-white mb-3">
          {"\u{1F5BC}\uFE0F"} Karya Saya
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {/* Placeholder — will load from student_gallery table */}
          <div className="aspect-square rounded-2xl bg-white/20 border-2 border-dashed border-white/40 flex flex-col items-center justify-center text-white/60">
            <span className="text-4xl">{"\u{1F3A8}"}</span>
            <span className="text-xs mt-2">Belum ada karya</span>
          </div>
        </div>
      </section>
    </div>
  );
}
