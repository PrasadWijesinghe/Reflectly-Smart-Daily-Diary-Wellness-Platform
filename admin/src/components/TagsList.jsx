import React, { useMemo, useState } from "react";
import { getInitials } from "../utils/helpers";

export function TagsList({ tags, loading, error, onRefresh, onCreateTag }) {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🏷️");
  const [color, setColor] = useState("#3B82F6");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const rows = useMemo(
    () =>
      tags.map((tag) => ({
        ...tag,
        initials: getInitials(tag.name),
      })),
    [tags]
  );

  async function handleSubmit(event) {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedIcon = icon.trim();
    const trimmedColor = color.trim();

    if (!trimmedName || !trimmedIcon || !trimmedColor) {
      setFormError("Name, icon, and color are required.");
      return;
    }

    try {
      setSaving(true);
      setFormError("");

      await onCreateTag({
        name: trimmedName,
        icon: trimmedIcon,
        color: trimmedColor,
      });

      setName("");
      setIcon("🏷️");
      setColor("#3B82F6");
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create tag.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">Tag Analytics</h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">How users are labeling diary activity.</p>
        </div>
        <button onClick={onRefresh} className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 text-slate-700 transition shadow-sm">
          Refresh
        </button>
      </div>

      <div className="mx-4 sm:mx-0 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h5 className="text-sm font-bold text-slate-800">Create a new tag</h5>
        <p className="mt-1 text-sm text-slate-500">Use this for new tag categories only. Diaries remain private.</p>

        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
          <div className="md:col-span-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-400"
              placeholder="Stress"
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Icon</label>
            <input
              value={icon}
              onChange={(event) => setIcon(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-400"
              placeholder="😰"
            />
          </div>
          <div className="md:col-span-1">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Color</label>
            <input
              value={color}
              onChange={(event) => setColor(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 outline-none transition focus:border-blue-400"
              placeholder="#3B82F6"
            />
          </div>
          <div className="md:col-span-1 flex items-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Creating..." : "Create Tag"}
            </button>
          </div>
        </form>

        {formError ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {formError}
          </div>
        ) : null}
      </div>

      {error && (
        <div className="mb-4 px-4 sm:px-0">
          <div className="rounded border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        </div>
      )}

      <div className="max-w-full overflow-x-auto pb-4">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-slate-50 text-left border-y border-slate-200">
              <th className="min-w-[220px] py-4 px-4 font-semibold text-slate-800 text-sm">Tag</th>
              <th className="min-w-[140px] py-4 px-4 font-semibold text-slate-800 text-sm">Color</th>
              <th className="min-w-[140px] py-4 px-4 font-semibold text-slate-800 text-sm">Icon</th>
              <th className="py-4 px-4 font-semibold text-slate-800 text-sm text-center">Usage</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">Loading Data...</p>
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/50 transition">
                  <td className="border-b border-slate-100 py-3.5 px-4 p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-white text-sm shadow-sm"
                        style={{ backgroundColor: tag.color || "#3B82F6" }}
                      >
                        {tag.initials}
                      </div>
                      <div className="flex flex-col">
                        <p className="hidden font-medium text-slate-800 sm:block leading-tight">{tag.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">#{tag.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 font-medium">
                    <p className="text-slate-700 text-sm">{tag.color}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 font-medium">
                    <p className="text-slate-500 text-sm">{tag.icon}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 pb-4">
                    <div className="flex justify-center">
                      <p className="inline-flex rounded-full bg-slate-100 bg-opacity-80 py-1 px-3 text-sm font-bold tracking-tight text-slate-700 w-12 justify-center border border-slate-200">
                        {tag.usageCount}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">No tags found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
