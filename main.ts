// Vice Panels — a GTA-style cover art maker, entered in make.fun's gta6-cover-art-01.
// The app itself is the plain static site in app/ (index.html and its ES modules, no build step,
// no network): it loads a person's photos, arranges them in multi-panel poster layouts with a
// colour grade and bold caption lettering, and exports PNG covers at the three common post
// sizes. This program is only the handoff: it copies app/ and screenshots/ from beside this
// file into the output directory and writes dossier.json there with the vendored make.fun
// library, byte for byte as the scorer rebuilds it.
//
// Serve the app locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outDir, 'app'), { recursive: true });
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier caps are the scorer's own (see the kit's gate): the text cap shapes the bytes,
// the rest refuse up front what the scorer would refuse anyway — over 4 screenshots or one
// over 256 KiB, over 993 files or 48 MiB under app/, or an app/ path over 1000 bytes.
writeFileSync(
  join(outDir, 'dossier.json'),
  buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
    app_path_max_bytes: 1000,
  }),
);
