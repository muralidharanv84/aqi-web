import AppShell from "../components/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Home AQI</h1>
        <p className="mt-2 text-slate-600">
          Dashboard scaffolding is in place. Data wiring comes next.
        </p>
      </div>
    </AppShell>
  );
}
