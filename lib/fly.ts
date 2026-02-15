const FLY_API_BASE = "https://api.machines.dev/v1";
const FLY_ORG_SLUG = "ibrahim-342";
const OPENCLAW_IMAGE = "ghcr.io/openclaw/openclaw:main";
const INTERNAL_PORT = 8080;
const MACHINE_REGION = "sjc";

const PROVIDER_ENV_KEY: Record<string, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
};

const MODEL_PATH: Record<string, string> = {
  "claude-opus-4-5": "anthropic/claude-opus-4-5",
  "gpt-5-2": "openai/gpt-5-2",
  "gemini-3-flash": "google/gemini-3-flash",
};

async function flyRequest<T = unknown>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = process.env.FLY_API_TOKEN;
  if (!token) {
    throw new Error("FLY_API_TOKEN is not set");
  }

  const res = await fetch(`${FLY_API_BASE}${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Fly API error (${res.status}): ${errorBody}`);
  }

  if (res.status === 204) return {} as T;

  return res.json() as Promise<T>;
}

// ─── createDeployment ────────────────────────────────────────────────
export async function createDeployment(
  telegramToken: string,
  aiApiKey: string,
  aiModel: string,
  aiProvider: string
) {
  // 1. Create Fly app
  const appName = `aiclawbots-${crypto.randomUUID().slice(0, 8)}`;

  await flyRequest("/apps", {
    method: "POST",
    body: {
      app_name: appName,
      org_slug: FLY_ORG_SLUG,
    },
  });

  // 2. Build OpenClaw config
  const envVarKey = PROVIDER_ENV_KEY[aiProvider];
  if (!envVarKey) {
    throw new Error(`Unknown AI provider: ${aiProvider}`);
  }

  const gatewayToken = crypto.randomUUID();
  const modelPath = MODEL_PATH[aiModel] || `${aiProvider}/${aiModel}`;

  const openclawConfig = JSON.stringify({
    gateway: {
      auth: { token: "${OPENCLAW_GATEWAY_TOKEN}" },
      controlUi: { allowInsecureAuth: true },
    },
    channels: {
      telegram: {
        enabled: true,
        botToken: "${TELEGRAM_BOT_TOKEN}",
        dmPolicy: "open",
      },
    },
    agents: {
      defaults: {
        model: { primary: modelPath },
      },
    },
    models: {
      providers: {
        [aiProvider]: {
          apiKey: `\${${envVarKey}}`,
        },
      },
    },
  });

  const envVars: Record<string, string> = {
    TELEGRAM_BOT_TOKEN: telegramToken,
    [envVarKey]: aiApiKey,
    NODE_ENV: "production",
    OPENCLAW_GATEWAY_TOKEN: gatewayToken,
    OPENCLAW_CONFIG_JSON: openclawConfig,
    HOME: "/home/node",
  };

  // 3. Create machine with OpenClaw image
  const machine = await flyRequest<{ id: string }>(
    `/apps/${appName}/machines`,
    {
      method: "POST",
      body: {
        name: "openclaw-bot",
        region: MACHINE_REGION,
        config: {
          image: OPENCLAW_IMAGE,
          env: envVars,
          cmd: [
            "/bin/sh",
            "-c",
            `mkdir -p $HOME/.openclaw && printf '%s' "$OPENCLAW_CONFIG_JSON" > $HOME/.openclaw/openclaw.json && exec node dist/index.js gateway --bind lan --port ${INTERNAL_PORT}`,
          ],
          services: [
            {
              ports: [
                { port: 443, handlers: ["tls", "http"] },
                { port: 80, handlers: ["http"] },
              ],
              protocol: "tcp",
              internal_port: INTERNAL_PORT,
            },
          ],
          guest: {
            cpu_kind: "shared",
            cpus: 1,
            memory_mb: 512,
          },
          auto_destroy: false,
          restart: { policy: "always" },
        },
      },
    }
  );

  const machineId = machine.id;

  return {
    projectId: appName,
    serviceId: machineId,
    environmentId: appName,
  };
}

// ─── getDeploymentStatus ─────────────────────────────────────────────
export async function getDeploymentStatus(
  machineId: string,
  appName: string
): Promise<{
  status: "running" | "deploying" | "failed";
  deploymentId?: string;
  rawStatus?: string;
}> {
  const machine = await flyRequest<{ id: string; state: string }>(
    `/apps/${appName}/machines/${machineId}`
  );

  const state = machine.state;
  console.log("Fly machine status:", state, "machineId:", machine.id);

  if (state === "started") {
    return { status: "running", deploymentId: machine.id, rawStatus: state };
  }
  if (["created", "starting", "replacing"].includes(state)) {
    return { status: "deploying", deploymentId: machine.id, rawStatus: state };
  }
  return { status: "failed", deploymentId: machine.id, rawStatus: state };
}

// ─── getMachineLogs ──────────────────────────────────────────────────
type LogEntry = { timestamp: string; message: string; severity: string };

export async function getMachineLogs(
  appName: string,
  machineId: string
): Promise<LogEntry[]> {
  try {
    const events = await flyRequest<
      Array<{ id: string; type: string; status: string; timestamp: number }>
    >(`/apps/${appName}/machines/${machineId}/events`);

    return (events ?? []).map((e) => ({
      timestamp: new Date(e.timestamp * 1000).toISOString(),
      message: `[${e.type}] ${e.status}`,
      severity: "info",
    }));
  } catch {
    return [];
  }
}

// ─── stopDeployment ──────────────────────────────────────────────────
export async function stopDeployment(
  machineId: string,
  appName: string
) {
  await flyRequest(`/apps/${appName}/machines/${machineId}/stop`, {
    method: "POST",
  });
}

// ─── deleteDeployment ────────────────────────────────────────────────
export async function deleteDeployment(appName: string) {
  // Stop all machines first, then delete the app
  try {
    const machines = await flyRequest<Array<{ id: string; state: string }>>(
      `/apps/${appName}/machines`
    );
    for (const m of machines) {
      if (m.state === "started" || m.state === "starting") {
        try {
          await flyRequest(`/apps/${appName}/machines/${m.id}/stop`, {
            method: "POST",
          });
        } catch {
          // machine may already be stopped
        }
      }
    }
  } catch {
    // app may not exist or machines already gone
  }

  await flyRequest(`/apps/${appName}`, { method: "DELETE" });
}
