import { Mail } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-card-border/50 bg-bg/80 px-6 py-4 backdrop-blur-md sm:px-10">
      <span className="text-sm font-semibold tracking-tight text-white">
        AIClawBots.com
      </span>
      <a
        href="mailto:support@aiclawbots.com"
        className="flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
      >
        <Mail className="h-4 w-4" />
        Contact Support
      </a>
    </nav>
  );
}
