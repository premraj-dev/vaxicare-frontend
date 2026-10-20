import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { randomInt } from "node:crypto";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";
import { loadEnv } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";

// =============================================================================
// Manus Debug Collector - Vite Plugin
// Writes browser logs directly to files, trimmed when exceeding size limit
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024; // 1MB per log file
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6); // Trim to 60% to avoid constant re-trimming

type LogSource = "browserConsole" | "networkRequests" | "sessionReplay";

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines: string[] = [];
    let keptBytes = 0;

    // Keep newest lines (from end) that fit within 60% of maxSize
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    /* ignore trim errors */
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (entries.length === 0) return;

  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);

  // Format entries with timestamps
  const lines = entries.map((entry) => {
    const ts = new Date().toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });

  // Append to log file
  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  // Trim if exceeds max size
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

/**
 * Vite plugin to collect browser debug logs
 * - POST /__manus__/logs: Browser sends logs, written directly to files
 * - Files: browserConsole.log, networkRequests.log, sessionReplay.log
 * - Auto-trimmed when exceeding 1MB (keeps newest entries)
 */
function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      // POST /__manus__/logs: Browser sends logs (written directly to files)
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }

        const handlePayload = (payload: any) => {
          // Write logs directly to files
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };

        const reqBody = (req as { body?: unknown }).body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }

        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

type LocalOtpEntry = {
          code: string;
          expiresAt: number;
        };

function vitePluginLocalEmailOtp(): Plugin {
  const otpStore = new Map<string, LocalOtpEntry>();
  const env = {
    ...loadEnv("production", PROJECT_ROOT, ""),
    ...loadEnv("development", PROJECT_ROOT, ""),
    ...process.env,
  };
  const resendApiKey = env.VAXI_RESEND || process.env.VAXI_RESEND;
  const fromEmail = env.VAXI_FROM_EMAIL || process.env.VAXI_FROM_EMAIL || "VaxiCare <onboarding@premrajumap.dev>";

  async function readJson(req: import("node:http").IncomingMessage) {
    let body = "";
    for await (const chunk of req) body += chunk.toString();
    return JSON.parse(body) as Record<string, unknown>;
  }

  function sendJson(res: import("node:http").ServerResponse, status: number, payload: unknown) {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(payload));
  }

  return {
    name: "local-email-otp",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/auth/otp/send", async (req, res, next) => {
        if (req.method !== "POST") return next();

        try {
          const body = await readJson(req);
          const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          if (!email || !email.includes("@")) {
            sendJson(res, 400, { detail: "A valid email address is required." });
            return;
          }

          const code = String(randomInt(100000, 1000000));
          otpStore.set(email, { code, expiresAt: Date.now() + 10 * 60 * 1000 });

          console.log(`\n======================================================`);
          console.log(`🔑 [VaxiCare Local OTP] Code for ${email}: >>> ${code} <<<`);
          console.log(`======================================================\n`);

          if (!resendApiKey) {
            console.log(`[VaxiCare Local OTP] VAXI_RESEND not found. Using local console OTP.`);
            sendJson(res, 200, {
              sent: true,
              code,
              note: `Dev Mode OTP: ${code} (Console fallback)`
            });
            return;
          }

          try {
            const resendResponse = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${resendApiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                from: fromEmail,
                to: [email],
                subject: "Your VaxiCare verification code",
                text: `Your VaxiCare verification code is ${code}. It expires in 10 minutes.`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="margin-bottom: 20px;">
                      <span style="font-size: 22px; font-weight: 800; color: #064E3B;">VaxiCare</span>
                      <span style="font-size: 12px; color: #059669; margin-left: 8px; font-weight: 600; background: #ecfdf5; padding: 3px 8px; border-radius: 6px;">Child Immunisation</span>
                    </div>
                    <p style="font-size: 15px; color: #334155; margin-bottom: 20px; line-height: 1.5;">Here is your verification code to access your VaxiCare account:</p>
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
                      <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #064E3B; font-family: monospace;">${code}</span>
                    </div>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">This code expires in 10 minutes. If you did not request this, you can safely disregard this message.</p>
                  </div>
                `,
              }),
            });

            if (!resendResponse.ok) {
              const errorText = await resendResponse.text();
              console.warn(`[VaxiCare Local OTP] Resend API notice:`, errorText);

              // If Resend rejected because of domain or recipient restriction
              if (resendResponse.status === 403 || errorText.includes("testing emails to your own email address")) {
                sendJson(res, 200, {
                  sent: true,
                  code,
                  note: `Resend test restriction: code is ${code}`
                });
                return;
              }

              sendJson(res, resendResponse.status, { detail: `Resend error: ${errorText}` });
              return;
            }

            console.log(`✅ [VaxiCare Local OTP] Email successfully delivered to ${email} via Resend (${fromEmail}).`);
            sendJson(res, 200, { sent: true });
          } catch (netErr) {
            console.warn(`[VaxiCare Local OTP] Network error contacting Resend:`, netErr);
            sendJson(res, 200, {
              sent: true,
              code,
              note: `Resend unreachable. Dev code: ${code}`
            });
          }
        } catch (error) {
          sendJson(res, 400, { detail: error instanceof Error ? error.message : "Unable to send the verification email." });
        }
      });

      server.middlewares.use("/api/auth/login", async (req, res, next) => {
        if (req.method !== "POST") return next();

        try {
          const body = await readJson(req);
          const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
          const otp = typeof body.otp === "string" ? body.otp.trim() : "";
          const entry = otpStore.get(email);

          if (!email || !entry || entry.expiresAt < Date.now() || entry.code !== otp) {
            sendJson(res, 401, { detail: "The verification code is invalid or expired." });
            return;
          }

          otpStore.delete(email);
          sendJson(res, 200, {
            access_token: `local-email-session-${Date.now()}`,
            user_profile: { email, role: "parent" },
          });
        } catch (error) {
          sendJson(res, 400, { detail: error instanceof Error ? error.message : "Unable to verify the email code." });
        }
      });
    },
  };
}

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");
        if (!key) {
          res.writeHead(400, { "Content-Type": "text/plain" });
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          // Serve clean SVG fallback for images instead of 500
          res.writeHead(200, {
            "Content-Type": "image/svg+xml",
            "Cache-Control": "public, max-age=86400",
          });
          res.end(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48">
            <rect width="48" height="48" rx="12" fill="#064E3B"/>
            <path d="M24 10C24 10 33 13 33 21C33 29 24 38 24 38C24 38 15 29 15 21C15 13 24 10 24 10Z" fill="#10B981"/>
            <path d="M24 17V31M17 24H31" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>
          </svg>`);
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", forgeBaseUrl + "/");
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: { Authorization: `Bearer ${forgeKey}` },
          });

          if (!forgeResp.ok) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };
          if (!url) {
            res.writeHead(502, { "Content-Type": "text/plain" });
            res.end("Empty signed URL");
            return;
          }

          res.writeHead(307, { Location: url, "Cache-Control": "no-store" });
          res.end();
        } catch {
          res.writeHead(502, { "Content-Type": "text/plain" });
          res.end("Storage proxy error");
        }
      });
    },
  };
}

const plugins = [
  react(),
  tailwindcss(),
  vitePluginManusRuntime(),
  vitePluginManusDebugCollector(),
  vitePluginStorageProxy(),
  vitePluginLocalEmailOtp(),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    strictPort: false, // Will find next available port if 3000 is busy
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
