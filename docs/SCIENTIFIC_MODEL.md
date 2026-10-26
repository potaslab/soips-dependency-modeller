# Bundled SOIPS reference model

The canonical [SOIPS JSON reference](../src/models/soips-reference.json) represents the Figure 2 dependency model accompanying J. R. Potas (2026), *Rethinking Consciousness: The Self-Organising Information-Processing Systems Hypothesis*. PsyArXiv (preprint, version 1). [https://doi.org/10.31234/osf.io/jv4ah_v1](https://doi.org/10.31234/osf.io/jv4ah_v1). Its scientific sources are Tables 1–3, §5 and Supplementary S1, especially the element definitions, S1.9 configurations, S1.10 sensitivity scenarios and S1.11 relationship audit.

The two identified SOIPS reference JSON files and this document are licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/legalcode), copyright (c) 2026 J. R. Potas, the original model author. See [LICENSE-DATA](../LICENSE-DATA) for scope and attribution requirements. This licence does not apply to external manuscript, supplementary audit or published figure files. Application source code is separately licensed under [MIT](../LICENSE).

The reference has **28 elements and 90 relationships**. The original explorer supplied node IDs, descriptions, diagram labels and coordinates; Supplementary S1.11 supplied relationship Basis text and source-type provenance. The full A4 name is “Context-sensitive informational organisation”; its shorter diagram label is retained. Source notes, evidence and explicit `[JC]` modelling-judgement markers remain in the JSON. The reference is immutable in the application; editing creates a separately identified working copy with source attribution preserved. A [downloadable JSON copy](../models/soips-potas2026-figure2.json) is also provided.

## Relationship semantics

Relations point from the element being investigated to its contributor. See [the model format](MODEL_FORMAT.md) for schema and algorithm details.

| Kind | Reference count | Meaning |
|---|---:|---|
| `defining` | 29 | Including the source requires the contributor within this model. |
| `oneOf` | 8 | At least one contributor from each independently required alternative group. Shared contributors count once. |
| `supports` | 43 | Optional support; does not force inclusion in a minimum configuration. |
| `requiredVia` | 5 | Requires both the contributor and a named provider with a direct unconditional defining/supports link supplying it. |
| `canBuildOn` | 4 | Illustrative possibility; excluded from minimum obligations and expanded closure. |
| `participation` | 1 | An explicitly assumed relationship activated by a stated context, requiring both endpoints. |

All these classifications belong to an **interpretive scientific model**. “Defining” describes necessity under its encoded assumptions; it does not establish experimental necessity or sufficiency. Table 3 maps possible contributors rather than necessary-and-sufficient biological recipes. Exclusion from a configuration does not establish physical impossibility.

## Interpretation decisions and caveats

- **Contextual participation:** `FCOG → AWA` is active under `CON`, expressing awareness-related information participating in flexible cognition. Flexible cognition alone is not made awareness-dependent. Including both endpoints assumes the stated participation; it does not demonstrate actual participation or experience.
- **Mediated requirements:** the contributor operation is `to`, and its supplying form is `via`. Both are required. The provider-supply validation formalizes the model's structural rule and does not prove physical mediation from co-presence.
- **Illustrative links:** the fourth build-on link, `A4 → A2`, is also conditional on `CON`. All four build-on links remain illustrative. No compulsory A1 → A2 → A3 → A4 developmental sequence is inferred.
- **Evidence fidelity:** the relationship audit's complete Basis text is retained. The judgement flag follows each row's explicit `[JC]` marker; unmarked wording is not promoted to an additional judgement.
- **Alternative interpretations:** the reference preserves the stated default reading. Sensitivity fixtures change copies, including optional A4, alternative inference/retention requirements, and mapping awareness's response alternative to agency rather than regulation.
- **Elementary cognition:** the “representations or inferred relationships” sensitivity fixture adds an A2-or-B2 information group independently of the existing inference-or-regulation functional group. Supplementary S1 does not uniquely formalize that alternative reading. This named interpretation reproduces the reported unchanged consciousness result and remains subject to author review.

## Expected scientific regressions

For `CON`, exact analysis returns **three minimum-cardinality configurations of 12 elements**. These are the smallest configurations, not an enumeration of all inclusion-minimal sets. Each contains the nine-element common core:

`CON, FCOG, AWA, A2, A4, RA, TF, GF, RO`

The three respective additions are:

1. `MON, B2, CI` (Figure 2A).
2. `MON, LEA, B1`.
3. `EVA, B2, CI`.

Expanded closure follows defining, all alternatives, required-through, supports and active participation to a fixed point. It contains **25 elements**, excluding `AGE`, `PLA` and `PRE`. A trace containing all alternatives is not itself one valid minimum configuration.

| S1.10 sensitivity fixture | Minimum size | Tied minima | Expanded size |
|---|---:|---:|---:|
| Inference requires relational models (A3) | 12 | 1 | 25 |
| Regulation without necessary transmission | 12 | 5 | 25 |
| Monitoring requires retention | 12 | 2 | 25 |
| Flexible cognition requires elementary cognition | 13 | 2 | 25 |
| A4 requires relational models | 13 | 2 | 25 |
| A4 optional for flexible cognition | 9 | 3 | 25 |
| Awareness response mapped to agency | 12 | 3 | 28 |
| Perception requires inference | 12 | 3 | 25 |
| Elementary cognition alternative information group | 12 | 3 | 25 |

These checks verify reproducible consequences of the encoded model. They do not experimentally validate the relationships, empirical capability or phenomenal experience. Search limits and unresolved mandatory cycles prevent an exact claim when applicable; incomplete candidate lists are explicitly labelled. See [testing](TESTING.md) for verification scope.
