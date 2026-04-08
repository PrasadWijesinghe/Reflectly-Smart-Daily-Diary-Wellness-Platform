const DEFAULT_API_URL = "http://localhost:5000/api";

export function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return DEFAULT_API_URL;
  return envUrl.replace(/\/+$/, "").endsWith("/api")
    ? envUrl.replace(/\/+$/, "")
    : `${envUrl.replace(/\/+$/, "")}/api`;
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
