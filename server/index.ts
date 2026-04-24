import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { serveStatic } from '@hono/node-server/serve-static';
import path from 'path';
import fs from 'fs';
import routes from './routes.js';

const app = new Hono();

// API routes
app.route('/', routes);

// Serve uploads
const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use('/uploads/*', serveStatic({ root: './' }));

// In production, serve static files from dist/
const distDir = path.resolve(process.cwd(), 'dist');
if (fs.existsSync(distDir)) {
  app.use('/*', serveStatic({ root: './dist' }));
  app.get('*', (c) => {
    const indexPath = path.join(distDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      return c.html(fs.readFileSync(indexPath, 'utf-8'));
    }
    return c.text('Not found', 404);
  });
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
serve({ fetch: app.fetch, port: PORT });
console.log(`Server running at http://localhost:${PORT}`);
