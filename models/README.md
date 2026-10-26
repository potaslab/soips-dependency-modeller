# SOIPS Dependency Models

This directory contains machine-readable organisational dependency models that can be opened and analysed using the [SOIPS Dependency Modeller](https://potaslab.github.io/soips-dependency-modeller/).

Models describe proposed relationships among informational structures, functional capacities and composite capabilities. Their dependencies represent explicit modelling assumptions, not necessarily established empirical relationships.

## Original SOIPS reference model

| Model | Author | Description | Licence |
|---|---|---|---|
| [SOIPS consciousness — Figure 2](soips-potas2026-figure2.json) | J. R. Potas (2026) | Frozen reference model accompanying *Rethinking Consciousness: The Self-Organising Information-Processing Systems Hypothesis*. PsyArXiv (preprint, version 1). | [CC BY 4.0](../LICENSE-DATA) |

**Preprint DOI:** [https://doi.org/10.31234/osf.io/jv4ah_v1](https://doi.org/10.31234/osf.io/jv4ah_v1).

**Provenance:** Figure 2, Tables 1–3, §5 and Supplementary S1 of the preprint. Node definitions and layout came from the original explorer; relationship explanations and source-type provenance came from the S1.11 relationship audit. The JSON preserves evidence, source notes and explicit `[JC]` modelling-judgement markers. See the [scientific model notes](../docs/SCIENTIFIC_MODEL.md) for interpretation decisions and source details. This downloadable JSON is byte-identical to the [bundled canonical reference](../src/models/soips-reference.json).

**Documented analysis:** 28 elements and 90 relationships. For consciousness (`CON`), exact analysis gives three minimum-cardinality configurations of 12 elements and an expanded closure of 25 elements, excluding `AGE`, `PLA` and `PRE`. Both counts include the target `CON`. These are consequences of the encoded assumptions, not empirical thresholds for consciousness. The [scientific model notes](../docs/SCIENTIFIC_MODEL.md) list exact membership and nine sensitivity scenarios; [verification documentation](../docs/TESTING.md) describes their regression checks.

The frozen published reference is retained separately from community contributions, future modifications and extensions. Those models do not form part of the preprint's reference configuration.

## Community-contributed models

Community submissions are maintained in [`contributed/`](contributed/).

No community models have yet been accepted.

Future entries will identify the model's author, subject, version, licence and relationship to existing SOIPS models.

Contributions may include alternative models of consciousness, models of other composite capabilities, extensions to the SOIPS framework, cross-domain applications and competing organisational hypotheses.

## Using a model

Download a JSON file from this directory, open the [interactive modeller](https://potaslab.github.io/soips-dependency-modeller/), and use **Open JSON** to load it.

You can inspect the dependency structure, calculate configurations, trace relationships, modify assumptions and save your own version.

## Submitting a model

See the repository's [contribution guidelines](../CONTRIBUTING.md) for instructions on preparing and submitting models.

Each submitted model should identify its author, purpose, provenance, supporting evidence or rationale, modelling assumptions and licence. Derivatives of existing models must preserve the attribution and other requirements of the original licence.

Community models are independently authored scientific proposals; their inclusion does not establish empirical validity or endorsement by the original SOIPS author.

For the JSON structure and supported relationship types, see the [model format documentation](../docs/MODEL_FORMAT.md).
