#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../..");
const outPath = path.join(root, "web/public/os-index.json");
const ignoredDirs = new Set([".git", "web", "node_modules", ".venv", "venv", "__pycache__"]);
const wikilinkRe = /\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g;

function main() {
  const files = walk(root).filter((file) => file.endsWith(".md"));
  const rawNodes = files.map(readMarkdownNode);
  const resolver = buildResolver(rawNodes);
  const edges = [];

  for (const node of rawNodes) {
    for (const [edgeType, targets] of Object.entries(flattenRelated(node.related))) {
      for (const target of targets) {
        addResolvedEdge(edges, resolver, node, target, edgeType, "yaml");
      }
    }

    for (const target of node.wikilinks) {
      addResolvedEdge(edges, resolver, node, target, "wikilink", "wikilink");
    }
  }

  const dedupedEdges = uniqueEdges(edges);
  const incoming = countBy(dedupedEdges, (edge) => edge.target);
  const outgoing = countBy(dedupedEdges, (edge) => edge.source);
  const brokenLinks = dedupedEdges.filter((edge) => edge.unresolved);
  let nodes = rawNodes.map((node) => ({
    ...node,
    incoming: incoming[node.id] || 0,
    outgoing: outgoing[node.id] || 0,
  }));
  nodes = enrichNodes(nodes, dedupedEdges.filter((edge) => !edge.unresolved));

  const index = {
    generatedAt: new Date().toISOString(),
    root,
    nodes,
    edges: dedupedEdges.filter((edge) => !edge.unresolved),
    brokenLinks,
    stats: {
      nodes: nodes.length,
      edges: dedupedEdges.filter((edge) => !edge.unresolved).length,
      brokenLinks: brokenLinks.length,
      orphanNodes: nodes.filter((node) => !incoming[node.id] && !outgoing[node.id]).length,
    },
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  console.log(`Wrote ${path.relative(root, outPath)}`);
  console.log(`${index.stats.nodes} nodes, ${index.stats.edges} edges, ${index.stats.brokenLinks} broken links`);
}

function enrichNodes(nodes, edges) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return nodes.map((node) => {
    if (node.type === "experiment") {
      return {
        ...node,
        experimentHealth: experimentHealth(node),
      };
    }
    if (node.type === "research_idea") {
      return {
        ...node,
        ideaHealth: ideaHealth(node, nodes, edges, byId),
      };
    }
    return node;
  });
}

function experimentHealth(node) {
  const dir = path.dirname(path.join(root, node.path));
  const required = [
    ["metadata", "metadata.yaml"],
    ["runScript", "run.sh"],
    ["analysis", "analysis.md"],
    ["summary", "results/summary.md"],
    ["inputs", "inputs"],
    ["config", "configs/config.yaml"],
    ["env", "env.txt"],
    ["rawResult", "results/raw.csv", "results/raw.txt"],
  ];
  const checks = Object.fromEntries(
    required.map(([key, ...relativePaths]) => [
      key,
      relativePaths.some((relativePath) => fs.existsSync(path.join(dir, relativePath))),
    ]),
  );
  const done = Object.values(checks).filter(Boolean).length;
  const total = required.length;
  return {
    ...checks,
    done,
    total,
    score: total ? done / total : 0,
  };
}

