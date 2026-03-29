import { createReadStream, existsSync, statSync } from 'fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import { extname, join, normalize, resolve } from 'path'

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

/**
 * Serves a static directory on 127.0.0.1 with an ephemeral port (listen(0)).
 * Used for local screenshot capture without fixed-port collisions.
 */
export async function withEphemeralStaticSiteServer(
  rootDir: string,
  handler: (origin: string) => Promise<void>
): Promise<void> {
  const root = resolve(rootDir)

  const server = createServer((req: IncomingMessage, res: ServerResponse) => {
    if (!req.url) {
      res.statusCode = 400
      res.end()
      return
    }
    const pathname = decodeURIComponent(req.url.split('?')[0] || '/')
    const rel = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')
    if (rel.includes('..')) {
      res.statusCode = 403
      res.end()
      return
    }
    const filePath = join(root, rel)
    const normalized = normalize(filePath)
    if (!normalized.startsWith(root)) {
      res.statusCode = 403
      res.end()
      return
    }
    if (!existsSync(normalized) || !statSync(normalized).isFile()) {
      res.statusCode = 404
      res.end('Not found')
      return
    }
    const ext = extname(normalized).toLowerCase()
    res.setHeader('Content-Type', MIME[ext] || 'application/octet-stream')
    createReadStream(normalized).pipe(res)
  })

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(0, '127.0.0.1', () => {
      server.off('error', rejectListen)
      resolveListen()
    })
  })

  const addr = server.address()
  if (!addr || typeof addr === 'string') {
    await new Promise<void>((c) => server.close(() => c()))
    throw new Error('Could not bind ephemeral static server')
  }

  const origin = `http://127.0.0.1:${addr.port}`

  try {
    await handler(origin)
  } finally {
    await new Promise<void>((resolveClose) => server.close(() => resolveClose()))
  }
}
