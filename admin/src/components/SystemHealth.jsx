import React from "react";

const METRICS = [
  {
    label: "API Status",
    value: "Ready",
    hint: "Backend is running",
    tone: "emerald",
  },
  {
    label: "Metrics Stack",
    value: "Pending",
    hint: "Grafana / Prometheus later",
    tone: "amber",
  },
  {
    label: "Alerting",
    value: "Pending",
    hint: "Connect after setup",
    tone: "amber",
  },
  {
    label: "Admin Surface",
    value: "Healthy",
    hint: "Users, tags, feedback",
    tone: "blue",
  },
];

const CHECKLIST = [
  "Add Prometheus scraping for backend metrics",
  "Build Grafana dashboards for API and user activity",
  "Add alerts for 5xx spikes and slow requests",
  "Show metrics summary cards in this tab",
];

function toneClasses(tone) {
  if (tone === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (tone === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function SystemHealth() {
  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">System Health</h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Ready for Grafana and Prometheus when you switch them on.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-0">
        {METRICS.map((metric) => (
          <div key={metric.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${toneClasses(metric.tone)}`}>
              {metric.value}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-800">{metric.label}</p>
            <p className="mt-1 text-sm text-slate-500">{metric.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
        <p className="text-sm font-semibold text-slate-800">Recommended next steps</p>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          {CHECKLIST.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
