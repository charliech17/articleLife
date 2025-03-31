import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr/node';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import { environment } from './src/shared/env/env';
import { Request, Response } from 'express-serve-static-core';
import QueryString from 'qs';

const basePath = environment.baseHref || '/';
const CSP =
  "default-src 'self';" +
  "script-src 'self' 'unsafe-inline';" +
  "frame-src 'self' https://www.facebook.com/ https://social-plugins.line.me/ https://www.youtube.com/ https://josh-lifesharing.com;" +
  "img-src * data: blob: 'unsafe-inline';" +
  "connect-src http: https:; style-src 'self' 'unsafe-inline';" +
  "frame-ancestors 'self' https://www.facebook.com/ https://social-plugins.line.me/ https://www.youtube.com/;object-src 'none'";
// The Express app is exported so that it can be used by serverless Functions.

export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => { });
  // Serve static files from /browser
  server.use(
    `${basePath}`,
    express.static(browserDistFolder, {
      maxAge: '1y',
      index: 'index.html',
    }),
  );

  // All regular routes use the Angular engine
  server.get(`${basePath}/*`, (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;
    setResHeaders(req, res);

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl.replace(basePath, '')}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then(html => res.send(html))
      .catch(err => next(err));
  });

  return server;
}

function setResHeaders(
  req: Request<{}, any, any, QueryString.ParsedQs, Record<string, any>>,
  res: Response<any, Record<string, any>, number>,
) {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=(), payment=() ');
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  res.setHeader('Access-Control-Allow-Headers', 'X-XSRF-TOKEN Content-Type');

  // Set ip address headers
  const xRealIp = req.headers['x-real-ip'];
  const xForwardedFor = req.headers['x-forwarded-for'];
  res.setHeader('X-Real-IP', xRealIp || '');
  res.setHeader('X-Forwarded-For', xForwardedFor || '');
}

function run(): void {
  const port = environment.port || 4200;

  // Start up the Node server
  const server = app();
  server.set('trust proxy', true);

  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}${basePath}`);
  });
}

run();
