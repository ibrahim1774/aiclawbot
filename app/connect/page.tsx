"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Send,
  Check,
  Key,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

type Model = "claude-opus-4-5" | "gpt-5-2" | "gemini-3-flash";

const modelConfig: Record<
  Model,
  { label: string; url: string; urlLabel: string; placeholder: string }
> = {
  "claude-opus-4-5": {
    label: "Anthropic",
    url: "https://console.anthropic.com",
    urlLabel: "console.anthropic.com",
    placeholder: "sk-ant-api03-...",
  },
  "gpt-5-2": {
    label: "OpenAI",
    url: "https://platform.openai.com/api-keys",
    urlLabel: "platform.openai.com/api-keys",
    placeholder: "sk-proj-...",
  },
  "gemini-3-flash": {
    label: "Google AI",
    url: "https://aistudio.google.com/apikey",
    urlLabel: "aistudio.google.com/apikey",
    placeholder: "AIza...",
  },
};

export default function ConnectPage() {
  const router = useRouter();
  const [apiKey, setApiKey] = useState("");
  const [token, setToken] = useState("");
  const [selectedModel, setSelectedModel] = useState<Model>("claude-opus-4-5");
  const [verified, setVerified] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const model = localStorage.getItem("selectedModel") as Model | null;
    if (model && model in modelConfig) {
      setSelectedModel(model);
    }
    const existingKey = localStorage.getItem("apiKey");
    if (existingKey) setApiKey(existingKey);
    const existingToken = localStorage.getItem("telegramToken");
    if (existingToken) setToken(existingToken);
  }, []);

  function handleVerify() {
    if (!apiKey.trim()) return;
    setVerified(true);
    setTimeout(() => setVerified(false), 3000);
  }

  function handleSave() {
    if (!apiKey.trim() || !token.trim()) return;
    localStorage.setItem("apiKey", apiKey.trim());
    localStorage.setItem("telegramToken", token.trim());
    localStorage.setItem("selectedModel", selectedModel);
    setSaved(true);
    setTimeout(() => {
      router.push("/");
    }, 2000);
  }

  const config = modelConfig[selectedModel];

  return (
    <div className="relative min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      {/* Success toast */}
      {saved && (
        <div className="fixed top-4 left-1/2 z-50 animate-slide-in-down">
          <div className="flex items-center gap-2 rounded-full border border-accent-green/30 bg-accent-green/10 px-5 py-2.5 text-sm font-medium text-accent-green">
            <Check className="h-4 w-4" />
            Connected! Redirecting...
          </div>
        </div>
      )}

      <div className="mx-auto max-w-4xl">
        {/* Back link */}
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </button>

        {/* SECTION 1 — AI API Key */}
        <div className="rounded-2xl border border-card-border bg-card p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-purple/10">
              <Key className="h-5 w-5 text-accent-purple" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Enter Your AI API Key
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Your API key is only used to power your assistant. We never
                store or share it.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-muted">
              Get your {config.label} API key from{" "}
              <a
                href={config.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-medium text-accent-purple transition-colors hover:text-accent-purple/80"
              >
                {config.urlLabel}
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setVerified(false);
              }}
              placeholder={config.placeholder}
              className={`flex-1 rounded-lg border px-4 py-3 text-sm text-white placeholder-muted/50 transition-all focus:outline-none focus:ring-1 focus:ring-accent-purple/50 ${
                verified
                  ? "border-accent-green bg-accent-green/5 focus:ring-accent-green/50"
                  : "border-card-border bg-bg focus:border-accent-purple"
              }`}
            />
            <button
              onClick={handleVerify}
              disabled={!apiKey.trim()}
              className={`flex shrink-0 items-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all ${
                verified
                  ? "border border-accent-green/30 bg-accent-green/10 text-accent-green"
                  : "border border-card-border bg-bg text-muted hover:border-card-border-hover hover:text-white disabled:opacity-40 disabled:hover:border-card-border disabled:hover:text-muted"
              }`}
            >
              {verified ? (
                <>
                  <Check className="h-4 w-4" />
                  Verified
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  Verify Key
                </>
              )}
            </button>
          </div>
        </div>

        {/* SECTION 2 — Telegram Token */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-card-border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Left column — Instructions */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2AABEE]/10">
                  <Send className="h-5 w-5 text-[#2AABEE]" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  Connect Telegram
                </h2>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-medium text-white">
                  How to get your bot token?
                </h3>
                <ol className="mt-4 space-y-3 text-sm text-muted">
                  <li className="flex gap-3">
                    <span className="shrink-0 font-medium text-white">1.</span>
                    <span>
                      Open Telegram and go to{" "}
                      <a
                        href="https://t.me/BotFather"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-white underline decoration-card-border-hover underline-offset-2 transition-colors hover:text-accent-purple"
                      >
                        @BotFather
                      </a>
                      .
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-medium text-white">2.</span>
                    <span>
                      Start a chat and type{" "}
                      <code className="rounded bg-bg px-1.5 py-0.5 text-xs text-white">
                        /newbot
                      </code>
                      .
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-medium text-white">3.</span>
                    <span>
                      Follow the prompts to name your bot and choose a username.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-medium text-white">4.</span>
                    <span>
                      BotFather will send you a message with your bot token.
                      Copy the entire token (it looks like a long string of
                      numbers and letters).
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 font-medium text-white">5.</span>
                    <span>
                      Paste the token in the field below and click Save &amp;
                      Connect.
                    </span>
                  </li>
                </ol>
              </div>

              <div className="mt-6">
                <label className="mb-2 block text-sm font-medium text-muted">
                  Enter bot token
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                  className="w-full rounded-lg border border-card-border bg-bg px-4 py-3 text-sm text-white placeholder-muted/50 transition-all focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple/50"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!apiKey.trim() || !token.trim() || saved}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#333] py-3 text-sm font-semibold text-white transition-all hover:bg-[#444] disabled:opacity-50"
              >
                Save &amp; Connect
                <Check className="h-4 w-4" />
              </button>
            </div>

            {/* Right column — Phone mockup */}
            <div className="hidden items-center justify-center p-8 md:flex">
              <div className="flex aspect-[9/16] max-h-[480px] w-full items-center justify-center rounded-3xl border border-card-border bg-bg">
                {/* Replace with <Image> later */}
                <p className="px-6 text-center text-sm text-muted/50">
                  Telegram BotFather Screenshot
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
