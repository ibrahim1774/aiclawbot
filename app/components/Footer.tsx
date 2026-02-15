"use client";

import { Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-card-border py-8">
      <div className="flex items-center justify-center gap-2 text-sm text-muted">
        <span>Built with ❤️ by AIClawBots</span>
        <span>·</span>
        <a
          href="mailto:support@aiclawbots.com"
          className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
        >
          <Mail className="h-3.5 w-3.5" />
          Contact Support
        </a>
        <span>·</span>
        <button
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          className="text-xs text-muted/50 transition-colors hover:text-accent-coral"
        >
          Reset / Start Over
        </button>
      </div>
    </footer>
  );
}
