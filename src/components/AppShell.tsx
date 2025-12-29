import type React from "react";

type AppShellProps = {
  children: React.ReactNode;
  headerRight?: React.ReactNode;
};

export default function AppShell({ children, headerRight }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="text-lg font-semibold tracking-tight">Home AQI</div>
          <div className="text-sm text-slate-500">{headerRight}</div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
