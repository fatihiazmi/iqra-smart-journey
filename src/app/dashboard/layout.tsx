import Link from "next/link";
import { LogoutButton } from "@/components/logout-button";

const navLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/tasmik", label: "Tasmik" },
  { href: "/dashboard/students", label: "Students" },
  { href: "/dashboard/worksheets", label: "Worksheets" },
  { href: "/dashboard/analytics", label: "Analytics" },
  { href: "/dashboard/parents", label: "Parents" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-10 relative">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">ISJ Dashboard</h1>
          <LogoutButton className="min-h-[44px] px-4 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors text-sm font-medium" />
        </div>
        <nav className="mt-4 flex gap-6 overflow-x-auto pb-1 scrollbar-hide">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-gray-500 hover:text-indigo-600 active:text-indigo-700 transition-colors whitespace-nowrap"
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
