"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/learn", icon: "\u{1F4D6}", label: "Belajar" },
  { href: "/learn/activity", icon: "\u{1F3A8}", label: "Warna" },
  { href: "/learn/gallery", icon: "\u{1F3C6}", label: "Galeri" },
];

function PlayerStats({ stars = 0, streak = 0 }: { stars?: number; streak?: number }) {
  return (
    <div className="flex items-center gap-4 text-white text-lg font-bold drop-shadow-md">
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
  const router = useRouter();

  // TODO: fetch real stars/streak from student progress
  const stars = 0;
  const streak = 0;

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-indigo-600 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-4xl min-w-[44px] min-h-[44px] flex items-center justify-center drop-shadow-lg" role="img" aria-label="avatar">
          {"\u{1F430}"}
        </span>
        <PlayerStats stars={stars} streak={streak} />
        <button
          onClick={handleLogout}
          className="text-white/80 hover:text-white text-sm font-medium px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 hover:scale-105 active:scale-95 transition-all min-h-[44px]"
        >
          Keluar
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 pb-24 overflow-y-auto">{children}</main>

      {/* Fixed bottom nav */}
      <nav className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-gray-200 flex justify-around pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center min-h-[64px] flex-1 text-center transition-all ${
                isActive
                  ? "text-indigo-600 font-bold hover:scale-105"
                  : "text-gray-500 hover:text-indigo-400 hover:scale-105"
              }`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
