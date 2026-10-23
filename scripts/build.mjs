import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
for (const marker of ['<!-- APP_STYLE -->', '<!-- APP_SCRIPT -->']) {
  const count = template.split(marker).length - 1;
  if (count !== 1) {
    throw new Error(`Invalid HTML template: index.html must contain exactly one ${marker}; found ${count}. Restore the source template before building.`);
  }
}

const options = {
  bundle: true,
  write: false,
  format: 'iife',
  target: ['chrome100', 'firefox100', 'safari15'],
  minify: true,
};
// Embed the worker's code as a string in the main bundle for offline Blob workers.
const worker = await build({ ...options, entryPoints: [path.join(root, 'src/analysis/worker.ts')] });
// The main entry imports the canonical JSON through src/models/io.ts.
const result = await build({
  ...options,
  entryPoints: [path.join(root, 'src/main.ts')],
  legalComments: 'inline',
  define: { __ANALYSIS_WORKER_SOURCE__: JSON.stringify(worker.outputFiles[0].text) },
});
const css = fs.readFileSync(path.join(root, 'src/styles/app.css'), 'utf8');
const js = result.outputFiles[0].text;
// Preserve licence notices when the standalone HTML is shared on its own.
const licenceNotice = ['LICENSE', 'LICENSE-DATA']
  .map(name => `${name}\n${fs.readFileSync(path.join(root, name), 'utf8')}`)
  .join('\n\n');
const insertions = {
  STYLE: `<style>${css}</style>`,
  SCRIPT: `<!--\n${licenceNotice}\n-->\n<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`,
};
// One pass prevents marker-like text inside inserted source from being replaced.
const html = template.replace(/<!-- APP_(STYLE|SCRIPT) -->/g, (_, kind) => insertions[kind]);
if (html === template) throw new Error('HTML assembly failed: application source was not inserted.');

fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
for (const name of ['index.html', 'SOIPS-Dependency-Modeller.html']) {
  fs.writeFileSync(path.join(root, 'dist', name), html);
}
console.log(`Built hosted dist/index.html and standalone dist/SOIPS-Dependency-Modeller.html (${Buffer.byteLength(html)} bytes each; no runtime dependencies).`);
