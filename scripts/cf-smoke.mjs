/**
 * Starts the built Worker with `wrangler dev` and checks robots.txt.
 * Requires `npx opennextjs-cloudflare build` first. SITE_PUBLIC must stay unset.
 */
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = 8787;
const child = spawn(
  'npx',
  ['wrangler', 'dev', '--port', String(port), '--ip', '127.0.0.1', '--show-interactive-dev-session', 'false'],
  {
    stdio: ['ignore', 'pipe', 'pipe'],
    env: { ...process.env, WRANGLER_SEND_METRICS: 'false', SITE_PUBLIC: '' },
  }
);

let output = '';
child.stdout?.on('data', (chunk) => {
  output += chunk.toString();
});
child.stderr?.on('data', (chunk) => {
  output += chunk.toString();
});

const deadline = Date.now() + 120_000;
let ok = false;
let body = '';
while (Date.now() < deadline) {
  if (/Ready on|http:\/\/127\.0\.0\.1:8787/.test(output)) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/robots.txt`);
      body = await response.text();
      if (response.ok && /Disallow:\s*\//.test(body)) {
        ok = true;
        break;
      }
    } catch {
      // The process can print Ready before the socket accepts connections.
    }
  }
  if (child.exitCode !== null) break;
  await delay(1000);
}

child.kill('SIGTERM');
setTimeout(() => {
  try { child.kill('SIGKILL'); } catch { /* already gone */ }
}, 500);

if (!ok) {
  console.error(output.slice(-4000));
  console.error(body);
  process.exit(1);
}

console.log('wrangler dev served robots.txt with the noindex gate');
process.exit(0);
