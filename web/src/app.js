const state = {
  index: null,
  view: "overview",
  query: "",
  type: "all",
  showSystem: false,
  selectedId: null,
};

const typeLabels = {
  daily_log: "Daily",
  paper: "Paper",
  source_reading: "Source",
  research_idea: "Idea",
  experiment: "Experiment",
  experiment_artifact: "Exp Artifact",
  failed_experiment: "Failed",
  knowledge_node: "Knowledge",
  adr: "ADR",
  roadmap: "Roadmap",
  workflow: "Workflow",
  template: "Template",
  skill: "Skill",
  note: "Note",
};

const viewTitles = {
  overview: "Overview",
  graph: "Knowledge Graph",
  threads: "Research Threads",
  research: "Research Pipeline",
  experiments: "Experiment Dashboard",
  papers: "Paper Reading",
  source: "Source Reading",
  weekly: "Weekly Review",
  quality: "Quality",
};

const typeColors = {
  paper: "#2563eb",
  source_reading: "#7c3aed",
  research_idea: "#0f766e",
  experiment: "#b45309",
  experiment_artifact: "#78716c",
  failed_experiment: "#b91c1c",
  knowledge_node: "#15803d",
  daily_log: "#64748b",
  weekly_report: "#64748b",
  monthly_review: "#64748b",
  adr: "#9a3412",
  workflow: "#334155",
  roadmap: "#475569",
  template: "#6b7280",
  skill: "#334155",
  note: "#6b7280",
};

