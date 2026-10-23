# SOIPS Dependency Modeller

**[Open the hosted application](https://potaslab.github.io/soips-dependency-modeller/)**

Run `npm run build` locally to produce `dist/SOIPS-Dependency-Modeller.html`, then open that file directly in a browser. It embeds the application and reference model, so using the built file requires no installation, account, server or network. Keep a copy anywhere on your computer, or share it alongside your model JSON. `dist/index.html` is the equivalent static-hosting output. These generated files are excluded from Git and are not hosted downloads in this source repository; follow Development and verification below to build them from a source checkout.

The software originates in the Self-Organising Information-Processing Systems Hypothesis — **J. R. Potas (2026)**. Model authorship is separate from software attribution. The reference model cites *Rethinking Consciousness: The Self-Organising Information-Processing Systems Hypothesis*. Its publication link remains pending.

## Licence and citation

Application source code is licensed under the [MIT Licence](LICENSE), copyright (c) 2026 J. R. Potas. The SOIPS reference JSON at `src/models/soips-reference.json` and `models/soips-potas2026-figure2.json`, together with `docs/SCIENTIFIC_MODEL.md`, is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode); see [LICENSE-DATA](LICENSE-DATA) for the exact scope. J. R. Potas (2026) is the original model author. MIT does not apply to these scientific materials, including copies embedded in the application. Commercial use, modification and redistribution are permitted under the respective licence terms; applicable third-party licences and notices remain in force.

Derivative SOIPS models should retain source attribution and licence information and indicate modifications in accordance with CC BY 4.0. Independently created models retain their own authorship and may specify their own licences. These repository licences do not license the manuscript, supplementary audit or published figures outside the identified repository content.

Provisional citation: Potas, J. R. (2026). *Rethinking Consciousness: The Self-Organising Information-Processing Systems Hypothesis*. No DOI, journal publication date or final citation is supplied.

The application is an exploratory dependency-modelling tool. Its analysis reports consequences of the dependencies specified in a model; it does not independently validate those scientific assumptions.

## First steps

1. The immutable SOIPS reference opens in **Explore**. Select any box, or choose an analysis target. **Trace connections** follows all alternatives; **Calculate minimal configurations** finds the smallest valid node sets. **Show extended / supporting contributors** includes optional supports.
2. **Edit** asks to create a working copy. In the Nodes section, select an item or add one. Change its name, category, description, diagram label, notes or position, then **Save changes**. Category, metadata and relation forms have their own save buttons.
3. Select a node in Edit to see **Relationships for [node]**, directly below the node list. Use **Depends on** for its contributors or **Used by** for nodes that use it. Search for the other node, select the new-link type and check its box to add the link. Uncheck an existing link to remove it after reviewing the consequences. The list stays on the selected node and direction. Changes apply immediately; **Save JSON** downloads them.
4. Different relation types/groups between the same pair have separate boxes, so removing one does not silently remove the others. Rechecking a removed record during the current editing session restores its ID, type, evidence, group and context. Undo/Redo also works. Unchecked records are omitted from saved JSON; reopening a file starts a new session. **Edit relation** opens its detailed form, including a **Delete relation** action. The original **Add dependency / Add relationship** forms remain available.
5. Alternative relations must have a group ID. Each group is independently required. `Required through provider` needs the provider node and a provider-to-contributor defining/supporting relation. Participation needs activation nodes and a description of the specific relationship being assumed. New provider/participation links open the detailed form with both endpoints already selected.
6. Save with **Save JSON**. Browser downloads contain the complete editable model, evidence, provenance and layout. Reopen using **Open JSON**. **Export SVG** downloads a standalone vector diagram of the current view, including faded context, labels, legend and optional credit.

For a completely unrelated example: choose **New blank model**, then **Edit**. Create the category “Machine parts”. Add “Working machine” and “Power supply”. Select Working machine, add a defining dependency on Power supply, then calculate its minimum: two nodes. Set your own authors and citation under Model information. No SOIPS categories or scientific assumptions are added to a blank model.

