"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Send, Check } from "lucide-react";

export default function ConnectPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existingToken = localStorage.getItem("telegramToken");
    if (existingToken) setToken(existingToken);
  }, []);

  function handleSave() {
    if (!token.trim()) return;
    localStorage.setItem("telegramToken", token.trim());
    setSaved(true);
    setTimeout(() => {
      router.push("/setup-keys");
    }, 2000);
  }

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

        {/* Telegram Token */}
        <div className="overflow-hidden rounded-2xl border border-card-border bg-card">
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
                disabled={!token.trim() || saved}
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
