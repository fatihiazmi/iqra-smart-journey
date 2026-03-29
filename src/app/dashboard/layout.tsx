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
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">ISJ Dashboard</h1>
          <LogoutButton />
        </div>
        <nav className="mt-2 flex gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
