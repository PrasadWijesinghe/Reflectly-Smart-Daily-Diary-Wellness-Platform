import React from 'react';

export function LoginScreen({ username, password, error, loading, onUsernameChange, onPasswordChange, onSubmit }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_30%),linear-gradient(180deg,_#eff6ff_0%,_#f8fafc_50%,_#ffffff_100%)] px-6 py-10 text-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-10 lg:flex-row flex-col">
        <div className="max-w-xl flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-medium text-blue-700 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Reflectly Admin
          </div>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-slate-950">
            Calm oversight for your wellness platform.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-8 text-slate-600">
            Monitor users, understand activity, and manage the platform from one clean workspace.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Security</p>
              <p className="mt-2 font-semibold text-slate-900">Admin gate</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Visibility</p>
              <p className="mt-2 font-semibold text-slate-900">Live user list</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm backdrop-blur">
              <p className="text-sm text-slate-500">Design</p>
              <p className="mt-2 font-semibold text-slate-900">Professional dashboard</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-8 shadow-[0_40px_100px_rgba(37,99,235,0.15)] backdrop-blur">
          <div className="mb-8">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">Admin Login</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">Welcome back</h2>
            <p className="mt-2 text-sm text-slate-500">Use the temporary credentials to access the dashboard.</p>
          </div>

          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Username</label>
              <input
                value={username}
                onChange={(event) => onUsernameChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="admin"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:bg-white"
                placeholder="admin"
                autoComplete="current-password"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Signing in..." : "Login to Dashboard"}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            Temporary credentials: <span className="font-semibold text-slate-800">admin / admin</span>
          </div>
        </div>
      </div>
    </div>
  );
}
