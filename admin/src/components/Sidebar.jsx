import React from 'react';

export function Sidebar({ activeTab, onTabChange }) {
  return (
    <div className="flex h-screen w-72 flex-col bg-[#1c2434] text-[#8a99af] transition-all duration-300">
      <div className="flex items-center gap-3 px-6 py-6 lg:py-8 text-white">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 shadow-sm">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-2xl font-bold tracking-tight">Reflectly</span>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-2 px-4 py-4 lg:mt-5 lg:px-6">
          <div>
            <h3 className="mb-4 ml-4 text-xs font-semibold uppercase tracking-widest text-[#8a99af]">Menu</h3>
            <ul className="mb-6 flex flex-col gap-1.5">
              <li>
                <button onClick={() => onTabChange('dashboard')} className={`w-full text-left group relative flex items-center gap-3 rounded-sm px-4 py-2.5 font-medium duration-300 ease-in-out ${activeTab === 'dashboard' ? 'bg-[#333a48] text-white' : 'text-[#8a99af] hover:bg-[#333a48] hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onTabChange('users')} className={`w-full text-left group relative flex items-center gap-3 rounded-sm px-4 py-2.5 font-medium duration-300 ease-in-out ${activeTab === 'users' ? 'bg-[#333a48] text-white' : 'text-[#8a99af] hover:bg-[#333a48] hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Users
                </button>
              </li>

              <li>
                <button onClick={() => onTabChange('tags')} className={`w-full text-left group relative flex items-center gap-3 rounded-sm px-4 py-2.5 font-medium duration-300 ease-in-out ${activeTab === 'tags' ? 'bg-[#333a48] text-white' : 'text-[#8a99af] hover:bg-[#333a48] hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M3 12l9-9 9 9-9 9-9-9z" />
                  </svg>
                  Tags
                </button>
              </li>

              <li>
                <button onClick={() => onTabChange('feedback')} className={`w-full text-left group relative flex items-center gap-3 rounded-sm px-4 py-2.5 font-medium duration-300 ease-in-out ${activeTab === 'feedback' ? 'bg-[#333a48] text-white' : 'text-[#8a99af] hover:bg-[#333a48] hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  Feedback
                </button>
              </li>

              <li>
                <button onClick={() => onTabChange('health')} className={`w-full text-left group relative flex items-center gap-3 rounded-sm px-4 py-2.5 font-medium duration-300 ease-in-out ${activeTab === 'health' ? 'bg-[#333a48] text-white' : 'text-[#8a99af] hover:bg-[#333a48] hover:text-white'}`}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m4 2v-4m4 4V7m-8 10H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4" />
                  </svg>
                  System Health
                </button>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
}
