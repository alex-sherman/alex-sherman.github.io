import { watch } from 'node:fs';
import { join } from 'node:path';

const PORT = 4321;
const clients = new Set<ReadableStreamDefaultController>();

async function runBuild() {
  const proc = Bun.spawn(['bun', 'run', 'build.tsx'], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  await proc.exited;
}

await runBuild();

let building = false;
let pending = false;

async function triggerBuild() {
  if (building) {
    pending = true;
    return;
  }
  building = true;
  try {
    do {
      pending = false;
      await runBuild();
    } while (pending);
    for (const client of clients) {
      client.enqueue('data: reload\n\n');
    }
  } finally {
    building = false;
  }
}

for (const dir of ['src', 'public']) {
  watch(dir, { recursive: true }, (_event, filename) => {
    if (!filename) return;
    triggerBuild();
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
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store',
        },
      });
    }

    return new Response(file, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  },
});

console.log(`Dev server running at http://localhost:${PORT}/`);
