import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const directory = await mkdtemp(join(tmpdir(), 'charpai-telemetry-test-'));
try {
  const output = join(directory, 'test.cjs');
  await build({ entryPoints: ['scripts/generation-telemetry.test.mjs'], bundle: true, platform: 'node', format: 'cjs', target: 'node22', outfile: output });
  execFileSync(process.execPath, [output], { stdio: 'inherit' });
} finally { await rm(directory, { recursive: true, force: true }); }