async function init() {
  bindEvents();
  try {
    const response = await fetch("./public/os-index.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    state.index = await response.json();
    document.getElementById("indexStatus").textContent =
      `${state.index.nodes.length} nodes / ${state.index.edges.length} edges`;
    populateTypeFilter();
    render();
  } catch (error) {
    document.getElementById("indexStatus").textContent = "Index missing";
    document.getElementById("overviewView").innerHTML = `
      <div class="empty-state">
        <strong>Index not found.</strong>
        <p>Run <code>node web/scripts/build-index.mjs</code> from the repository root.</p>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  }
}

function bindEvents() {
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      render();
    });
  });

  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  document.getElementById("typeFilter").addEventListener("change", (event) => {
    state.type = event.target.value;
    render();
  });

  document.getElementById("showSystemNotes").addEventListener("change", (event) => {
    state.showSystem = event.target.checked;
    render();
  });

  document.getElementById("resetFilters").addEventListener("click", () => {
    state.query = "";
    state.type = "all";
    state.showSystem = false;
    document.getElementById("searchInput").value = "";
    document.getElementById("typeFilter").value = "all";
    document.getElementById("showSystemNotes").checked = false;
    render();
  });
}

function populateTypeFilter() {
  const select = document.getElementById("typeFilter");
  const types = [...new Set(state.index.nodes.map((node) => node.type || "unknown"))].sort();
  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = typeLabels[type] || type;
    select.appendChild(option);
  });
}

function render() {
  if (!state.index) return;
  document.getElementById("viewTitle").textContent = viewTitles[state.view];
  document.querySelectorAll(".view").forEach((view) => view.classList.remove("is-visible"));
  document.getElementById(`${state.view}View`).classList.add("is-visible");

  const nodes = filteredNodes();
  renderSelectedDetail();

  if (state.view === "overview") renderOverview(nodes);
  if (state.view === "graph") renderGraph(nodes);
  if (state.view === "threads") renderThreads(nodes);
  if (state.view === "research") renderResearch(nodes);
  if (state.view === "experiments") renderExperiments(nodes);
  if (state.view === "papers") renderPapers(nodes);
  if (state.view === "source") renderSource(nodes);
  if (state.view === "weekly") renderWeekly(nodes);
  if (state.view === "quality") renderQuality(nodes);
}

function filteredNodes() {
  return state.index.nodes.filter((node) => {
    if (!state.showSystem && node.isSystem) return false;
    const typeMatch = state.type === "all" || node.type === state.type;
    const haystack = [
      node.id,
      node.title,
      node.path,
      node.type,
      node.status,
      ...(node.tags || []),
      ...(node.aliases || []),
      node.summary || "",
    ]
      .join(" ")
      .toLowerCase();
    return typeMatch && (!state.query || haystack.includes(state.query));
  });
}

function renderOverview(nodes) {
  const byType = countBy(nodes, (node) => node.type || "unknown");
  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  const visibleEdges = state.index.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  const activeIdeas = nodes
    .filter((node) => node.type === "research_idea")
    .sort((a, b) => Number(b.maturity || 0) - Number(a.maturity || 0));
  const experiments = nodes.filter((node) => node.type === "experiment");
  const recent = [...nodes].sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 8);
  const orphanNodes = nodes.filter((node) => (node.outgoing || 0) === 0 && (node.incoming || 0) === 0);
  const incompleteExperiments = experiments.filter((node) => node.checklist?.total && node.checklist.done < node.checklist.total);

  document.getElementById("overviewView").innerHTML = `
    <div class="metric-grid">
      ${metric("Nodes", nodes.length)}
      ${metric("Edges", visibleEdges.length)}
      ${metric("Ideas", byType.research_idea || 0)}
      ${metric("Experiments", byType.experiment || 0)}
      ${metric("Papers", byType.paper || 0)}
      ${metric("Knowledge", byType.knowledge_node || 0)}
    </div>
    <div class="content-grid">
      ${panel("Recent Updates", nodeList(recent))}
      ${panel("Active Research Ideas", researchIdeaList(activeIdeas))}
      ${panel("Experiments", experimentList(experiments))}
      ${panel("Incomplete Experiment Checklists", experimentList(incompleteExperiments))}
      ${panel("Orphan Notes", nodeList(orphanNodes.slice(0, 10)))}
      ${panel("Type Distribution", typeDistribution(byType), "full")}
    </div>
  `;
  bindNodeRows();
}

function renderGraph(nodes) {
  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = state.index.edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));
  document.getElementById("graphView").innerHTML = `
    <div class="graph-toolbar">
      <span class="status-pill">${nodes.length} visible nodes</span>
      <span class="status-pill">${edges.length} visible edges</span>
      <span class="status-pill">Click a node to inspect metadata</span>
    </div>
    <div class="graph-wrap">
      <svg id="graphCanvas" role="img" aria-label="Knowledge graph"></svg>
    </div>
  `;
  drawGraph(nodes, edges);
}

function renderThreads(nodes) {
  const ideas = nodes
    .filter((node) => node.type === "research_idea")
    .sort((a, b) => Number(b.maturity || 0) - Number(a.maturity || 0));
  document.getElementById("threadsView").innerHTML = `
    <div class="content-grid">
      ${ideas.map((idea) => threadPanel(idea)).join("") || emptyState("No research ideas found.")}
    </div>
  `;
  bindNodeRows();
}

function threadPanel(idea) {
  const linked = linkedNodes(idea.id);
  const byType = groupBy(linked, (node) => node.type || "unknown");
  return panel(
    idea.title || idea.id,
    `
      ${idea.ideaHealth ? healthBar("Idea completeness", idea.ideaHealth.done, idea.ideaHealth.total) : ""}
      ${idea.sections?.["Next Action"] ? `<p class="next-action">Next: ${escapeHtml(truncate(cleanMarkdown(idea.sections["Next Action"]), 180))}</p>` : ""}
      <div class="thread-grid">
        ${threadColumn("Papers", byType.paper || [])}
        ${threadColumn("Source", byType.source_reading || [])}
        ${threadColumn("Experiments", byType.experiment || [])}
        ${threadColumn("Knowledge", byType.knowledge_node || [])}
      </div>
    `,
    "full",
  );
}

function threadColumn(title, nodes) {
  return `
    <div class="thread-column">
      <h4>${escapeHtml(title)}</h4>
      ${nodeList(nodes)}
    </div>
  `;
}

function renderResearch(nodes) {
  const ideas = nodes.filter((node) => node.type === "research_idea");
  const buckets = [
    ["0", "Raw"],
    ["1", "Seed"],
    ["2", "Problem"],
    ["3", "Hypothesis"],
    ["4", "Experiment"],
    ["5", "Evidence"],
    ["6", "Claim"],
  ];
  document.getElementById("researchView").innerHTML = `
    <div class="pipeline">
      ${buckets
        .map(([level, label]) => {
          const items = ideas.filter((idea) => String(idea.maturity || "1") === level);
          return `<div class="pipeline-column"><h3>${label}</h3>${researchIdeaList(items)}</div>`;
        })
        .join("")}
    </div>
  `;
  bindNodeRows();
}

function renderExperiments(nodes) {
  const experiments = nodes.filter((node) => node.type === "experiment" || node.type === "failed_experiment");
  const byStatus = groupBy(experiments, (node) => node.status || "unknown");
  document.getElementById("experimentsView").innerHTML = `
    <div class="metric-grid">
      ${metric("Experiments", experiments.length)}
      ${metric("With Checklists", experiments.filter((node) => node.checklist?.total).length)}
      ${metric("Complete", experiments.filter((node) => node.checklist?.total && node.checklist.done === node.checklist.total).length)}
      ${metric("Need Attention", experiments.filter((node) => node.checklist?.total && node.checklist.done < node.checklist.total).length)}
      ${metric("With Results", experiments.filter((node) => node.experimentHealth?.rawResult).length)}
      ${metric("With Env", experiments.filter((node) => node.experimentHealth?.env).length)}
    </div>
    <div class="content-grid">
      ${Object.entries(byStatus)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([status, items]) => panel(status, experimentList(items)))
        .join("") || emptyState("No experiments found.")}
    </div>
  `;
  bindNodeRows();
}

function renderPapers(nodes) {
  const papers = nodes.filter((node) => node.type === "paper");
  const byStatus = groupBy(papers, (node) => node.status || "unknown");
  document.getElementById("papersView").innerHTML = `
    <div class="content-grid">
      ${Object.entries(byStatus)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([status, items]) => panel(status, nodeList(items)))
        .join("") || emptyState("No paper notes found.")}
    </div>
  `;
  bindNodeRows();
}

function renderQuality(nodes) {
  const visibleNodeIds = new Set(nodes.map((node) => node.id));
  const visibleBrokenLinks = state.index.brokenLinks.filter((edge) => visibleNodeIds.has(edge.source));
  const visibleEdges = state.index.edges.filter((edge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target));
  const orphanNodes = nodes.filter((node) => (node.outgoing || 0) === 0 && (node.incoming || 0) === 0);
  const hiddenSystem = state.index.nodes.filter((node) => node.isSystem);
  const researchTypes = new Set(["paper", "source_reading", "research_idea", "experiment", "knowledge_node"]);
  const lowConnectivity = nodes
    .filter((node) => researchTypes.has(node.type))
    .filter((node) => (node.incoming || 0) + (node.outgoing || 0) <= 1);

  document.getElementById("qualityView").innerHTML = `
    <div class="metric-grid">
      ${metric("Visible Nodes", nodes.length)}
      ${metric("Visible Edges", visibleEdges.length)}
      ${metric("Broken Links", visibleBrokenLinks.length)}
      ${metric("Orphans", orphanNodes.length)}
      ${metric("Low Connectivity", lowConnectivity.length)}
      ${metric("Hidden System Notes", hiddenSystem.length)}
    </div>
    <div class="content-grid">
      ${panel("Broken Links", brokenLinkList(visibleBrokenLinks))}
      ${panel("Orphan Nodes", nodeList(orphanNodes))}
      ${panel("Low Connectivity Research Nodes", nodeList(lowConnectivity))}
      ${panel("Hidden System Notes", nodeList(hiddenSystem.slice(0, 20)))}
      ${panel("Quality Report", qualityReport(nodes, visibleBrokenLinks, orphanNodes, lowConnectivity), "full")}
    </div>
  `;
  bindNodeRows();
}

function renderSource(nodes) {
  const source = nodes.filter((node) => node.type === "source_reading");
  const bySystem = groupBy(source, (node) => node.system || firstPathSegment(node.path) || "unknown");
  document.getElementById("sourceView").innerHTML = `
    <div class="content-grid">
      ${Object.entries(bySystem)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([system, items]) => panel(system, nodeList(items)))
        .join("") || emptyState("No source reading notes found.")}
    </div>
  `;
  bindNodeRows();
}

function renderWeekly(nodes) {
  const daily = nodes
    .filter((node) => node.type === "daily_log")
    .sort((a, b) => String(b.date || b.updated || "").localeCompare(String(a.date || a.updated || "")))
    .slice(0, 7);
  const recent = [...nodes].sort((a, b) => String(b.updated || "").localeCompare(String(a.updated || ""))).slice(0, 12);
  const ideas = nodes.filter((node) => node.type === "research_idea");
  const incompleteExperiments = nodes
    .filter((node) => node.type === "experiment")
    .filter((node) => node.experimentHealth && node.experimentHealth.done < node.experimentHealth.total);

  document.getElementById("weeklyView").innerHTML = `
    <div class="metric-grid">
      ${metric("Recent Daily Logs", daily.length)}
      ${metric("Active Ideas", ideas.length)}
      ${metric("Incomplete Experiments", incompleteExperiments.length)}
      ${metric("Recent Updates", recent.length)}
    </div>
    <div class="content-grid">
      ${panel("Daily Logs", nodeList(daily))}
      ${panel("Research Ideas", researchIdeaList(ideas))}
      ${panel("Incomplete Experiments", experimentList(incompleteExperiments))}
      ${panel("Recent Updates", nodeList(recent))}
      ${panel("Weekly Review Prompt", weeklyPrompt(nodes), "full")}
    </div>
  `;
  bindNodeRows();
}

function drawGraph(nodes, edges) {
  const svg = document.getElementById("graphCanvas");
  const width = svg.clientWidth || 900;
  const height = svg.clientHeight || 620;
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  svg.innerHTML = "";

  const centerX = width / 2;
  const centerY = height / 2;
  const groups = groupBy(nodes, (node) => node.type || "unknown");
  const typeOrder = Object.keys(groups).sort();
  const positions = new Map();

  typeOrder.forEach((type, typeIndex) => {
    const items = groups[type];
    const typeAngle = (Math.PI * 2 * typeIndex) / Math.max(typeOrder.length, 1) - Math.PI / 2;
    const groupX = centerX + Math.cos(typeAngle) * width * 0.26;
    const groupY = centerY + Math.sin(typeAngle) * height * 0.26;
    items.forEach((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(items.length, 1);
      const radius = Math.min(92, 26 + items.length * 4);
      positions.set(node.id, {
        x: groupX + Math.cos(angle) * radius,
        y: groupY + Math.sin(angle) * radius,
      });
    });
  });

  const edgeLayer = svgElement("g");
  edges.forEach((edge) => {
    const source = positions.get(edge.source);
    const target = positions.get(edge.target);
    if (!source || !target) return;
    const line = svgElement("line", {
      x1: source.x,
      y1: source.y,
      x2: target.x,
      y2: target.y,
      class: "graph-edge",
    });
    edgeLayer.appendChild(line);
  });
  svg.appendChild(edgeLayer);

  const nodeLayer = svgElement("g");
  nodes.forEach((node) => {
    const position = positions.get(node.id);
    const group = svgElement("g", {
      class: "graph-node",
      transform: `translate(${position.x}, ${position.y})`,
      "data-node-id": node.id,
    });
    const radius = node.type === "knowledge_node" ? 12 : 10;
    group.appendChild(
      svgElement("circle", {
        r: radius,
        fill: typeColors[node.type] || "#64748b",
        stroke: state.selectedId === node.id ? "#111827" : "#ffffff",
        "stroke-width": state.selectedId === node.id ? 3 : 2,
      }),
    );
    const label = truncate(node.title || node.id, 24);
    const text = svgElement("text", { x: 14, y: 4 });
    text.textContent = label;
    group.appendChild(text);
    group.addEventListener("click", () => selectNode(node.id));
    nodeLayer.appendChild(group);
  });
  svg.appendChild(nodeLayer);
}

function renderSelectedDetail() {
  const panel = document.getElementById("detailPanel");
  const node = state.index.nodes.find((item) => item.id === state.selectedId);
  if (!node) {
    panel.innerHTML = `
      <div class="detail-empty">
        <h3>Select a node</h3>
        <p>Click a note, graph node, idea, experiment, or paper to inspect metadata and links.</p>
      </div>
    `;
    return;
  }
  const outgoing = state.index.edges.filter((edge) => edge.source === node.id);
  const incoming = state.index.edges.filter((edge) => edge.target === node.id);
  panel.innerHTML = `
    <h3>${escapeHtml(node.title || node.id)}</h3>
    <div class="node-meta">
      ${typeChip(node.type)}
      ${node.status ? `<span class="tag">${escapeHtml(node.status)}</span>` : ""}
      ${node.maturity !== undefined ? `<span class="tag">maturity ${escapeHtml(String(node.maturity))}</span>` : ""}
    </div>
    <p class="detail-path">${escapeHtml(node.path)}</p>
    ${node.summary ? detailSection("Summary", `<div class="summary">${escapeHtml(node.summary)}</div>`) : ""}
    ${node.ideaHealth ? detailSection("Idea Health", healthChecklist(node.ideaHealth.checks)) : ""}
    ${node.experimentHealth ? detailSection("Experiment Readiness", experimentHealthSummary(node.experimentHealth)) : ""}
    ${node.checklist?.total ? detailSection("Checklist", checklistSummary(node)) : ""}
    ${detailSection("Tags", tags(node.tags || []))}
    ${detailSection("Outgoing Links", edgeList(outgoing, "target"))}
    ${detailSection("Backlinks", edgeList(incoming, "source"))}
    ${detailSection("Frontmatter", frontmatterTable(node))}
  `;
}

function bindNodeRows() {
  document.querySelectorAll("[data-node-id]").forEach((row) => {
    row.addEventListener("click", () => selectNode(row.dataset.nodeId));
  });
}

function selectNode(id) {
  state.selectedId = id;
  renderSelectedDetail();
  if (state.view === "graph") renderGraph(filteredNodes());
}

function metric(label, value) {
  return `<div class="metric"><strong>${value}</strong><span>${escapeHtml(label)}</span></div>`;
}

function panel(title, content, extraClass = "") {
  return `<section class="panel ${extraClass}"><h3>${escapeHtml(title)}</h3>${content}</section>`;
}

function nodeList(nodes) {
  if (!nodes.length) return emptyState("No matching notes.");
  return `<div class="node-list">${nodes
    .map(
      (node) => `
        <button class="node-row" data-node-id="${escapeAttr(node.id)}">
          <strong>${escapeHtml(node.title || node.id)}</strong>
          <span class="node-meta">
            ${typeChip(node.type)}
            ${node.status ? `<span>${escapeHtml(node.status)}</span>` : ""}
            ${node.updated ? `<span>${escapeHtml(node.updated)}</span>` : ""}
          </span>
          <span class="detail-path">${escapeHtml(node.path)}</span>
        </button>
      `,
    )
    .join("")}</div>`;
}

function researchIdeaList(nodes) {
  if (!nodes.length) return emptyState("No matching ideas.");
  return `<div class="node-list">${nodes
    .map((node) => {
      const problem = cleanMarkdown(node.sections?.["Problem"] || "");
      const nextAction = cleanMarkdown(node.sections?.["Next Action"] || "");
      return `
        <button class="node-row" data-node-id="${escapeAttr(node.id)}">
          <strong>${escapeHtml(node.title || node.id)}</strong>
          <span class="node-meta">
            ${typeChip(node.type)}
            <span>maturity ${escapeHtml(String(node.maturity ?? "n/a"))}</span>
            ${node.status ? `<span>${escapeHtml(node.status)}</span>` : ""}
          </span>
          ${node.ideaHealth ? healthBar("Completeness", node.ideaHealth.done, node.ideaHealth.total) : ""}
          ${problem ? `<span class="summary">${escapeHtml(truncate(problem, 160))}</span>` : ""}
          ${nextAction ? `<span class="next-action">Next: ${escapeHtml(truncate(nextAction, 140))}</span>` : ""}
        </button>
      `;
    })
    .join("")}</div>`;
}

function experimentList(nodes) {
  if (!nodes.length) return emptyState("No matching experiments.");
  return `<div class="node-list">${nodes
    .map((node) => `
      <button class="node-row" data-node-id="${escapeAttr(node.id)}">
        <strong>${escapeHtml(node.title || node.id)}</strong>
        <span class="node-meta">
          ${typeChip(node.type)}
          ${node.status ? `<span>${escapeHtml(node.status)}</span>` : ""}
          ${node.gpu ? `<span>GPU ${escapeHtml(node.gpu)}</span>` : ""}
        </span>
        ${node.experimentHealth ? healthBar("Readiness", node.experimentHealth.done, node.experimentHealth.total) : ""}
        ${node.checklist?.total ? progressBar(node.checklist.done, node.checklist.total) : `<span class="detail-path">No checklist found</span>`}
        <span class="detail-path">${escapeHtml(node.path)}</span>
      </button>
    `)
    .join("")}</div>`;
}

function brokenLinkList(edges) {
  if (!edges.length) return emptyState("No broken links.");
  return `<div class="node-list">${edges
    .map((edge) => `
      <div class="node-row">
        <strong>${escapeHtml(edge.target)}</strong>
        <span class="node-meta">
          <span>${escapeHtml(edge.type)}</span>
          <span>${escapeHtml(edge.evidence)}</span>
        </span>
        <span class="detail-path">from ${escapeHtml(edge.sourcePath)}</span>
      </div>
    `)
    .join("")}</div>`;
}

function typeDistribution(byType) {
  return `<div class="node-list">${Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .map(([type, count]) => `<div class="node-row"><strong>${escapeHtml(typeLabels[type] || type)}</strong><span>${count}</span></div>`)
    .join("")}</div>`;
}

function edgeList(edges, key) {
  if (!edges.length) return emptyState("No links.");
  return `<div class="node-list">${edges
    .map((edge) => {
      const linked = state.index.nodes.find((node) => node.id === edge[key]);
      return `
        <button class="node-row" data-node-id="${escapeAttr(edge[key])}">
          <strong>${escapeHtml(linked?.title || edge[key])}</strong>
          <span class="node-meta"><span>${escapeHtml(edge.type)}</span><span>${escapeHtml(edge.evidence)}</span></span>
        </button>
      `;
    })
    .join("")}</div>`;
}

function frontmatterTable(node) {
  const keys = ["id", "type", "status", "created", "updated", "system", "project", "gpu", "maturity"];
  return `<div class="node-list">${keys
    .filter((key) => node[key] !== undefined && node[key] !== "")
    .map((key) => `<div class="node-row"><strong>${escapeHtml(key)}</strong><span>${escapeHtml(JSON.stringify(node[key]))}</span></div>`)
    .join("")}</div>`;
}

function linkedNodes(id) {
  const ids = new Set();
  state.index.edges.forEach((edge) => {
    if (edge.source === id) ids.add(edge.target);
    if (edge.target === id) ids.add(edge.source);
  });
  return [...ids]
    .map((nodeId) => state.index.nodes.find((node) => node.id === nodeId))
    .filter(Boolean)
    .filter((node) => state.showSystem || !node.isSystem);
}

function healthBar(label, done, total) {
  return `
    <div class="health-row">
      <span>${escapeHtml(label)}</span>
      ${progressBar(done, total)}
    </div>
  `;
}

function weeklyPrompt(nodes) {
  const ideas = nodes.filter((node) => node.type === "research_idea").map((node) => node.title);
  const experiments = nodes.filter((node) => node.type === "experiment").map((node) => node.title);
  const source = nodes.filter((node) => node.type === "source_reading").map((node) => node.title);
  return `
    <pre class="report-block">请基于本周 Compiler Research OS 状态生成 weekly review。

