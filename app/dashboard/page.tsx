"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Play,
  Square,
  Trash2,
  RefreshCw,
  Loader2,
  Terminal,
  Activity,
  Bot,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

type BotStatus = "running" | "stopped" | "failed" | "deploying" | "loading";
type ActionState = "idle" | "loading" | "success" | "error";

const MODEL_LABELS: Record<string, string> = {
  "claude-opus-4-5": "Claude Opus 4.5",
  "gpt-5-2": "GPT-5.2",
  "gemini-3-flash": "Gemini 3 Flash",
};

const POLL_INTERVAL = 5000;

export default function DashboardPage() {
  const router = useRouter();

  // Core state
  const [status, setStatus] = useState<BotStatus>("loading");
  const [rawStatus, setRawStatus] = useState("");
  const [logs, setLogs] = useState<
    Array<{ timestamp: string; message: string; severity: string }>
  >([]);
  const [botUsername, setBotUsername] = useState<string | null>(null);

  // Action states
  const [stopAction, setStopAction] = useState<ActionState>("idle");
  const [startAction, setStartAction] = useState<ActionState>("idle");
  const [deleteAction, setDeleteAction] = useState<ActionState>("idle");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // localStorage values
  const [projectId, setProjectId] = useState<string | null>(null);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [telegramToken, setTelegramToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Init from localStorage
  useEffect(() => {
    const pid = localStorage.getItem("projectId");
    const sid = localStorage.getItem("serviceId");
    const model = localStorage.getItem("selectedModel");
    const token = localStorage.getItem("telegramToken");

    if (!pid || !sid) {
      router.push("/");
      return;
    }

    setProjectId(pid);
    setServiceId(sid);
    setSelectedModel(model);
    setTelegramToken(token);
    setReady(true);
  }, [router]);

  const fetchStatus = useCallback(async () => {
    if (!serviceId || !projectId) return;
    try {
      const res = await fetch(
        `/api/deploy/status?serviceId=${encodeURIComponent(serviceId)}&projectId=${encodeURIComponent(projectId)}`
      );
      const data = await res.json();

      if (data.status === "running") {
        setStatus("running");
      } else if (data.status === "deploying") {
        setStatus("deploying");
      } else {
        const raw = data.rawStatus || "";
        if (raw === "stopped" || raw === "suspended") {
          setStatus("stopped");
        } else {
          setStatus("failed");
        }
      }
      setRawStatus(data.rawStatus || "");
    } catch {
      // Keep last known status on network error
    }
  }, [serviceId, projectId]);

  const fetchLogs = useCallback(async () => {
    if (!serviceId || !projectId) return;
    try {
      const res = await fetch(
        `/api/deploy/logs?deploymentId=${encodeURIComponent(serviceId)}&projectId=${encodeURIComponent(projectId)}`
      );
      const data = await res.json();
      if (data.deploymentLogs) {
        setLogs(data.deploymentLogs);
      }
    } catch {
      // silently fail
    }
  }, [serviceId, projectId]);

  const fetchBotInfo = useCallback(async () => {
    if (!telegramToken) return;
    try {
      const res = await fetch(
        `/api/bot/info?token=${encodeURIComponent(telegramToken)}`
      );
      const data = await res.json();
      if (data.username) {
        setBotUsername(data.username);
      }
    } catch {
      // silently fail
    }
  }, [telegramToken]);

  // Start polling when ready
  useEffect(() => {
    if (!ready || !serviceId || !projectId) return;

    fetchStatus();
    fetchLogs();
    fetchBotInfo();

    pollRef.current = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, POLL_INTERVAL);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [ready, serviceId, projectId, fetchStatus, fetchLogs, fetchBotInfo]);

  // Actions
  async function handleStop() {
    setStopAction("loading");
    try {
      const res = await fetch("/api/bot/stop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, projectId }),
      });
      if (!res.ok) throw new Error();
      setStopAction("success");
      setStatus("stopped");
      setTimeout(() => setStopAction("idle"), 2000);
    } catch {
      setStopAction("error");
      setTimeout(() => setStopAction("idle"), 3000);
    }
  }

  async function handleStart() {
    setStartAction("loading");
    try {
      const res = await fetch("/api/bot/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, projectId }),
      });
      if (!res.ok) throw new Error();
      setStartAction("success");
      setStatus("deploying");
      setTimeout(() => setStartAction("idle"), 2000);
    } catch {
      setStartAction("error");
      setTimeout(() => setStartAction("idle"), 3000);
    }
  }

  async function handleDelete() {
    setDeleteAction("loading");
    try {
      const res = await fetch("/api/bot/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) throw new Error();
      localStorage.removeItem("telegramToken");
      localStorage.removeItem("apiKey");
      localStorage.removeItem("selectedModel");
      localStorage.removeItem("deployed");
      localStorage.removeItem("projectId");
      localStorage.removeItem("serviceId");
      localStorage.removeItem("lastDeploymentId");
      setDeleteAction("success");
      setTimeout(() => router.push("/"), 1500);
    } catch {
      setDeleteAction("error");
      setShowDeleteConfirm(false);
      setTimeout(() => setDeleteAction("idle"), 3000);
    }
  }

  function handleRefresh() {
    fetchStatus();
    fetchLogs();
  }

  // Status display helpers
  const statusConfig: Record<
    BotStatus,
    { label: string; color: string; pulse: boolean }
  > = {
    running: { label: "Running", color: "bg-accent-green", pulse: true },
    deploying: { label: "Starting...", color: "bg-yellow-400", pulse: true },
    stopped: { label: "Stopped", color: "bg-muted", pulse: false },
    failed: { label: "Failed", color: "bg-accent-coral", pulse: false },
    loading: { label: "Loading...", color: "bg-muted", pulse: false },
  };

  const statusTextColor: Record<BotStatus, string> = {
    running: "text-accent-green",
    deploying: "text-yellow-400",
    stopped: "text-muted",
    failed: "text-accent-coral",
    loading: "text-muted",
  };

  if (!ready) return null;

  const sc = statusConfig[status];

  return (
    <main className="relative">
      <Navbar />
      <div className="relative min-h-screen px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Back link */}
          <button
            onClick={() => router.push("/")}
            className="mb-8 flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          {/* Header */}
          <div className="animate-fade-in-up">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Bot Dashboard
            </h1>
            <p className="mt-2 text-base text-muted">
              Monitor and manage your deployed AI assistant.
            </p>
          </div>

          {/* Status Card */}
          <div className="animate-fade-in-up-delay mt-8 rounded-2xl border border-card-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/10">
                <Bot className="h-5 w-5 text-accent-purple" />
              </div>
              <h2 className="text-lg font-semibold text-white">Bot Status</h2>
            </div>

            <div className="mt-6 space-y-4">
              {/* Status indicator */}
              <div className="flex items-center gap-3">
                {status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted" />
                ) : (
                  <span className="relative flex h-3 w-3">
                    {sc.pulse && (
                      <span
                        className={`absolute inline-flex h-full w-full animate-ping rounded-full ${sc.color} opacity-75`}
                      />
                    )}
                    <span
                      className={`relative inline-flex h-3 w-3 rounded-full ${sc.color}`}
                    />
                  </span>
                )}
                <span className={`text-sm font-medium ${statusTextColor[status]}`}>
                  {sc.label}
                </span>
                {rawStatus && status !== "loading" && (
                  <span className="text-xs text-muted">({rawStatus})</span>
                )}
              </div>

              {/* Bot details */}
              <div className="grid gap-3 sm:grid-cols-2">
                {selectedModel && (
                  <div className="rounded-lg border border-card-border bg-bg p-3">
                    <p className="text-xs text-muted">Model</p>
                    <p className="mt-1 text-sm font-medium text-white">
                      {MODEL_LABELS[selectedModel] || selectedModel}
                    </p>
                  </div>
                )}
                <div className="rounded-lg border border-card-border bg-bg p-3">
                  <p className="text-xs text-muted">Project ID</p>
                  <p className="mt-1 truncate text-sm font-mono text-white">
                    {projectId}
                  </p>
                </div>
              </div>

              {/* Telegram link */}
              {botUsername ? (
                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-purple transition-colors hover:text-accent-purple/80"
                >
                  t.me/{botUsername}
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <p className="text-xs text-muted">Loading bot info...</p>
              )}
            </div>
          </div>

          {/* Controls Card */}
          <div className="animate-fade-in-up-delay mt-6 rounded-2xl border border-card-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-green/10">
                <Activity className="h-5 w-5 text-accent-green" />
              </div>
              <h2 className="text-lg font-semibold text-white">Controls</h2>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              {/* Stop button */}
              {status === "running" && (
                <button
                  onClick={handleStop}
                  disabled={stopAction === "loading"}
                  className="flex items-center gap-2 rounded-lg border border-card-border bg-bg px-5 py-2.5 text-sm font-medium text-white transition-all hover:border-card-border-hover disabled:opacity-50"
                >
                  {stopAction === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Square className="h-4 w-4" />
                  )}
                  {stopAction === "loading"
                    ? "Stopping..."
                    : stopAction === "success"
                      ? "Stopped"
                      : "Stop Bot"}
                </button>
              )}

              {/* Start button */}
              {(status === "stopped" || status === "failed") && (
                <button
                  onClick={handleStart}
                  disabled={startAction === "loading"}
                  className="flex items-center gap-2 rounded-lg bg-accent-green px-5 py-2.5 text-sm font-semibold text-black transition-all hover:bg-accent-green/90 disabled:opacity-50"
                >
                  {startAction === "loading" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {startAction === "loading" ? "Starting..." : "Start Bot"}
                </button>
              )}

              {/* Refresh button */}
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 rounded-lg border border-card-border bg-bg px-5 py-2.5 text-sm font-medium text-muted transition-all hover:border-card-border-hover hover:text-white"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>

              {/* Delete button */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="ml-auto flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete Bot
              </button>
            </div>
          </div>

          {/* Logs Card */}
          <div className="animate-fade-in-up-delay-2 mt-6 rounded-2xl border border-card-border bg-card p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/10">
                  <Terminal className="h-5 w-5 text-accent-purple" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Machine Events
                </h2>
              </div>
              <span className="text-xs text-muted">Auto-refreshes every 5s</span>
            </div>

            <div className="mt-4 max-h-64 overflow-y-auto rounded-lg border border-card-border bg-bg p-4">
              {logs.length === 0 ? (
                <p className="text-sm text-muted/50">No events yet.</p>
              ) : (
                <div className="space-y-2">
                  {[...logs].reverse().map((log, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <span className="shrink-0 font-mono text-muted/50">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-mono text-muted">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm">
          <div className="mx-4 max-w-sm rounded-2xl border border-card-border bg-card p-6 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
              <Trash2 className="h-6 w-6 text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">Delete Bot?</h3>
            <p className="mt-2 text-sm text-muted">
              This will permanently stop and delete your bot from Fly.io. This
              action cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-lg border border-card-border bg-bg py-2.5 text-sm font-medium text-white transition-all hover:border-card-border-hover"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteAction === "loading"}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 disabled:opacity-50"
              >
                {deleteAction === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
