import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from '@tailwindcss/vite';

// ─── Custom plugin: forward browser console → terminal ────────────────────────
function browserConsolePlugin(): Plugin {
    const ENDPOINT = '/__console';

    // ANSI colours
    const c = {
        reset: '\x1b[0m',
        gray: '\x1b[90m',
        yellow: '\x1b[33m',
        red: '\x1b[31m',
        cyan: '\x1b[36m',
        bold: '\x1b[1m',
    };

    const levelColor: Record<string, string> = {
        log: c.gray,
        info: c.cyan,
        warn: c.yellow,
        error: c.red,
    };

    // Client-side script injected into every HTML page
    const clientScript = `
<script type="module">
(function () {
  const LEVELS = ['log', 'info', 'warn', 'error', 'debug', 'table', 'group', 'groupEnd'];
  const orig = {};
  LEVELS.forEach(function (lvl) {
    orig[lvl] = console[lvl].bind(console);
    console[lvl] = function (...args) {
      orig[lvl](...args);
      try {
        const serialized = args.map(function (a) {
          try { return typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a); }
          catch { return String(a); }
        });
        fetch('${ENDPOINT}', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ level: lvl, args: serialized }),
        }).catch(function () {});
      } catch {}
    };
  });

  window.addEventListener('error', function (e) {
    fetch('${ENDPOINT}', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ level: 'error', args: [e.message + ' (' + e.filename + ':' + e.lineno + ')'] }),
    }).catch(function () {});
  });

  window.addEventListener('unhandledrejection', function (e) {
    fetch('${ENDPOINT}', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ level: 'error', args: ['Unhandled Promise Rejection: ' + String(e.reason)] }),
    }).catch(function () {});
  });
})();
</script>`;

    return {
        name: 'browser-console',
        apply: 'serve',

        // Inject script into HTML
        transformIndexHtml(html) {
            return html.replace('<head>', `<head>${clientScript}`);
        },

        // Handle POST from browser
        configureServer(server) {
            server.middlewares.use(ENDPOINT, (req, res) => {
                if (req.method !== 'POST') { res.end(); return; }

                let body = '';
                req.on('data', (chunk: Buffer) => { body += chunk.toString(); });
                req.on('end', () => {
                    try {
                        const { level, args } = JSON.parse(body) as { level: string; args: string[] };
                        const color = levelColor[level] ?? c.gray;
                        const prefix = `${c.bold}${color}[browser:${level}]${c.reset}`;
                        const msg = args.join(' ');
                        // Print to terminal
                        if (level === 'error') {
                            console.error(`${prefix} ${msg}`);
                        } else if (level === 'warn') {
                            console.warn(`${prefix} ${msg}`);
                        } else {
                            console.log(`${prefix} ${msg}`);
                        }
                    } catch { /* ignore malformed */ }
                    res.statusCode = 204;
                    res.end();
                });
            });
        },
    };
}

// ─── Vite config ──────────────────────────────────────────────────────────────
export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        browserConsolePlugin(),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        proxy: {
            // Proxy tất cả /api/v1/* → API Gateway, tránh CORS
            '/api/v1': {
                target: 'http://localhost:8888',
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