重点检查：
- Research ideas: ${ideas.join(", ") || "none"}
- Experiments: ${experiments.join(", ") || "none"}
- Source reading: ${source.join(", ") || "none"}

请输出：
1. 本周完成
2. 关键学习
3. 实验状态
4. 研究 idea 推进
5. 架构判断
6. 下周唯一 deep focus
7. 需要停止或延后的事项</pre>
  `;
}

function qualityReport(nodes, brokenLinks, orphanNodes, lowConnectivity) {
  const incompleteExperiments = nodes
    .filter((node) => node.type === "experiment")
    .filter((node) => node.experimentHealth && node.experimentHealth.done < node.experimentHealth.total);
  const incompleteIdeas = nodes
    .filter((node) => node.type === "research_idea")
    .filter((node) => node.ideaHealth && node.ideaHealth.done < node.ideaHealth.total);
  const report = [
    "# Compiler Research OS Quality Report",
    "",
    `Visible nodes: ${nodes.length}`,
    `Broken links: ${brokenLinks.length}`,
    `Orphan nodes: ${orphanNodes.length}`,
    `Low-connectivity research nodes: ${lowConnectivity.length}`,
    `Incomplete experiments: ${incompleteExperiments.length}`,
    `Incomplete research ideas: ${incompleteIdeas.length}`,
    "",
    "## Incomplete Experiments",
    ...incompleteExperiments.map((node) => `- ${node.title}: ${node.experimentHealth.done}/${node.experimentHealth.total} readiness`),
    "",
    "## Incomplete Ideas",
    ...incompleteIdeas.map((node) => `- ${node.title}: ${node.ideaHealth.done}/${node.ideaHealth.total} completeness`),
    "",
    "## Orphans",
    ...orphanNodes.slice(0, 20).map((node) => `- ${node.title} (${node.path})`),
  ].join("\n");
  return `<pre class="report-block">${escapeHtml(report)}</pre>`;
}

function checklistSummary(node) {
  const checklist = node.checklist;
  return `
    ${progressBar(checklist.done, checklist.total)}
    <div class="node-list">
      ${checklist.items
        .map((item) => `
          <div class="checklist-item ${item.checked ? "is-done" : ""}">
            <span>${item.checked ? "Done" : "Open"}</span>
            <strong>${escapeHtml(item.text)}</strong>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function healthChecklist(checks) {
  return `
    <div class="node-list">
      ${Object.entries(checks)
        .map(([key, value]) => `
          <div class="checklist-item ${value ? "is-done" : ""}">
            <span>${value ? "Done" : "Open"}</span>
            <strong>${escapeHtml(key)}</strong>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function experimentHealthSummary(health) {
  const checks = Object.fromEntries(
    Object.entries(health).filter(([key]) => !["done", "total", "score"].includes(key)),
  );
  return `
    ${healthBar("Readiness", health.done, health.total)}
    ${healthChecklist(checks)}
  `;
}

function progressBar(done, total) {
  const percent = total ? Math.round((done / total) * 100) : 0;
  return `
    <div class="progress" aria-label="${done} of ${total} complete">
      <div class="progress-bar" style="width: ${percent}%"></div>
      <span>${done}/${total} · ${percent}%</span>
    </div>
  `;
}

function detailSection(title, content) {
  return `<section class="detail-section"><h4>${escapeHtml(title)}</h4>${content}</section>`;
}

function tags(values) {
  if (!values.length) return emptyState("No tags.");
  return `<div class="node-meta">${values.map((value) => `<span class="tag">${escapeHtml(value)}</span>`).join("")}</div>`;
}

function typeChip(type) {
  return `<span class="type-chip type-${escapeAttr(type || "unknown")}">${escapeHtml(typeLabels[type] || type || "unknown")}</span>`;
}

function emptyState(text) {
  return `<div class="empty-state">${escapeHtml(text)}</div>`;
}

function countBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
}

function groupBy(items, fn) {
  return items.reduce((acc, item) => {
    const key = fn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
}

function firstPathSegment(path) {
  return String(path || "").split("/")[0];
}

function truncate(text, max) {
  return text.length > max ? `${text.slice(0, max - 1)}...` : text;
}

function cleanMarkdown(text) {
  return String(text)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, "$2$1")
    .replace(/[#>*_`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function svgElement(name, attrs = {}) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
  return element;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replaceAll(" ", "_");
}

init();
