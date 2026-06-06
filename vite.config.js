import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const localContent = {
  name: 'local-content',
  configureServer(server) {
    const contentRoot = path.resolve(process.cwd(), 'content');
    server.middlewares.use('/api/content', (req, res) => {
      const requested = decodeURIComponent((req.url || '').split('?')[0]);
      const filePath  = path.resolve(contentRoot, '.' + requested);
      if (filePath !== contentRoot && !filePath.startsWith(contentRoot + path.sep)) {
        res.statusCode = 403; res.end(); return;
      }
      if (!fs.existsSync(filePath)) { res.statusCode = 404; res.end(); return; }
      res.setHeader('Content-Type', path.extname(filePath) === '.json' ? 'application/json' : 'text/plain; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(fs.readFileSync(filePath));
    });

    const watcher = fs.watch(contentRoot, { recursive: true }, () => {
      server.ws.send({ type: 'full-reload' });
    });
    server.httpServer?.on('close', () => watcher.close());
  },
};

export default defineConfig({
  plugins: [react(), localContent],
})
