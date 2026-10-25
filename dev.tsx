import { watch } from 'node:fs';
import { join } from 'node:path';
import { buildSite } from './build';

const PORT = 4321;
const clients = new Set<ReadableStreamDefaultController>();

await buildSite();

for (const dir of ['src', 'public']) {
  watch(dir, { recursive: true }, async (_event, filename) => {
    if (!filename) return;
    try {
      await buildSite();
      for (const client of clients) {
        client.enqueue('data: reload\n\n');
      }
    } catch (err) {
      console.error('Build error:', err);
    }
  });
}

const LIVE_RELOAD_SCRIPT = `<script>
new EventSource('/__live_reload').onmessage = () => location.reload();
</script></body>`;

Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/__live_reload') {
      let ctrl: ReadableStreamDefaultController;
      const stream = new ReadableStream({
        start(controller) {
          ctrl = controller;
          clients.add(controller);
        },
        cancel() {
          clients.delete(ctrl);
        },
      });
      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    let pathname = url.pathname;
    if (pathname === '/') pathname = '/index.html';

    let file = Bun.file(join('dist', pathname));
    if (!(await file.exists()) && !pathname.endsWith('.html')) {
      file = Bun.file(join('dist', `${pathname}.html`));
    }

    if (!(await file.exists())) {
      return new Response('Not Found', { status: 404 });
    }

    if (file.type.includes('text/html')) {
      const html = await file.text();
      return new Response(html.replace('</body>', LIVE_RELOAD_SCRIPT), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    return new Response(file);
  },
});

console.log(`Dev server running at http://localhost:${PORT}/`);
