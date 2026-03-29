"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/learn", icon: "\u{1F4D6}", label: "Belajar" },
  { href: "/learn/activity", icon: "\u{1F3A8}", label: "Warna" },
  { href: "/learn/gallery", icon: "\u{1F3C6}", label: "Galeri" },
];

function PlayerStats({ stars = 0, streak = 0 }: { stars?: number; streak?: number }) {
  return (
    <div className="flex items-center gap-4 text-white text-lg font-bold">
      <span>{"\u2B50"} {stars}</span>
      <span>{"\u{1F525}"} {streak}</span>
    </div>
  );
}

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // TODO: fetch real stars/streak from student progress
  const stars = 0;
  const streak = 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-400 to-indigo-600 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <span className="text-4xl" role="img" aria-label="avatar">
          {"\u{1F430}"}
        </span>
        <PlayerStats stars={stars} streak={streak} />
      </header>

      {/* Main content */}
      <main className="flex-1 pb-20">{children}</main>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur border-t border-gray-200 flex justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[64px] flex-1 text-center transition-colors ${
                isActive
                  ? "text-indigo-600 font-bold"
                  : "text-gray-500 hover:text-indigo-400"
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
