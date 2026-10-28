import { createFileRoute } from '@tanstack/react-router';
import { readdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

const OWNER = 'instaboosterwesd';
const REPO = 'rahulwish';
const ROOT = process.cwd();

const EXCLUDE_DIRS = new Set([
  'node_modules',
  '.git',
  'dist',
  '.output',
  '.tanstack',
  '.lovable',
  '.wrangler',
  '.cache',
]);
const EXCLUDE_FILES = new Set(['.env', '.env.local', '.env.production', '.env.development']);

async function walk(dir: string, base: string, out: string[]): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.gitignore') {
      if (e.isDirectory() || EXCLUDE_FILES.has(e.name) || e.name.startsWith('.env')) continue;
    }
    const full = path.join(dir, e.name);
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (EXCLUDE_DIRS.has(e.name)) continue;
      await walk(full, rel, out);
    } else if (e.isFile()) {
      if (EXCLUDE_FILES.has(e.name)) continue;
      out.push(rel);
    }
  }
}

function blobSha(buf: Buffer): string {
  const header = Buffer.from(`blob ${buf.length}\0`);
  return createHash('sha1').update(Buffer.concat([header, buf])).digest('hex');
}

async function gh(token: string, method: string, p: string, body?: unknown) {
  const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}${p}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'lovable-push',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`GitHub ${method} ${p} -> ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

export const Route = createFileRoute('/api/public/push-github')({
  server: {
    handlers: {
      POST: async () => {
        try {
          const token = process.env.GITHUB_FINE_GRAINED_PERSONAL_ACCESS_TOKEN;
          if (!token) {
            return Response.json({ ok: false, error: 'Token secret missing' }, { status: 500 });
          }

          const repo = await gh(token, 'GET', '');
          const branch = repo.default_branch as string;
          const ref = await gh(token, 'GET', `/git/ref/heads/${branch}`);
          const headCommit = ref.object.sha as string;
          const treeRes = await gh(token, 'GET', `/git/trees/${headCommit}?recursive=1`);
          const remote = new Map<string, string>();
          for (const item of treeRes.tree ?? []) {
            if (item.type === 'blob') remote.set(item.path, item.sha);
          }

          const files: string[] = [];
          await walk(ROOT, '', files);

          const changed: { path: string; sha: string }[] = [];
          let skipped = 0;
          for (const rel of files) {
            const buf = await readFile(path.join(ROOT, rel));
            const local = blobSha(buf);
            if (remote.get(rel) === local) {
              skipped++;
              continue;
            }
            const blob = await gh(token, 'POST', '/git/blobs', {
              content: buf.toString('base64'),
              encoding: 'base64',
            });
            changed.push({ path: rel, sha: blob.sha });
          }

          if (changed.length === 0) {
            return Response.json({ ok: true, message: 'Repo already up to date', skipped });
          }

          const newTree = await gh(token, 'POST', '/git/trees', {
            base_tree: headCommit,
            tree: changed.map((c) => ({
              path: c.path,
              mode: '100644',
              type: 'blob',
              sha: c.sha,
            })),
          });
          const commit = await gh(token, 'POST', '/git/commits', {
            message: 'Update from Lovable: Karwa Chauth template media, experience and customize page',
            tree: newTree.sha,
            parents: [headCommit],
          });
          await gh(token, 'PATCH', `/git/refs/heads/${branch}`, { sha: commit.sha });

          return Response.json({
            ok: true,
            branch,
            commit: commit.sha,
            pushed: changed.map((c) => c.path),
            skipped,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return Response.json({ ok: false, error: msg }, { status: 500 });
        }
      },
    },
  },
});
