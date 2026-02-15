"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Star,
  Check,
  ShieldCheck,
  ExternalLink,
  Loader2,
  Key,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

type Model = "claude-opus-4-5" | "gpt-5-2" | "gemini-3-flash";
type DeployState = "idle" | "deploying" | "success" | "error";

const MODEL_TO_PROVIDER: Record<Model, string> = {
  "claude-opus-4-5": "anthropic",
  "gpt-5-2": "openai",
  "gemini-3-flash": "google",
};

const providerConfig: Record<
  Model,
  {
    providerName: string;
    modelLabel: string;
    url: string;
    urlLabel: string;
    placeholder: string;
    icon: React.ReactNode;
    bgColor: string;
    textColor: string;
  }
> = {
  "claude-opus-4-5": {
    providerName: "Anthropic (Claude)",
    modelLabel: "Claude Opus 4.5",
    url: "https://console.anthropic.com",
    urlLabel: "console.anthropic.com",
    placeholder: "sk-ant-api03-...",
    icon: <Sparkles className="h-5 w-5" />,
    bgColor: "bg-accent-purple/10",
    textColor: "text-accent-purple",
  },
  "gpt-5-2": {
    providerName: "OpenAI (GPT)",
    modelLabel: "GPT-5.2",
    url: "https://platform.openai.com/api-keys",
    urlLabel: "platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M8 12a4 4 0 0 1 8 0 4 4 0 0 1-8 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>
    ),
    bgColor: "bg-accent-green/10",
    textColor: "text-accent-green",
  },
  "gemini-3-flash": {
    providerName: "Google (Gemini)",
    modelLabel: "Gemini 3 Flash",
    url: "https://aistudio.google.com/apikey",
    urlLabel: "aistudio.google.com/apikey",
    placeholder: "AIza...",
    icon: <Star className="h-5 w-5" />,
    bgColor: "bg-blue-500/10",
    textColor: "text-blue-400",
  },
};

const modelIds: Model[] = ["claude-opus-4-5", "gpt-5-2", "gemini-3-flash"];

const POLL_INTERVAL = 3000;
const MAX_POLL_TIME = 600000; // 10 minutes

