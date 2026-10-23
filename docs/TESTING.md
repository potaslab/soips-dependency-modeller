# Testing and verification

Use Node.js 22+ and npm. Run commands from the standalone repository root:

```powershell
npm ci
npm run typecheck
npm test
```

The public suite uses the bundled reference JSON and synthetic fixtures. It does not require external manuscript files, archives, figures, a manuscript-protection hash manifest or the original explorer.

## Scientific regression coverage

`tests/soips-reference.test.ts` checks byte-identical canonical/downloadable JSON copies and the explicit CC BY 4.0 metadata, reference validation, lossless JSON round-trip, frozen canonical data, evidence/judgement fidelity, **28 nodes and 90 relationships**, the exact members of **three tied 12-element consciousness minima**, the **25-element expanded closure**, and all nine S1.10 sensitivity scenarios. Expected configurations and sensitivity results are listed in [the scientific model notes](SCIENTIFIC_MODEL.md).

These are tests of the encoded model and its implementation, not experimental confirmation of scientific relationships.

## Generic engine, editing and export coverage

- `tests/build-integrity.test.ts`: runs the actual build script in isolated source copies, checks identical distributions, and proves that TypeScript, CSS, reference JSON and worker changes reach the HTML. Four negative cases reject missing or duplicated style/script markers before output is written. The real scientific fixtures are not modified.
- `tests/configurations.test.ts`: independent alternative groups, shared prerequisites, provider obligations, context activation, optional versus mandatory links, cycles, invalid targets, explicit state/configuration caps, cache stability and a 100-node chain. An independent exhaustive subset oracle checks 30 small generated models.
- `tests/editor.test.ts`: undo/redo, saved/dirty state, category and node deletion, provider/context cleanup and deterministic layout persistence.
- `tests/io-validation.test.ts`: invalid imports, malformed optional fields, empty models, unknown extension fields, lossless JSON and working-copy provenance.
- `tests/svg-export.test.ts`: all reference nodes/edges, labels, legend and attribution, arbitrary positions, long labels, escaping and filter/credit options.

## Browser tests

Install browsers once (requires network access), then build and run both suites:

```powershell
npx playwright install chromium firefox
npm run build
npm run test:browser
```

Root `index.html` is a source template with exactly one `APP_STYLE` and one `APP_SCRIPT` marker. The build validates those markers before bundling and writes identical hosted/downloadable HTML with embedded CSS, current application code, canonical JSON and a Blob worker. Always rebuild before browser testing; the source template itself is not the distribution.

`tests/browser.ts` exercises the actual offline HTML in Chromium and Firefox using `file://`, networking disabled, and checks for remote requests and page errors. It covers reference preservation, calculated minima/closure, working copies, relationship edits and recalculation, JSON download/reopen, invalid imports, delete/undo, drag coordinates, blank unrelated models, citation editing, safe source-note formatting, a 100-node model and standalone SVG parsing/rendering. It also captures a mobile viewport; that capture is not a native-mobile-browser test.

`tests/relationships-browser.ts` checks both relationship directions, remove/cancel/restore behaviour, evidence/context preservation, independent pair records and alternative groups, provider validation and advanced-form endpoints. Application screenshots, JSON/SVG downloads and result files are generated under ignored `test-results/`.

The main browser suite also checks distribution equality, the generic footer/About wording, and an actual message returned by the embedded worker. Thus a fallback calculation alone cannot satisfy the worker check. HTTP(S) requests and page errors must remain absent.

## Verification record

| Scope | Status |
|---|---|
| Standalone housekeeping verification, 23 October 2026, Windows; Node.js 24.19.0, npm 11.17.0 | `npm run typecheck` passed; `npm test` passed all 29 public tests, including every scientific regression scenario. |
| Standalone build-pipeline repair, 24 October 2026, Windows; Node.js 24.19.0, npm 11.17.0 | Typecheck passed; all 34 tests passed; build produced two byte-identical 118,378-byte HTML files. Both browser suites passed in Chromium 156.0.8078.4 and Firefox 157.0 through offline `file://` execution, including real embedded-worker responses, requested footer/About wording and zero remote requests. |
| Standalone licensing update, 24 October 2026, Windows; Node.js 24.19.0, npm 11.17.0 | Typecheck passed; all 35 tests passed, including reference-copy synchronization and CC BY 4.0 metadata. Build produced two byte-identical 121,961-byte HTML files with licence notices. Both Chromium 156.0.8078.4 and Firefox 157.0 passed the offline workflows and relationship suite, including licence labels/URLs and zero remote requests. |
| Standalone fresh dependency installation | Not repeated during housekeeping or the build repair; existing installed dependencies used for checks. |
| Historical implementation QA, 22 October 2026 | Reported typecheck, build, offline browser workflows and 30 tests passing in the original development project. This included one private source-preservation test, which is excluded from the public suite. |

Historical browser QA reported Windows Chromium 156.0.8078.4 and Firefox 157.0, with networking disabled and zero remote requests. Those historical results are separate from the standalone repair verification above, which rebuilt the application and reran the workflows and relationship checks.

## Known limits and follow-up

Safari and native macOS/Linux browser environments remain unverified. Exact analysis is bounded: defaults are 50,000 states, 1,000 configurations and 1,500 ms; worker failure uses a reported 100 ms / 5,000-state fallback. Incomplete searches do not claim an exact minimum. Import ceilings are safety limits, not performance guarantees. Dense diagrams can have crossings and require scrolling or manual layout. Context logic supports positive `allOf` node-presence conditions; participation and mediation remain structural assumptions.

The downloadable `models/soips-potas2026-figure2.json` is retained and checked byte-for-byte against `src/models/soips-reference.json`. The build-integrity suite also verifies that both licence notices accompany the standalone HTML. A fresh dependency installation in a clean checkout has not been repeated during these repairs.
