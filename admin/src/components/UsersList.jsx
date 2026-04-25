import React, { useMemo } from 'react';
import { getInitials, formatDate } from '../utils/helpers';

export function UsersList({ users, loading, error, onRefresh }) {
  const rows = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        initials: getInitials(user.name),
      })),
    [users]
  );

  return (
    <div className="rounded-sm border border-slate-200 bg-white shadow-sm pt-6 pb-2.5 sm:px-7.5 xl:pb-1 relative">
      <div className="flex justify-between items-center mb-6 px-4 sm:px-0">
        <div>
          <h4 className="text-xl font-bold text-slate-800">
            Registered Users
          </h4>
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
              <th className="min-w-[220px] py-4 px-4 font-semibold text-slate-800 text-sm">
                User
              </th>
              <th className="min-w-[150px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Email
              </th>
              <th className="min-w-[120px] py-4 px-4 font-semibold text-slate-800 text-sm">
                Joined
              </th>
              <th className="py-4 px-4 font-semibold text-slate-800 text-sm text-center">
                Entries
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
            ) : rows.length ? (
              rows.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition">
                  <td className="border-b border-slate-100 py-3.5 px-4 p-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-blue-600 text-sm">
                        {user.initials}
                      </div>
                      <div className="flex flex-col">
                        <p className="hidden font-medium text-slate-800 sm:block leading-tight">{user.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">#{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 font-medium">
                    <p className="text-slate-700 text-sm">{user.email}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 font-medium">
                    <p className="text-slate-500 text-sm">{formatDate(user.createdAt)}</p>
                  </td>
                  <td className="border-b border-slate-100 py-3.5 px-4 pb-4">
                    <div className="flex justify-center">
                      <p className="inline-flex rounded-full bg-slate-100 bg-opacity-80 py-1 px-3 text-sm font-bold tracking-tight text-slate-700 w-12 justify-center border border-slate-200">
                        {user.diaryCount}
                      </p>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="border-b border-slate-100 py-5 px-4">
                  <p className="text-slate-500 text-center text-sm font-medium">No users found.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
