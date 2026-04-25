const DEFAULT_API_URL = "http://localhost:5000/api";
const DEFAULT_GRAFANA_URL = "http://localhost:3000";

export function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return DEFAULT_API_URL;
  return envUrl.replace(/\/+$/, "").endsWith("/api")
    ? envUrl.replace(/\/+$/, "")
    : `${envUrl.replace(/\/+$/, "")}/api`;
}

export function getGrafanaUrl() {
  const envUrl = import.meta.env.VITE_GRAFANA_URL;
  if (!envUrl) return DEFAULT_GRAFANA_URL;
  return envUrl.replace(/\/+$/, "");
}

export function getGrafanaDashboardUrl() {
  const envUrl = import.meta.env.VITE_GRAFANA_DASHBOARD_URL;
  if (!envUrl) return getGrafanaUrl();
  return envUrl.replace(/\/+$/, "");
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}
