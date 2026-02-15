const steps = [
  { task: "Purchasing local virtual machine", time: "15 min" },
  { task: "Creating SSH keys and storing securely", time: "10 min" },
  { task: "Connecting to the server via SSH", time: "5 min" },
  { task: "Installing Node.js and NPM", time: "5 min" },
  { task: "Installing OpenClaw", time: "7 min" },
  { task: "Setting up OpenClaw", time: "10 min" },
  { task: "Connecting to AI provider", time: "4 min" },
  { task: "Pairing with Telegram", time: "4 min" },
];

export default function ComparisonSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Section label */}
      <div className="flex items-center justify-center gap-4">
        <div className="h-px flex-1 bg-card-border" />
        <span className="text-sm font-medium text-accent-coral">
          Comparison
        </span>
        <div className="h-px flex-1 bg-card-border" />
      </div>

      <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Traditional Method vs AIClawBots
      </h2>

      {/* Two columns */}
      <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Traditional */}
        <div className="rounded-xl border border-card-border bg-card p-6 transition-colors hover:border-card-border-hover">
          <h3 className="text-lg font-medium italic text-white">Traditional</h3>
          <div className="mt-5 space-y-3">
            {steps.map((step) => (
              <div
                key={step.task}
                className="flex items-center justify-between border-b border-card-border pb-3 last:border-0"
              >
                <span className="text-sm text-muted">{step.task}</span>
                <span className="ml-4 shrink-0 text-sm font-medium text-white">
                  {step.time}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <span className="text-sm font-bold text-white">Total</span>
            <span className="text-sm font-bold text-white">60 min</span>
          </div>
          <p className="mt-4 text-xs italic text-muted">
            If you&apos;re{" "}
            <span className="text-accent-coral">non-technical</span>, multiply
            these <span className="text-accent-coral">times by 10</span> — you
            have to learn each step before doing.
          </p>
        </div>

        {/* AIClawBots */}
        <div className="flex flex-col justify-center rounded-xl border border-card-border bg-card p-6 transition-colors hover:border-card-border-hover">
          <p className="text-sm font-medium text-muted">AIClawBots</p>
          <p className="mt-2 text-5xl font-bold tracking-tight text-white sm:text-6xl">
            &lt;1 min
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            Pick a model, connect Telegram, deploy — done under 1 minute.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Servers, SSH and OpenClaw Environment are already set up, waiting to
            get assigned. Simple, secure and fast connection to your bot.
          </p>
        </div>
      </div>
    </section>
  );
}
