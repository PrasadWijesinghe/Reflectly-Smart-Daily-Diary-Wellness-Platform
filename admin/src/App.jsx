import React, { useEffect, useState } from "react";
import { getApiUrl } from "./utils/helpers";
import { LoginScreen } from "./components/LoginScreen";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { UsersList } from "./components/UsersList";
import { TagsList } from "./components/TagsList";
import { FeedbackList } from "./components/FeedbackList";
import { SystemHealth } from "./components/SystemHealth";

const STORAGE_KEY = "reflectly_admin_token";

export default function App() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY) || "");
  const [adminName, setAdminName] = useState("admin");
  
  // Data State
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalDiaryEntries: 0,
    newUsersThisWeek: 0,
  });

  const [loginError, setLoginError] = useState("");
  const [dashboardError, setDashboardError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState("dashboard");

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



  async function loadFeedbacks(activeToken = token) {
    if (!activeToken) return;

    setIsLoadingFeedbacks(true);
    setDashboardError("");

    try {
      const response = await fetch(`${getApiUrl()}/admin/feedback`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load feedbacks.");
      }

      setFeedbacks(Array.isArray(data.feedbacks) ? data.feedbacks : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load feedbacks.";
      setDashboardError(message);

      if (/token|admin access|required|expired|invalid/i.test(message)) {
        handleLogout();
      }
    } finally {
      setIsLoadingFeedbacks(false);
    }
  }

  async function loadTags(activeToken = token) {
    if (!activeToken) return;

    setIsLoadingTags(true);
    setDashboardError("");

    try {
      const response = await fetch(`${getApiUrl()}/admin/tags`, {
        headers: {
          Authorization: `Bearer ${activeToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load tags.");
      }

      setTags(Array.isArray(data.tags) ? data.tags : []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load tags.";
      setDashboardError(message);

      if (/token|admin access|required|expired|invalid/i.test(message)) {
        handleLogout();
      }
    } finally {
      setIsLoadingTags(false);
    }
  }

  async function handleCreateTag(tag) {
    if (!token) return;

    setDashboardError("");

    const response = await fetch(`${getApiUrl()}/admin/tags`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(tag),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to create tag.");
    }

    await loadTags(token);
    return data.tag;
  }

  useEffect(() => {
    if (token) {
      loadUsers(token);
      loadTags(token);
      loadFeedbacks(token);
    }
  }, [token]);

  function handleRefresh() {
    if (activeTab === 'users' || activeTab === 'dashboard') {
      loadUsers(token);
    }

    if (activeTab === 'tags') {
      loadTags(token);
    }

    if (activeTab === 'feedback') {
      loadFeedbacks(token);
    }
  }

  function handleLogout() {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
    setUsers([]);
    setTags([]);
    setFeedbacks([]);
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
    <div className="flex h-screen overflow-hidden bg-[#f1f5f9] font-sans">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <Header adminName={adminName} onLogout={handleLogout} />
        
        <main className="w-full p-4 md:p-6 2xl:p-10">
          {activeTab === 'dashboard' && <Dashboard summary={summary} />}
          {activeTab === 'users' && (
            <UsersList 
              users={users} 
              loading={isLoadingUsers} 
              error={dashboardError} 
              onRefresh={handleRefresh} 
            />
          )}

          {activeTab === 'tags' && (
            <TagsList
              tags={tags}
              loading={isLoadingTags}
              error={dashboardError}
              onRefresh={handleRefresh}
              onCreateTag={handleCreateTag}
            />
          )}

          {activeTab === 'feedback' && (
            <FeedbackList 
              feedbacks={feedbacks} 
              loading={isLoadingFeedbacks} 
              error={dashboardError} 
              onRefresh={handleRefresh} 
            />
          )}

          {activeTab === 'health' && <SystemHealth />}
        </main>
      </div>
    </div>
  );
}
