// Next.js proxy: gates every request (pages and /api/chat) behind a
// Cloudflare Turnstile challenge.
//
// Required env vars (Vercel > Settings > Environment Variables, or .env.local):
//   TURNSTILE_SITE_KEY    public site key
//   TURNSTILE_SECRET_KEY  secret key (also used to sign the pass cookie)
import { NextResponse, type NextRequest } from "next/server";

const SITE_KEY = process.env.TURNSTILE_SITE_KEY ?? "";
const SECRET_KEY = process.env.TURNSTILE_SECRET_KEY ?? "";

const COOKIE = "ts_pass";
const VERIFY_PATH = "/__turnstile";
const PASS_SECONDS = 60 * 60 * 12; // how long a solved challenge stays valid
const enc = new TextEncoder();

async function hmac(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(msg));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

async function hasValidPass(request: NextRequest, secret: string): Promise<boolean> {
  const raw = request.headers.get("Cookie")?.split(";").map((c) => c.trim()).find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return false;
  const [exp, sig] = raw.slice(COOKIE.length + 1).split(".");
  if (!exp || !sig || !(Number(exp) > Date.now() / 1000)) return false;
  return safeEqual(sig, await hmac(secret, exp));
}

// Only allow same-site relative paths as the post-challenge redirect target.
function safeNext(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : "/";
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function challengePage(siteKey: string, next: string, failed: boolean): Response {
  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex"><title>Verifying you are human</title>
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer></script>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;font-family:system-ui,sans-serif;background:#1a0a0c;color:#e8eefc;text-align:center}
p{margin:0 0 1rem}.err{color:#ff9b9b}</style></head>
<body><form method="POST" action="${VERIFY_PATH}" id="f">
<p>${failed ? '<span class="err">Verification failed, please try again.</span>' : "Checking that you are human…"}</p>
<input type="hidden" name="next" value="${esc(next)}">
<div class="cf-turnstile" data-sitekey="${esc(siteKey)}" data-callback="done"></div>
<noscript><p>JavaScript is required to continue.</p></noscript>
</form><script>function done(){document.getElementById("f").submit()}</script></body></html>`;
  return new NextResponse(html, { status: 403, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}

export async function proxy(request: NextRequest) {
  // Fail closed if the keys are missing rather than silently serving the site.
  if (!SITE_KEY || !SECRET_KEY) return new NextResponse("Turnstile is not configured.", { status: 500 });
  const url = request.nextUrl;

  if (request.method === "POST" && url.pathname === VERIFY_PATH) {
    const form = await request.formData();
    const token = form.get("cf-turnstile-response");
    const target = safeNext(String(form.get("next") ?? "/"));

    let ok = false;
    if (typeof token === "string" && token) {
      const body = new FormData();
      body.set("secret", SECRET_KEY);
      body.set("response", token);
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
      if (ip) body.set("remoteip", ip);
      const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body });
      ok = res.ok && ((await res.json()) as { success?: boolean }).success === true;
    }

    if (!ok) return challengePage(SITE_KEY, target, true);

    const exp = String(Math.floor(Date.now() / 1000) + PASS_SECONDS);
    const cookie = `${COOKIE}=${exp}.${await hmac(SECRET_KEY, exp)}; Path=/; Max-Age=${PASS_SECONDS}; HttpOnly; Secure; SameSite=Lax`;
    const res = NextResponse.redirect(new URL(target, request.url), 303);
    res.headers.set("Set-Cookie", cookie);
    res.headers.set("Cache-Control", "no-store");
    return res;
  }

  if (await hasValidPass(request, SECRET_KEY)) return NextResponse.next();

  return challengePage(SITE_KEY, safeNext(url.pathname + url.search), false);
}

// Gate everything except Next's hashed build assets (no data in them).
export const config = { matcher: ["/((?!_next/static|_next/image).*)"] };