Drag nodes in Edit, or enter coordinates in their form. Dropping a node selects it and updates its X/Y fields automatically; Save JSON retains the new layout. Auto arrange repositions all nodes by category and can be undone. Zoom/Fit and graph scrolling handle larger models. Node boxes work with Enter/Space; position fields provide a keyboard alternative to dragging. Undo/Redo also works with Ctrl/Cmd+Z outside text fields.

The unsaved indicator tracks changes to the model. Saving a form updates the working model in memory; **Save JSON** is the explicit download checkpoint. New/Open/Reference/navigation warn before discarding unsaved edits. There is no automatic browser-storage backup. Browsers may independently ask where to save downloads.

## Contributing models

Contributions are welcome: alternative interpretations, models of other capabilities or systems, and models that challenge the SOIPS reference's assumptions.

To develop a model, open the [interactive application](https://potaslab.github.io/soips-dependency-modeller/), modify the reference model or create a new model, and export it using **Save JSON**.

Discuss scientific proposals through [GitHub Discussions](https://github.com/potaslab/soips-dependency-modeller/discussions), then submit completed models to [`models/contributed/`](models/contributed/) by pull request. Browse the [model catalogue](models/README.md) for the reference and community collection.

See [Contributing guidelines](CONTRIBUTING.md) for submission instructions, documentation requirements and model attribution.

Community-contributed models retain their authorship and are identified separately from the original SOIPS Figure 2 reference. Inclusion in the repository does not constitute independent scientific validation or endorsement of a model's assumptions.

## Development and verification

Use Node.js 22+ and npm. Run commands from the standalone repository root:

```powershell
npm ci
npm run typecheck
npm test
npm run build
npm run dev
```

`npm run dev` invokes the build and serves at `http://127.0.0.1:4173`. The standalone distribution has no runtime fetch, external modules, fonts or assets.

Root `index.html` is a minimal source template, not the application distribution. The build requires exactly one `APP_STYLE` and one `APP_SCRIPT` insertion marker and fails if either is missing or duplicated. It embeds the current CSS, bundled TypeScript, canonical JSON and analysis worker into two byte-identical HTML outputs. Build-integrity tests modify isolated source copies to verify that changes reach the output. See [testing and verification](docs/TESTING.md) for coverage and verification scope.

For browser tests (one-time browser download uses the network):

```powershell
npx playwright install chromium firefox
npm run build
npm run test:browser
```

Browser tests run the built HTML directly through `file://` with networking disabled. Results, JSON/SVG downloads and application screenshots go to `test-results/`. The public tests use the bundled JSON and synthetic fixtures, with no external manuscript or prototype-file prerequisite. Builds use the checked-in reference model.

## Files and limits

Source is under `src/`: `models/` (schema, validation, portable JSON and frozen reference), `analysis/` (pure generic engine and background worker), `editor/` (forms, history and deletion operations), `view/` (layout and shared SVG renderer), `ui/` and `styles/`. Tests and build scripts are under `tests/` and `scripts/`.

See the [model format](docs/MODEL_FORMAT.md), [scientific provenance and interpretation](docs/SCIENTIFIC_MODEL.md), [testing and verification](docs/TESTING.md) and [dependency notices](docs/THIRD_PARTY.md). The [downloadable SOIPS JSON](models/soips-potas2026-figure2.json) is retained alongside the bundled canonical reference.

Exact search defaults to 50,000 states, 1,000 configurations and 1,500 ms in a background worker. Limits can be edited, with ceilings of 1,000,000 states, 10,000 configurations and 5,000 ms. Any truncated search explicitly says **Exact minimum not completed**; listed sets are candidates. Cyclic mandatory dependencies block exact results. Imports are limited to 5 MB, 2,000 nodes, 20,000 relations and 500 categories. These are safety limits, not performance guarantees at those sizes.

Layout is a deterministic category grid with saved coordinates, not an obstacle-avoiding diagram router; dense graphs can have crossings. Safari and native macOS/Linux browsers were not available for verification. Account/cloud collaboration, native executables, PNG/PDF export and automatic empirical inference are outside this release.
