# Contributing

Scientific model contributions are welcome, including alternative interpretations and challenges to the SOIPS reference. Repository inclusion records a contribution; it does not establish scientific validity or endorse its assumptions.

## Develop and discuss a model

1. Open the [hosted modeller](https://potaslab.github.io/soips-dependency-modeller/). Choose **New blank model** for an independently authored model, or **Edit** to create a working copy of an existing model.
2. Add or revise nodes and relationships. Use **Model information & analysis limits** to set authors, title, version, description, citation, source URL, licence and modification notes. Save each edited form.
3. Explain the proposed dependencies, alternatives and context conditions. Distinguish evidence from interpretive assumptions; use relationship explanations, evidence and judgement markers. See the [model format](docs/MODEL_FORMAT.md) for semantics and limits.
4. Discuss scientific proposals, assumptions and unresolved questions through [GitHub Discussions](https://github.com/potaslab/soips-dependency-modeller/discussions). Link the discussion in your eventual pull request; early discussion is welcome before the model is complete.

The [README](README.md) also explains how to build and use the application offline.

## Export and validate

- Use **Save JSON** to download the complete model, then reopen the exported file with **Open JSON**. Import checks JSON syntax, schema and graph constraints; resolve errors and review any displayed warnings. The [JSON Schema](src/models/model.schema.json) describes structure, but schema validation alone does not check all graph rules.
- Check that authorship, references, provenance, licence, relationships and layout survived the round trip. The research-ready option adds warnings about missing justification; it is not a scientific certification.
- For the intended analysis targets, run **Calculate minimal configurations** and **Show extended / supporting contributors**. Record target IDs, search limits, results and any warnings. Label incomplete searches as candidates rather than exact minima; explain any unresolved limits or cycles. Include expected results when available.

These checks establish that the submitted file loads and behaves as documented. Scientific claims require their own evidence and argument.

## Submit by pull request

1. Fork the [repository](https://github.com/potaslab/soips-dependency-modeller), clone your fork and create a branch.
2. Place the exported JSON in [`models/contributed/`](models/contributed/), using a descriptive filename such as `surname-topic-v1.json`. Add a matching Markdown file, such as `surname-topic-v1.md`, containing:
   - Model title, version, authors and their contributions.
   - Purpose, scope and intended analysis targets.
   - References and the evidence or rationale for proposed dependencies.
   - Interpretive assumptions, limitations and open questions.
   - Provenance: source models or materials, their versions and the changes made; state explicitly if independently authored.
   - An explicit model licence with a link to its terms, and any third-party attribution or permissions. Match the JSON's `metadata.licence`; the software's MIT licence does not automatically license model data.
   - Validation steps, analysis results and a discussion link, if available.
3. Add an entry to the community section of the [model catalogue](models/README.md), linking the JSON and its accompanying notes and identifying author, subject, version, licence and relationship to existing models.
4. Open a pull request against the original repository. Describe the scientific proposal and complete the relevant parts of the PR template. Review may request clarification, supporting evidence or revisions.

## Attribution and the original reference

Derivatives of the SOIPS Figure 2 model must identify J. R. Potas (2026) and the source model, preserve source citation, provenance and applicable licence notices, and describe modifications. Follow [LICENSE-DATA](LICENSE-DATA) and the linked CC BY 4.0 terms; credit new contributors separately from the original author. The app's working-copy action retains source provenance, but you must complete authorship and modification notes.

Keep derivatives and independently authored models in `models/contributed/`. Do not replace `models/soips-potas2026-figure2.json` or `src/models/soips-reference.json` when proposing a community model. Independently authored models retain their own authorship and explicit licensing; identify them separately from the original manuscript reference.

## Software and documentation changes

Describe the problem, scope and relevant evidence in your pull request. Follow [Development and verification](README.md#development-and-verification) and the [testing guide](docs/TESTING.md): run typecheck, tests and build for software changes, plus browser checks when application behaviour changes. For documentation changes, check relative links and verify factual claims against their sources.
