import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "reflectly_admin_token";
const DEFAULT_API_URL = "http://localhost:5000/api";

function getApiUrl() {
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) return DEFAULT_API_URL;
  return envUrl.replace(/\/+$/, "").endsWith("/api")
    ? envUrl.replace(/\/+$/, "")
    : `${envUrl.replace(/\/+$/, "")}/api`;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getInitials(name) {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "U"
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function LoginScreen({ username, password, error, loading, onUsernameChange, onPasswordChange, onSubmit }) {
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

function Dashboard({ adminName, users, summary, loading, error, onRefresh, onLogout }) {
  const newestUser = users[0];

  const rows = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        initials: getInitials(user.name),
      })),
    [users]
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-medium text-blue-600">Reflectly Admin Dashboard</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">Platform overview</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right sm:block">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Signed in as</p>
              <p className="text-sm font-semibold text-slate-800">{adminName}</p>
            </div>

            <button
              onClick={onLogout}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="rounded-[2rem] bg-[linear-gradient(135deg,_#0f172a_0%,_#1d4ed8_55%,_#60a5fa_100%)] p-8 text-white shadow-[0_30px_80px_rgba(29,78,216,0.25)]">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-100">Overview</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Keep an eye on your user base.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-blue-100">
              This first version focuses on fast admin access and a clean user directory pulled directly from the database.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={onRefresh}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                {loading ? "Refreshing..." : "Refresh Data"}
              </button>
              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm text-blue-50">
                {newestUser ? `Newest user: ${newestUser.name}` : "No users yet"}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Quick Notes</p>
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Authentication</p>
                <p className="mt-1 text-sm text-slate-500">Temporary admin access is active with the placeholder credentials.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">User Visibility</p>
                <p className="mt-1 text-sm text-slate-500">The user table shows real records from PostgreSQL through Prisma.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Next Step</p>
                <p className="mt-1 text-sm text-slate-500">We can extend this with diary moderation, tags, and analytics after this.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <StatCard
            label="Total Users"
            value={summary.totalUsers}
            hint="All registered users in the platform"
          />
          <StatCard
            label="Diary Entries"
            value={summary.totalDiaryEntries}
            hint="Total entries associated with all users"
          />
          <StatCard
            label="New This Week"
            value={summary.newUsersThisWeek}
            hint="Users created during the last 7 days"
          />
        </section>

        <section className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">Users</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Registered users</h3>
              <p className="mt-1 text-sm text-slate-500">Live data fetched from the database.</p>
            </div>
            <button
              onClick={onRefresh}
              className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh table
            </button>
          </div>

          {error ? (
            <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs uppercase tracking-[0.18em] text-slate-400">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Diary Entries</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">
                        Loading users...
                      </td>
                    </tr>
                  ) : rows.length ? (
                    rows.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/80">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 font-semibold text-blue-700">
                              {user.initials}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{user.name}</p>
                              <p className="text-sm text-slate-500">ID #{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{user.email}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(user.createdAt)}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                            {user.diaryCount}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-sm text-slate-500">
                        No users found in the database yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [adminName, setAdminName] = useState("admin");
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDiaryEntries: 0,
    newUsersThisWeek: 0,
  });
  const [loginError, setLoginError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  async function loadUsers(activeToken = token) {
    if (!activeToken) return;

    setIsLoadingUsers(true);
    setDashboardError("");

    try {
      const response = await fetch(`${getApiUrl()}/admin/users`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load users.");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
      setSummary(
        data.summary || {
          totalUsers: 0,
          totalDiaryEntries: 0,
          newUsersThisWeek: 0,
        }
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load users.";
      setDashboardError(message);

      if (/token|admin access|required|expired|invalid/i.test(message)) {
        handleLogout();
      }
    } finally {
      setIsLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (token) {
      loadUsers(token);
    }
  }, [token]);

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUsers([]);
    setSummary({
      totalUsers: 0,
      totalDiaryEntries: 0,
      newUsersThisWeek: 0,
    });
    setDashboardError("");
  }

  async function handleLogin(event) {
    event.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      const response = await fetch(`${getApiUrl()}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to login.");
      }

      localStorage.setItem(STORAGE_KEY, data.token);
      setAdminName(data.admin?.username || "admin");
      setToken(data.token);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "Failed to login.");
    } finally {
      setIsLoggingIn(false);
    }
  }

  if (!token) {
    return (
      <LoginScreen
        username={username}
        password={password}
        error={loginError}
        loading={isLoggingIn}
        onUsernameChange={setUsername}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  return (
    <Dashboard
      adminName={adminName}
      users={users}
      summary={summary}
      loading={isLoadingUsers}
      error={dashboardError}
      onRefresh={() => loadUsers(token)}
      onLogout={handleLogout}
    />
  );
}
