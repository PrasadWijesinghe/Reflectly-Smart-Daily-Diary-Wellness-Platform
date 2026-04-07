import React from 'react';

export function TagsList({ tags, loading, error, onRefresh }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">
            Platform Tags
          </h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">Currently active tags on the wellness platform.</p>
        </div>
        <button onClick={onRefresh} className="rounded border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50 text-slate-700 transition shadow-sm">
          Refresh
        </button>
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
              <th className="min-w-[150px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Tag Name
              </th>
              <th className="min-w-[120px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Icon
              </th>
              <th className="min-w-[120px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Color Hex
              </th>
              <th className="py-4 px-4 font-semibold text-slate-800 text-sm text-center">
                Usage Count
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">Loading Data...</p>
                </td>
              </tr>
            ) : tags?.length ? (
              tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-slate-50/50 transition">
                  <td className="border-b border-slate-100 py-3.5 px-4 font-medium">
                    <p className="text-slate-800 text-sm">{tag.name}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4">
                    <p className="text-2xl">{tag.icon}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4">
                    <div className="flex items-center gap-2">
                       <span className="w-4 h-4 rounded-full border border-slate-200" style={{ backgroundColor: tag.color }}></span>
                       <p className="text-slate-500 text-sm uppercase">{tag.color}</p>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 pb-4">
                    <div className="flex justify-center">
                      <p className="inline-flex rounded-full bg-slate-100 bg-opacity-80 py-1 px-3 text-sm font-bold tracking-tight text-slate-700 w-12 justify-center border border-slate-200">
                        {tag.usageCount || 0}
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
