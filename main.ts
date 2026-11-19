// Vice City Trophy Ledger — entrypoint (Node 22, standard library only).
// Copies app/ and screenshots/ from this repository into the output directory
// and writes /output/dossier.json with buildDossier from vendor/makefun-frontend.ts.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output.
// The run is deterministic: the same repository writes the same bytes every time.
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';

function main() {
  const appDir = join(repoRoot, 'app');
  const shotsDir = join(repoRoot, 'screenshots');
  if (!existsSync(appDir)) throw new Error('app/ is missing from the repository');
  if (!existsSync(shotsDir)) throw new Error('screenshots/ is missing from the repository');
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });
  cpSync(appDir, join(outDir, 'app'), { recursive: true });
  cpSync(shotsDir, join(outDir, 'screenshots'), { recursive: true });
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  // Verify the handoff: the dossier must parse, and building it a second time
  // from the same output directory must produce byte-identical bytes.
  const parsed = JSON.parse(new TextDecoder('utf-8').decode(dossier));
  if (parsed.schema !== 'makefun/dossier/v1') throw new Error('dossier.json has the wrong schema: ' + String(parsed.schema));
  const rebuilt = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  });
  if (Buffer.compare(Buffer.from(rebuilt), Buffer.from(dossier)) !== 0) throw new Error('dossier.json is not reproducible: a second build differs');
  console.log('verified dossier.json: schema ' + parsed.schema + ', reproducible across builds');
  console.log('wrote ' + join(outDir, 'dossier.json') + ' (' + dossier.length + ' bytes)');
}

main();
