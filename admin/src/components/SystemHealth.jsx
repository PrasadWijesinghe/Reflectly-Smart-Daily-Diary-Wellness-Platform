import React from "react";
import { getApiUrl, getGrafanaDashboardUrl } from "../utils/helpers";

function getMetricsUrl() {
  const apiUrl = getApiUrl().replace(/\/+$/, "");
  return apiUrl.endsWith("/api") ? `${apiUrl.slice(0, -4)}/metrics` : `${apiUrl}/metrics`;
}

const METRICS = [
  {
    label: "HTTP traffic",
    value: "On",
    hint: "reflectly_http_requests_total and reflectly_http_request_duration_seconds",
    tone: "emerald",
  },
  {
    label: "Auth activity",
    value: "On",
    hint: "reflectly_auth_events_total",
    tone: "emerald",
  },
  {
    label: "Admin actions",
    value: "On",
    hint: "reflectly_admin_events_total and reflectly_tag_mutations_total",
    tone: "emerald",
  },
  {
    label: "Chat / Transcribe",
    value: "On",
    hint: "reflectly_chat_requests_total and reflectly_transcription_requests_total",
    tone: "emerald",
  },
];

const CHECKLIST = [
  "Point Prometheus at the backend /metrics endpoint",
  "Create a dashboard for request volume, latency, and 5xx rate",
  "Add alerts for sustained errors or slow responses",
  "Keep the admin site limited to aggregate data only",
];

const SCRAPE_EXAMPLE = `scrape_configs:
  - job_name: "reflectly-backend"
    static_configs:
      - targets: ["localhost:5000"]`;

function toneClasses(tone) {
  if (tone === "emerald") return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (tone === "amber") return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-blue-50 text-blue-700 border-blue-200";
}

export function SystemHealth() {
  const metricsUrl = getMetricsUrl();
  const grafanaUrl = getGrafanaDashboardUrl();

  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">System Health</h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">
            Ready for Prometheus scraping and future Grafana dashboards.
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-0">
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Prometheus scrape target</p>
          <p className="mt-2 break-all text-sm font-mono text-slate-800">{metricsUrl}</p>
          <p className="mt-2 text-sm text-slate-500">
            The backend already exposes this endpoint. Point your local Prometheus server here.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href={grafanaUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              Open Grafana
            </a>
            <span className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
              {grafanaUrl}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 px-4 sm:px-0 mt-4">
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

      <div className="mt-6 grid grid-cols-1 gap-4 px-4 sm:px-0 lg:grid-cols-2">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
          <p className="text-sm font-semibold text-slate-800">Suggested Prometheus config</p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-900 p-4 text-xs leading-6 text-slate-100">
            {SCRAPE_EXAMPLE}
          </pre>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5">
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
    </div>
  );
}
