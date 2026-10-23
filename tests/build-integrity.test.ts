import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repository = path.resolve(import.meta.dirname, '..');

function workspace(t: TestContext) {
  // Keep fixtures beneath this checkout so the copied build script resolves the
  // same installed esbuild. Only isolated copies are edited, never real sources.
  const outputs = path.join(repository, 'test-results');
  fs.mkdirSync(outputs, { recursive: true });
  const root = fs.mkdtempSync(path.join(outputs, 'build-integrity-'));
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(outputs));
    fs.rmSync(root, { recursive: true, force: true });
  });
  fs.mkdirSync(path.join(root, 'scripts'));
  fs.copyFileSync(path.join(repository, 'scripts/build.mjs'), path.join(root, 'scripts/build.mjs'));
  for (const name of ['index.html', 'tsconfig.json', 'LICENSE', 'LICENSE-DATA']) {
    fs.copyFileSync(path.join(repository, name), path.join(root, name));
  }
  fs.cpSync(path.join(repository, 'src'), path.join(root, 'src'), { recursive: true });
  return {
    root,
    build: () => spawnSync(process.execPath, [path.join(root, 'scripts/build.mjs')], {
      cwd: root, encoding: 'utf8', timeout: 30_000,
    }),
    html: () => {
      const hosted = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
      assert.equal(fs.readFileSync(path.join(root, 'dist/SOIPS-Dependency-Modeller.html'), 'utf8'), hosted);
      return hosted;
    },
  };
}

test('Build incorporates current TypeScript, CSS, reference JSON and worker into identical standalone outputs', t => {
  const app = workspace(t);
  const initial = app.build();
  assert.equal(initial.status, 0, initial.stderr || String(initial.error));
  const before = app.html();
  assert.ok(before.includes(`<style>${fs.readFileSync(path.join(app.root, 'src/styles/app.css'), 'utf8')}</style>`));
  assert.ok(before.includes('soips-figure2-2026'));
  assert.ok(before.includes(fs.readFileSync(path.join(app.root, 'LICENSE'), 'utf8')));
  assert.ok(before.includes(fs.readFileSync(path.join(app.root, 'LICENSE-DATA'), 'utf8')));
  assert.match(before, /new Worker\(/);
  assert.doesNotMatch(before, /<!-- APP_(STYLE|SCRIPT) -->|<script[^>]+src=|<link[^>]+href=/i);

  fs.appendFileSync(path.join(app.root, 'src/main.ts'), '\ndocument.documentElement.dataset.buildIntegrity = "BUILD_INTEGRITY_MAIN";\n');
  fs.appendFileSync(path.join(app.root, 'src/styles/app.css'), '\n:root { --build-integrity: "BUILD_INTEGRITY_CSS"; }\n');
  fs.appendFileSync(path.join(app.root, 'src/analysis/worker.ts'), '\nconsole.info("BUILD_INTEGRITY_WORKER");\n');
  const referenceFile = path.join(app.root, 'src/models/soips-reference.json');
  const reference = JSON.parse(fs.readFileSync(referenceFile, 'utf8'));
  reference.metadata.description = 'BUILD_INTEGRITY_JSON';
  fs.writeFileSync(referenceFile, JSON.stringify(reference));

  const rebuilt = app.build();
  assert.equal(rebuilt.status, 0, rebuilt.stderr || String(rebuilt.error));
  const after = app.html();
  assert.notEqual(after, before);
  for (const part of ['MAIN', 'CSS', 'WORKER', 'JSON']) {
    const sentinel = `BUILD_INTEGRITY_${part}`;
    assert.ok(!before.includes(sentinel));
    assert.ok(after.includes(sentinel), `${part} source change did not reach generated HTML`);
  }
});

for (const marker of ['<!-- APP_STYLE -->', '<!-- APP_SCRIPT -->']) {
  for (const count of [0, 2]) {
    test(`Build rejects ${marker} occurring ${count} times before writing output`, t => {
      const app = workspace(t);
      const file = path.join(app.root, 'index.html');
      const template = fs.readFileSync(file, 'utf8');
      fs.writeFileSync(file, template.replace(marker, count === 0 ? '' : `${marker}\n${marker}`));
      const result = app.build();
      assert.notEqual(result.status, 0);
      assert.ok(result.stderr.includes('Invalid HTML template'));
      assert.ok(result.stderr.includes(marker));
      assert.ok(result.stderr.includes(`found ${count}`));
      assert.ok(!fs.existsSync(path.join(app.root, 'dist')));
    });
  }
}
