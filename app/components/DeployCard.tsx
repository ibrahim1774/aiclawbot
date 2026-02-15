"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Zap,
  ExternalLink,
  Check,
  Loader2,
  Sparkles,
  Send,
  Star,
  MessageCircle,
} from "lucide-react";

type Model = "claude-opus-4-5" | "gpt-5-2" | "gemini-3-flash";
type DeployState = "idle" | "deploying" | "success" | "live";

const models: { id: Model; label: string; icon: React.ReactNode }[] = [
  {
    id: "claude-opus-4-5",
    label: "Claude Opus 4.5",
    icon: <Sparkles className="h-4 w-4" />,
  },
  {
    id: "gpt-5-2",
    label: "GPT-5.2",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M8 12a4 4 0 0 1 8 0 4 4 0 0 1-8 0" fill="none" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "gemini-3-flash",
    label: "Gemini 3 Flash",
    icon: <Star className="h-4 w-4" />,
  },
];

const channels = [
  { id: "telegram", label: "Telegram", icon: <Send className="h-4 w-4" />, active: true },
  {
    id: "discord",
    label: "Discord",
    icon: <MessageCircle className="h-4 w-4" />,
    active: false,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <MessageCircle className="h-4 w-4" />,
    active: false,
  },
];

export default function DeployCard() {
  const router = useRouter();
  const [selectedModel, setSelectedModel] = useState<Model>("claude-opus-4-5");
  const [deployState, setDeployState] = useState<DeployState>("idle");
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("selectedModel") as Model | null;
    if (saved && models.some((m) => m.id === saved)) {
      setSelectedModel(saved);
    }
    const connected =
      !!localStorage.getItem("telegramToken") &&
      !!localStorage.getItem("apiKey");
    setIsConnected(connected);

    if (connected && localStorage.getItem("deployed") === "true") {
      setDeployState("live");
    }
  }, []);

  function handleModelSelect(id: Model) {
    setSelectedModel(id);
    localStorage.setItem("selectedModel", id);
  }

  function handleDeploy() {
    const token = localStorage.getItem("telegramToken");
    const apiKey = localStorage.getItem("apiKey");
    if (!token || !apiKey) {
      router.push("/connect");
      return;
    }
    setDeployState("deploying");
    setTimeout(() => {
      localStorage.setItem("deployed", "true");
      setDeployState("success");
    }, 3000);
  }

  const isLiveOrSuccess = deployState === "success" || deployState === "live";

  return (
    <div className="animate-fade-in-up-delay-2 glow-border mx-auto mt-10 max-w-xl rounded-2xl bg-card p-6 sm:p-8">
      {/* Model selection */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted">
          Which model do you want as default?
        </p>
        <div className="flex flex-wrap gap-2">
          {models.map((model) => (
            <button
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                selectedModel === model.id
                  ? "scale-[1.02] border border-white/20 bg-white/10 text-white"
                  : "border border-card-border bg-bg text-muted hover:border-card-border-hover hover:text-white"
              }`}
            >
              {model.icon}
              {model.label}
              {selectedModel === model.id && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      </div>

      {/* Channel selection */}
      <div className="mt-6 space-y-3">
        <p className="text-sm font-medium text-muted">
          Which channel do you want to use for sending messages?
        </p>
        <div className="flex flex-wrap gap-2">
          {channels.map((channel) => (
            <div key={channel.id} className="flex flex-col items-center">
              <button
                disabled={!channel.active}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  channel.active
                    ? "border border-white/20 bg-white/10 text-white"
                    : "cursor-not-allowed border border-card-border bg-bg text-muted/50 opacity-50"
                }`}
              >
                {channel.icon}
                {channel.label}
                {channel.active && isConnected && (
                  <span className="h-2 w-2 rounded-full bg-accent-green" />
                )}
              </button>
              {!channel.active && (
                <span className="mt-1 text-[10px] text-muted/50">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* User info */}
      <div className="mt-6 flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-green text-sm font-bold text-black">
          m
        </div>
        <div>
          {isConnected ? (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-accent-green">
                  Telegram Connected
                </span>
                <Check className="h-3.5 w-3.5 text-accent-green" />
              </div>
              <p className="text-xs text-muted">Bot token & API key saved</p>
            </>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-white">Guest User</span>
                <ExternalLink className="h-3 w-3 text-muted" />
              </div>
              <p className="text-xs text-muted">Sign in with Google coming soon</p>
            </>
          )}
        </div>
      </div>

      {/* Deploy button */}
      <div className="mt-6">
        {isLiveOrSuccess ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-green py-3 text-sm font-semibold text-black">
            <Check className="h-4 w-4" />
            Your assistant is live!
          </div>
        ) : (
          <button
            onClick={handleDeploy}
            disabled={deployState === "deploying"}
            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all duration-200 ${
              deployState === "deploying"
                ? "bg-white/70 text-black"
                : isConnected
                  ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:bg-white/90"
                  : "bg-white text-black hover:bg-white/90 disabled:opacity-70"
            }`}
          >
            {deployState === "deploying" ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deploying your assistant...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                Deploy OpenClaw
              </>
            )}
          </button>
        )}
      </div>

      {/* Status text */}
      {deployState === "idle" && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">
            {isConnected
              ? "Ready to deploy."
              : "Connect your API key & Telegram to continue."}
          </p>
          <p className="mt-1 animate-subtle-pulse text-xs font-medium text-accent-purple">
            Limited cloud servers — only 11 left
          </p>
        </div>
      )}

      {isLiveOrSuccess && (
        <div className="mt-4 text-center">
          <p className="text-xs text-muted">
            Open Telegram and message your bot to start chatting.
          </p>
          <a
            href="https://t.me/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-accent-purple transition-colors hover:text-accent-purple/80"
          >
            Open Telegram
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}
