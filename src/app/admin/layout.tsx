import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const navLinks = [
  { href: "/admin", label: "Content" },
  { href: "/admin/teachers", label: "Teachers" },
  { href: "/admin/school", label: "School" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-600 px-6 py-4 shadow-md z-10 relative">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">ISJ Admin</h1>
          <LogoutButton className="min-h-[44px] text-sm font-medium text-indigo-100 hover:text-white px-4 py-2 hover:bg-indigo-500/50 rounded-lg transition-colors" />
        </div>
        <nav className="mt-4 flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-indigo-200 hover:text-white transition-colors whitespace-nowrap"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
