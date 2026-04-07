import React from 'react';

export function StatCard({ label, value, hint, icon }) {
  return (
    <div className="flex flex-col justify-between rounded-sm border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-50 text-blue-600 ring-1 ring-slate-100">
        {icon || (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-[28px] font-bold text-slate-800 leading-tight tracking-tight">
            {value}
          </h4>
          <span className="text-sm font-medium text-slate-500 mt-1 block">{label}</span>
        </div>
        <span className="text-xs font-semibold text-emerald-500 max-w-[40%] text-right flex items-center gap-1 justify-end">
          {hint}
        </span>
      </div>
    </div>
  );
}
