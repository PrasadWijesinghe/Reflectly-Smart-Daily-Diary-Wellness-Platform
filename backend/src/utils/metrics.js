const client = require("prom-client");

const register = new client.Registry();

client.collectDefaultMetrics({
  register,
  prefix: "reflectly_",
});

const httpRequestsTotal = new client.Counter({
  name: "reflectly_http_requests_total",
  help: "Total HTTP requests handled by the Reflectly backend.",
  labelNames: ["method", "route", "status_code"],
});

const httpRequestDurationSeconds = new client.Histogram({
  name: "reflectly_http_request_duration_seconds",
  help: "Duration of HTTP requests in seconds.",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
});

const diaryEntriesCreatedTotal = new client.Counter({
  name: "reflectly_diary_entries_created_total",
  help: "Total diary entries created.",
});

const diaryEntriesUpdatedTotal = new client.Counter({
  name: "reflectly_diary_entries_updated_total",
  help: "Total diary entries updated.",
});

const diaryEntriesDeletedTotal = new client.Counter({
  name: "reflectly_diary_entries_deleted_total",
  help: "Total diary entries deleted.",
});

const feedbackSubmittedTotal = new client.Counter({
  name: "reflectly_feedback_submitted_total",
  help: "Total feedback messages submitted.",
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);
register.registerMetric(diaryEntriesCreatedTotal);
register.registerMetric(diaryEntriesUpdatedTotal);
register.registerMetric(diaryEntriesDeletedTotal);
register.registerMetric(feedbackSubmittedTotal);

function normalizeRoute(route) {
  const raw = String(route || "unknown").split("?")[0];
  return raw
    .replace(/\/[0-9a-fA-F-]{8,}(?=\/|$)/g, "/:id")
    .replace(/\/\d+(?=\/|$)/g, "/:id");
}

function recordHttpMetrics({ method, route, statusCode, durationSeconds }) {
  const labels = {
    method: String(method || "GET").toUpperCase(),
    route: normalizeRoute(route),
    status_code: String(statusCode || 200),
  };

  httpRequestsTotal.inc(labels);
  httpRequestDurationSeconds.observe(labels, durationSeconds);
}

function incrementDiaryEntriesCreated() {
  diaryEntriesCreatedTotal.inc();
}

function incrementDiaryEntriesUpdated() {
  diaryEntriesUpdatedTotal.inc();
}

function incrementDiaryEntriesDeleted() {
  diaryEntriesDeletedTotal.inc();
}

function incrementFeedbackSubmitted() {
  feedbackSubmittedTotal.inc();
}

module.exports = {
  register,
  recordHttpMetrics,
  incrementDiaryEntriesCreated,
  incrementDiaryEntriesUpdated,
  incrementDiaryEntriesDeleted,
  incrementFeedbackSubmitted,
};