function ideaHealth(node, nodes, edges, byId) {
  const connected = edges
    .filter((edge) => edge.source === node.id || edge.target === node.id)
    .map((edge) => byId.get(edge.source === node.id ? edge.target : edge.source))
    .filter(Boolean);
  const connectedTypes = new Set(connected.map((item) => item.type));
  const requiredSections = ["Observation", "Problem", "Hypothesis", "Related Work", "Minimal Experiment", "Next Action"];
  const sectionChecks = Object.fromEntries(
    requiredSections.map((section) => [section, Boolean(cleanPlainText(node.sections?.[section] || ""))]),
  );
  const relationChecks = {
    paper: connectedTypes.has("paper"),
    sourceReading: connectedTypes.has("source_reading"),
    experiment: connectedTypes.has("experiment"),
    knowledge: connectedTypes.has("knowledge_node"),
  };
  const checks = { ...sectionChecks, ...relationChecks };
  const done = Object.values(checks).filter(Boolean).length;
  const total = Object.keys(checks).length;
  return {
    checks,
    connectedTypes: [...connectedTypes],
    done,
    total,
    score: total ? done / total : 0,
  };
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".gitignore") continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) files.push(...walk(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function readMarkdownNode(file) {
  const content = fs.readFileSync(file, "utf8");
  const relativePath = path.relative(root, file);
  const { frontmatter, body } = splitFrontmatter(content);
  const data = parseYaml(frontmatter);
  const hasFrontmatter = Boolean(frontmatter);
  const title = data.title || firstHeading(body) || filenameTitle(file);
  const type = relativePath.startsWith("09_templates/") ? "template" : data.type || inferType(relativePath);
  const id = data.id || inferId(relativePath, title, type, hasFrontmatter);
  const wikilinks = extractWikilinks(content);
  const summary = extractSummary(body);
  const sections = extractSections(body);
  const checklist = extractChecklist(body);

  return {
    ...data,
    id: String(id),
    title: String(title),
    type,
    status: data.status || "",
    path: relativePath,
    tags: normalizeList(data.tags),
    aliases: normalizeList(data.aliases),
    related: data.related || {},
    wikilinks,
    summary,
    sections,
    checklist,
    isReadme: path.basename(relativePath).toLowerCase() === "readme.md",
    isTemplate: relativePath.startsWith("09_templates/"),
    isSystem: isSystemPath(relativePath, type),
  };
}

function splitFrontmatter(content) {
  if (!content.startsWith("---\n")) return { frontmatter: "", body: content };
  const end = content.indexOf("\n---", 4);
  if (end === -1) return { frontmatter: "", body: content };
  return {
    frontmatter: content.slice(4, end).trim(),
    body: content.slice(end + 4).trim(),
  };
}

function parseYaml(text) {
  const rootObject = {};
  const stack = [{ indent: -1, value: rootObject }];
  const lines = text.split(/\r?\n/);
  let lastKeyByIndent = new Map();

  for (let index = 0; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    const indent = rawLine.match(/^ */)[0].length;
    const line = rawLine.trim();

    while (stack.length > 1 && indent <= stack[stack.length - 1].indent) stack.pop();
    const parent = stack[stack.length - 1].value;

    if (line.startsWith("- ")) {
      const item = parseScalar(line.slice(2).trim());
      if (Array.isArray(parent)) {
        parent.push(item);
      } else {
        const key = lastKeyByIndent.get(indent);
        if (key && Array.isArray(parent[key])) parent[key].push(item);
      }
      continue;
    }

    const colonIndex = line.indexOf(":");
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const valueText = line.slice(colonIndex + 1).trim();

    if (!valueText) {
      const nextLine = nextContentLine(lines, index + 1);
      let nextValue = "";
      if (nextLine && nextLine.indent > indent) {
        nextValue = nextLine.text.startsWith("- ") ? [] : {};
      }
      parent[key] = nextValue;
      if (Array.isArray(nextValue) || isPlainObject(nextValue)) {
        stack.push({ indent, value: nextValue });
      }
      lastKeyByIndent.set(indent + 2, key);
    } else {
      parent[key] = parseScalar(valueText);
      lastKeyByIndent.set(indent, key);
    }

    if (Array.isArray(parent[key]) || isPlainObject(parent[key])) {
      stack.push({ indent, value: parent[key] });
    }
  }

  return rootObject;
}

function nextContentLine(lines, startIndex) {
  for (let index = startIndex; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine.trim() || rawLine.trim().startsWith("#")) continue;
    return {
      indent: rawLine.match(/^ */)[0].length,
      text: rawLine.trim(),
    };
  }
  return null;
}

function parseScalar(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  if (value.startsWith("[") && value.endsWith("]")) {
    const inner = value.slice(1, -1).trim();
    if (!inner) return [];
    return splitInlineList(inner).map(parseScalar);
  }
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1);
  }
  return value;
}

