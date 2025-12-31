import type React from "react";
import { NavLink } from "react-router-dom";

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  deviceId?: string;
};

export default function AppShell({
  children,
  headerRight,
  deviceId,
}: AppShellProps) {
  const navBase = deviceId ? `/${deviceId}` : null;
  const navLinks = navBase
    ? [
        { to: `${navBase}/`, label: "Dashboard", end: true },
        { to: `${navBase}/charts`, label: "Charts" },
        { to: `${navBase}/about`, label: "About" },
      ]
    : [];
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <div className="text-lg font-semibold tracking-tight">Home AQI</div>
            {navLinks.length ? (
              <nav className="flex flex-wrap gap-2 text-sm text-slate-600">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.end}
                    className={({ isActive }) =>
                      `rounded-full px-3 py-1 transition ${
                        isActive
                          ? "bg-slate-900 text-white"
                          : "text-slate-600 hover:bg-slate-100"
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>
            ) : null}
          </div>
          <div className="text-sm text-slate-500">{headerRight}</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
