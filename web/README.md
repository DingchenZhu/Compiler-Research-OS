# Compiler Research OS Web

Local-first read-only dashboard for Compiler Research OS.

The Markdown repository remains the source of truth. This web app reads a generated JSON index and visualizes notes, links, experiments, papers, source reading, research ideas, and knowledge nodes.

## Generate Index

From the repository root:

```bash
node web/scripts/build-index.mjs
```

This creates:

```text
web/public/os-index.json
```

## Run Locally

From the repository root:

```bash
python3 -m http.server 4173 -d web
```

Then open:

```text
http://localhost:4173
```

## Design

- No database.
- No web service dependency.
- No hidden state.
- Markdown/YAML/wikilinks remain the source of truth.
- The web app is a visualization and navigation layer.

## Views

- `Overview`: visible research content, active ideas, experiments, and type distribution
- `Knowledge Graph`: interactive node/link map
- `Threads`: research idea -> paper/source/experiment/knowledge paths
- `Research`: ideas grouped by maturity
- `Experiments`: experiment status, readiness, and reproducibility checklist progress
- `Papers`: paper notes grouped by status
- `Source Reading`: source notes grouped by system
- `Weekly`: recent daily logs, active ideas, incomplete experiments, and weekly review prompt
- `Quality`: broken links, orphan nodes, low-connectivity research nodes, and hidden system notes

By default, system notes are hidden from the main research dashboard:

- README files
- templates
- agent prompts
- skills
- experiment artifacts such as `analysis.md` and `summary.md`

Use `Show system notes` to inspect them.

## Health Signals

The index builder computes lightweight quality signals:

- `experimentHealth`: checks for metadata, run script, analysis, summary, inputs, config, environment, and raw results
- `ideaHealth`: checks for required idea sections and links to paper, source reading, experiment, and knowledge nodes
- `checklist`: parses Markdown checkboxes and computes completion progress

These signals are heuristic. Markdown remains the source of truth.
