import React from 'react';
import { formatDate } from '../utils/helpers';

export function FeedbackList({ feedbacks, loading, error, onRefresh }) {
  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">
            Anonymous Feedback
          </h4>
          <p className="text-sm font-medium text-slate-500 mt-0.5">User submissions directly from the app.</p>
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
              <th className="min-w-[120px] py-4 px-4 font-semibold text-slate-800 text-sm">
                ID
              </th>
              <th className="min-w-[400px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Message Content
              </th>
              <th className="py-4 px-4 font-semibold text-slate-800 text-sm text-right">
                Submitted At
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="3" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">Loading Data...</p>
                </td>
              </tr>
            ) : feedbacks?.length ? (
              feedbacks.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition">
                  <td className="border-b border-slate-100 py-4 px-4 align-top">
                    <p className="text-slate-500 text-sm font-medium">FB-{item.id}</p>
                  </td>
                  <td className="border-b border-slate-100 py-4 px-4 align-top">
                    <p className="text-slate-800 text-sm whitespace-pre-wrap">{item.message}</p>
                  </td>
                  <td className="border-b border-slate-100 py-4 px-4 align-top text-right">
                     <p className="text-slate-500 text-sm">{formatDate(item.createdAt)}</p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">No feedback entries found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
