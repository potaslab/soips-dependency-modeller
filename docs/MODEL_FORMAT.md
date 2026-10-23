# Model format 1.0.0

The portable JSON document is the scientific source of truth. See [model.schema.json](../src/models/model.schema.json) for structural JSON Schema and [schema.ts](../src/models/schema.ts) for runtime validation, including graph constraints not expressible through that schema. Unknown extension fields are retained on JSON round-trip. Unsupported schema versions are rejected; there is no implicit migration.

Required top-level fields: `schemaVersion`, stable `modelId`, `metadata`, `categories`, `nodes`, `relations`, and `view`. Metadata contains title, author strings, version and description, with optional year, citation, source URL, licence, timestamps, research-ready flag, modification notes and provenance. The working-copy action preserves source citation/provenance while allocating a distinct model ID. No licence or publication status is inferred.

The bundled SOIPS reference explicitly sets `metadata.licence` to `CC BY 4.0`; [LICENSE-DATA](../LICENSE-DATA) identifies the licensed scientific files. Independently authored models may specify their own licences. The application's MIT software licence does not assign a licence to user-created model data.

Categories have stable IDs, labels, descriptions, six-digit hex colours and numeric order; optional fill/band/labelSpace affect only rendering. Nodes have stable IDs, full labels, descriptions, category IDs and order, with optional short diagram labels, short codes, notes, references, widths/heights and positions. A position is `{x, y}` in drawing units: horizontal centre and top edge. Graph bounds expand to include all node boxes; render-only margins accommodate boxes near the canvas origin. IDs do not change on rename. Category membership has no logical effect.

Relations always point **from the element under investigation to its contributor**. Every record has an ID, `from`, `to`, `kind`, `explanation`, `evidence` array, and `judgement` boolean. `judgement: true` identifies a modelling decision, displayed as `[JC]`. The reference retains the exact S1.11 Basis wording (including JC markers), plus the source relation type in provenance. `evidence` can contain citation strings, URLs or manuscript locations; imported text is never executed as markup/code.

| Kind | Logical rule |
|---|---|
| `defining` | Included source implies included contributor. |
| `oneOf` | Included source requires at least one target from **each** named `groupId`, scoped to that source. Groups may share a contributor. All members of a group have the same activation condition. |
| `requiredVia` | Included source implies **both** `via` provider and contributor. The provider must have an unconditional defining/supports link directly supplying that contributor. This checks model structure, not physical implementation. |
| `supports` | Optional; does not enlarge a minimum. |
| `canBuildOn` | Illustrative; does not enlarge a minimum or expanded closure. Display arrows point from potential contributor to the form it could build. |
| `participation` | When its explicit context condition is satisfied, requires both endpoints and records the stated relationship as an assumption. Mere co-presence does not demonstrate participation. Requires nonempty `context` text and `condition`. |

Any relation can have `condition: {"allOf": ["context-node-id", ...]}`. Conditions are positive node-presence tests. For ordinary relations, both the source and condition must be present to activate the rule. For participation, the context condition itself activates both endpoints. Conditions cannot contain arbitrary formulas, negation or executable code. This restricted monotone vocabulary enables generic exact enumeration. A conditional illustrative link never introduces an obligation.

The SOIPS participation record is `FCOG → AWA`, active under `CON`; the conditional `A4 → A2` illustrative arc has the same context. Flexible cognition alone therefore does not require awareness. Required-through records use the operation as `to` and the supplying A form as `via`.

Exact search closes mandatory/mediated/contextual requirements, branches on unsatisfied one-of groups, memoises selected sets and prunes sets larger than the best candidate. It enumerates **minimum-cardinality** configurations, not all inclusion-minimal sets. A shared contributor can satisfy several groups without being counted twice. A state/configuration/time cap produces `exact: false`, `minimumSize: null` and explicitly labelled candidate sets; it never silently truncates an exact result. Unconditional defining/required-through cycles are validation errors. Activated conditional mandatory cycles also block an exact claim; optional cycles do not. One-of recursion is handled by finite-set search and is not automatically classified as a mandatory cycle.

Forward traces include all alternatives of enabled kinds and are not configurations. Expanded closure follows defining, oneOf, requiredVia, supports and contextual participation to a fixed point; it excludes illustrative links. Reverse “Used by” is a **potential-use trace**, including context/provider references; it does not prove that every context can activate together.

`view` contains optional default root, visible relationship types, zoom and export-credit choice. View settings and category/label/layout edits do not alter logical results. `analysisSettings` holds resource limits, never precomputed minima. The UI caches unchanged semantic requests and performs exact search in an embedded Blob worker. If a browser blocks workers, a reduced 100 ms / 5,000-state fallback is reported explicitly. Deletion previews use that short budget too and report unavailable/incomplete results when appropriate.

Validation rejects duplicate IDs, missing references, malformed alternative groups, impossible providers, invalid conditions, invalid coordinates/colours and unknown relation kinds. Empty models/categories are valid. Invalid imports leave the current document intact. The research-ready flag adds warnings for defining assumptions without explanation or evidence. JSON syntax errors and supported-schema errors are shown before replacement.