export default function SetupKeysPage() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>("claude-opus-4-5");
  const [keys, setKeys] = useState<Record<Model, string>>({
    "claude-opus-4-5": "",
    "gpt-5-2": "",
    "gemini-3-flash": "",
  });
  const [verified, setVerified] = useState<Record<Model, boolean>>({
    "claude-opus-4-5": false,
    "gpt-5-2": false,
    "gemini-3-flash": false,
  });
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollStartRef = useRef<number>(0);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Guard: redirect to /connect if no telegram token
    if (!localStorage.getItem("telegramToken")) {
      router.push("/connect");
      return;
    }

    const model = localStorage.getItem("selectedModel") as Model | null;
    if (model && model in providerConfig) {
      setSelectedModel(model);
    }

    // Pre-fill existing API key if any
    const existingKey = localStorage.getItem("apiKey");
    if (existingKey && model && model in providerConfig) {
      setKeys((prev) => ({ ...prev, [model]: existingKey }));
    }

    return () => stopPolling();
  }, [router, stopPolling]);

  function handleVerify(modelId: Model) {
    if (!keys[modelId].trim()) return;
    setVerified((prev) => ({ ...prev, [modelId]: true }));
    setTimeout(() => {
      setVerified((prev) => ({ ...prev, [modelId]: false }));
    }, 3000);
  }

  function handleKeyChange(modelId: Model, value: string) {
    setKeys((prev) => ({ ...prev, [modelId]: value }));
    setVerified((prev) => ({ ...prev, [modelId]: false }));
  }

  function startPolling(serviceId: string, projectId: string) {
    pollStartRef.current = Date.now();

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/deploy/status?serviceId=${encodeURIComponent(serviceId)}&projectId=${encodeURIComponent(projectId)}`
        );
        const data = await res.json();

        if (data.status === "running") {
          stopPolling();
          localStorage.setItem("deployed", "true");
          setDeployState("success");
          return;
        }

        if (data.status === "failed") {
          stopPolling();
          setDeployState("error");
          const logHint = data.logs?.length
            ? ` Logs: ${data.logs.slice(-3).join(" | ")}`
            : "";
          setErrorMessage(
            `Deployment failed (${data.rawStatus || "unknown"}).${logHint} Check server console for full logs.`
          );
          // Store deploymentId for manual log inspection
          if (data.deploymentId) {
            localStorage.setItem("lastDeploymentId", data.deploymentId);
          }
          return;
        }

        // Timeout after 2 minutes
        if (Date.now() - pollStartRef.current > MAX_POLL_TIME) {
          stopPolling();
          setDeployState("error");
          setErrorMessage(
            "Deployment timed out. Please try again or contact support."
          );
        }
      } catch {
        stopPolling();
        setDeployState("error");
        setErrorMessage("Failed to check deployment status.");
      }
    }, POLL_INTERVAL);
  }

  async function handleSaveAndDeploy() {
    // Prefer the selected model's key, otherwise use the first non-empty key
    const activeModelId = keys[selectedModel].trim()
      ? selectedModel
      : modelIds.find((id) => keys[id].trim()) ?? null;

    if (!activeModelId || !keys[activeModelId].trim()) return;

    const apiKey = keys[activeModelId].trim();
    const telegramToken = localStorage.getItem("telegramToken");
    if (!telegramToken) {
      router.push("/connect");
      return;
    }

    // Save to localStorage
    localStorage.setItem("apiKey", apiKey);
    localStorage.setItem("selectedModel", activeModelId);

    const aiProvider = MODEL_TO_PROVIDER[activeModelId];

    setDeployState("deploying");
    setErrorMessage("");

    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telegramToken,
          aiApiKey: apiKey,
          aiModel: activeModelId,
          aiProvider,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setDeployState("error");
        setErrorMessage(data.error || "Deployment failed. Please try again.");
        return;
      }

      // Save project/service IDs for later reference
      localStorage.setItem("projectId", data.projectId);
      localStorage.setItem("serviceId", data.serviceId);

      // Start polling for status
      startPolling(data.serviceId, data.projectId);
    } catch {
      setDeployState("error");
      setErrorMessage(
        "Could not reach the deploy server. Please try again."
      );
    }
  }

  const hasAnyKey = Object.values(keys).some((k) => k.trim());

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Deploy success overlay */}
      {deployState === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg/90 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-green/20">
              <Check className="h-8 w-8 text-accent-green" />
            </div>
            <h2 className="mt-4 text-2xl font-bold text-white">
              Your bot is live!
            </h2>
            <p className="mt-2 text-sm text-muted">
              Open Telegram to start chatting.
            </p>
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-accent-purple transition-colors hover:text-accent-purple/80"
            >
              Open Telegram
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <div>
              <button
                onClick={() => router.push("/")}
                className="mt-4 rounded-lg bg-white px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Connect Your AI Provider
          </h1>
          <p className="mt-3 text-base text-muted">
            Enter your API key for the model you selected. You only pay for what
            you use — directly to the provider.
          </p>
        </div>

        {/* Three provider sections */}
        <div className="mt-10 space-y-4">
          {modelIds.map((modelId) => {
            const config = providerConfig[modelId];
            const isHighlighted = modelId === selectedModel;

            return (
              <div
                key={modelId}
                onClick={() => setSelectedModel(modelId)}
                className={`cursor-pointer rounded-2xl border p-6 transition-all duration-200 ${
                  isHighlighted
                    ? "border-card-border-hover bg-card"
                    : "border-card-border/50 bg-card/50 opacity-60 hover:opacity-80"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${config.bgColor}`}
                    >
                      <span className={config.textColor}>{config.icon}</span>
                    </div>
                    <h3 className="text-base font-semibold text-white">
                      {config.providerName}
                    </h3>
                  </div>
                  <a
                    href={config.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs font-medium text-accent-purple transition-colors hover:text-accent-purple/80"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Get your key at {config.urlLabel}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Input + Verify row */}
                <div className="mt-4 flex gap-3">
                  <input
                    type="text"
                    value={keys[modelId]}
                    onChange={(e) => handleKeyChange(modelId, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={config.placeholder}
                    className={`flex-1 rounded-lg border px-4 py-3 text-sm text-white placeholder-muted/50 transition-all focus:outline-none focus:ring-1 focus:ring-accent-purple/50 ${
                      verified[modelId]
                        ? "border-accent-green bg-accent-green/5 focus:ring-accent-green/50"
                        : "border-card-border bg-bg focus:border-accent-purple"
                    }`}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVerify(modelId);
                    }}
                    disabled={!keys[modelId].trim()}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                      verified[modelId]
                        ? "border border-accent-green/30 bg-accent-green/10 text-accent-green"
                        : "border border-card-border bg-bg text-muted hover:border-card-border-hover hover:text-white disabled:opacity-40 disabled:hover:border-card-border disabled:hover:text-muted"
                    }`}
                  >
                    {verified[modelId] ? (
                      <>
                        <Check className="h-4 w-4" />
                        Verified
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        Verify
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {deployState === "error" && errorMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {errorMessage}
          </div>
        )}

        {/* Save & Deploy button */}
        <div className="mt-8">
          <button
            onClick={handleSaveAndDeploy}
            disabled={deployState === "deploying" || !hasAnyKey}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3.5 text-sm font-semibold transition-all duration-200 ${
              deployState === "deploying"
                ? "bg-white/70 text-black"
                : "bg-white text-black hover:bg-white/90 disabled:opacity-50"
            }`}
          >
            {deployState === "deploying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deploying your assistant...
              </>
            ) : (
              <>
                <Key className="h-4 w-4" />
                Save &amp; Deploy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
