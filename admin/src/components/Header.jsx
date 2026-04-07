import React from 'react';
import { getInitials } from '../utils/helpers';

export function Header({ adminName, onLogout }) {
  const initials = getInitials(adminName);

  return (
    <header className="sticky top-0 z-50 flex w-full bg-white drop-shadow-1">
      <div className="flex flex-grow items-center justify-between py-4 px-4 shadow-sm md:px-6 2xl:px-11">
        {/* Search bar removed as requested */}
        <div className="hidden sm:block"></div>

        <div className="flex items-center gap-3 2xsm:gap-7 ml-auto">
          <ul className="flex items-center gap-2 2xsm:gap-4">
            <li>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-100 hover:text-blue-600 text-slate-500 cursor-pointer shadow-sm transition">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
              </div>
            </li>
          </ul>

          <div className="relative flex items-center gap-4 pl-4 border-l border-slate-200 ml-2">
            <span className="hidden text-right lg:block">
              <span className="block text-sm font-semibold text-slate-800">
                {adminName || "Administrator"}
              </span>
              {/* Super Admin text removed as requested */}
            </span>

            <span className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-200 text-slate-800 font-semibold cursor-pointer border border-slate-300 relative group transition hover:ring-2 hover:ring-blue-500">
              {initials}
              <div className="absolute right-0 top-[110%] w-48 rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 hidden group-hover:block transition z-50">
                <div className="py-1">
                  <button onClick={onLogout} className="flex w-full px-4 py-2 text-sm text-red-600 hover:bg-slate-50 border-none outline-none bg-transparent">
                    Logout
                  </button>
                </div>
              </div>
            </span>
            <svg className="w-4 h-4 text-slate-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      </div>
    </header>
  );
}