function splitInlineList(text) {
  const result = [];
  let current = "";
  let depth = 0;
  for (const char of text) {
    if (char === "[" || char === "{") depth += 1;
    if (char === "]" || char === "}") depth -= 1;
    if (char === "," && depth === 0) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

function buildResolver(nodes) {
  const map = new Map();
  for (const node of nodes) {
    const keys = [
      node.id,
      node.title,
      path.basename(node.path, ".md"),
      ...(node.aliases || []),
    ];
    for (const key of keys) {
      if (key) map.set(normalizeLink(key), node.id);
    }
  }
  return map;
}

function addResolvedEdge(edges, resolver, node, target, type, evidence) {
  const cleaned = cleanLink(target);
  if (!cleaned || cleaned === node.id || cleaned === node.title) return;
  const resolved = resolver.get(normalizeLink(cleaned));
  if (resolved) {
    edges.push({ source: node.id, target: resolved, type, evidence, sourcePath: node.path });
  } else {
    edges.push({ source: node.id, target: cleaned, type, evidence, sourcePath: node.path, unresolved: true });
  }
}

function flattenRelated(value, prefix = "related") {
  if (!value) return {};
  if (Array.isArray(value) || typeof value === "string") {
    return { [prefix]: normalizeList(value) };
  }
  if (!isPlainObject(value)) return {};
  const result = {};
  for (const [key, nested] of Object.entries(value)) {
    if (Array.isArray(nested) || typeof nested === "string") {
      result[key] = normalizeList(nested);
    } else if (isPlainObject(nested)) {
      Object.assign(result, flattenRelated(nested, key));
    }
  }
  return result;
}

function uniqueEdges(edges) {
  const seen = new Set();
  const result = [];
  for (const edge of edges) {
    const key = `${edge.source}\u0000${edge.target}\u0000${edge.type}\u0000${edge.evidence}`;
    if (!seen.has(key)) {
      seen.add(key);
      result.push(edge);
    }
  }
  return result;
}

function extractWikilinks(content) {
  const links = [];
  for (const match of content.matchAll(wikilinkRe)) links.push(match[1].trim());
  return [...new Set(links)];
}

function extractSummary(body) {
  const paragraphs = body
    .replace(/^---[\s\S]*?---/, "")
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter((part) => part && !part.startsWith("#") && !part.startsWith("```") && !part.startsWith("- ["));
  const first = paragraphs.find((part) => part.length > 20) || "";
  return first.replace(/\s+/g, " ").slice(0, 320);
}

function extractSections(body) {
  const sections = {};
  const headingRe = /^##\s+(.+)$/gm;
  const matches = [...body.matchAll(headingRe)];
  for (let index = 0; index < matches.length; index += 1) {
    const match = matches[index];
    const title = match[1].trim();
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : body.length;
    const content = body.slice(start, end).trim();
    sections[title] = content;
  }
  return sections;
}

function extractChecklist(body) {
  const items = [...body.matchAll(/^\s*-\s+\[( |x|X)\]\s+(.+)$/gm)].map((match) => ({
    checked: match[1].toLowerCase() === "x",
    text: match[2].trim(),
  }));
  const done = items.filter((item) => item.checked).length;
  return {
    total: items.length,
    done,
    ratio: items.length ? done / items.length : null,
    items,
  };
}

function firstHeading(body) {
  const line = body.split(/\r?\n/).find((item) => item.startsWith("# "));
  return line ? line.replace(/^#\s+/, "").trim() : "";
}

function filenameTitle(file) {
  return path.basename(file, ".md").replace(/[-_]/g, " ");
}

function inferType(relativePath) {
  if (relativePath.startsWith("01_daily/")) return "daily_log";
  if (relativePath.startsWith("02_papers/")) return "paper";
  if (relativePath.startsWith("03_source_reading/")) return "source_reading";
  if (relativePath.startsWith("04_research/ideas/")) return "research_idea";
  if (relativePath.startsWith("05_experiments/active/") || relativePath.startsWith("05_experiments/completed/") || relativePath.startsWith("05_experiments/failed/")) {
    return path.basename(relativePath).toLowerCase() === "readme.md" ? "experiment" : "experiment_artifact";
  }
  if (relativePath.startsWith("05_experiments/")) return "workflow";
  if (relativePath.startsWith("07_architecture/")) return "adr";
  if (relativePath.startsWith("09_templates/")) return "template";
  if (relativePath.startsWith("10_knowledge/")) return "knowledge_node";
  if (relativePath.startsWith("12_roadmap/")) return "roadmap";
  if (relativePath.startsWith("13_skills/")) return "skill";
  return "note";
}

function inferId(relativePath, title, type, hasFrontmatter) {
  if (type === "experiment" && path.basename(relativePath).toLowerCase() === "readme.md") {
    return path.basename(path.dirname(relativePath));
  }
  if (!hasFrontmatter) {
    return slug(relativePath.replace(/\.md$/i, ""));
  }
  return slug(title || relativePath);
}

function isSystemPath(relativePath, type) {
  if (relativePath.startsWith("09_templates/")) return true;
  if (relativePath.startsWith("11_agents/")) return true;
  if (relativePath.startsWith("13_skills/")) return true;
  if (type === "experiment_artifact") return true;
  if (path.basename(relativePath).toLowerCase() === "readme.md" && type !== "experiment") return true;
  return ["template", "skill"].includes(type);
}

function normalizeList(value) {
  if (value === undefined || value === null || value === "") return [];
  if (Array.isArray(value)) return value.flatMap(normalizeList);
  return [cleanLink(String(value))].filter(Boolean);
}

function cleanLink(value) {
  return String(value)
    .trim()
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function cleanPlainText(value) {
  return String(value)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2$1")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLink(value) {
  return cleanLink(value).toLowerCase().replace(/\s+/g, " ").trim();
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled";
}

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

main();
