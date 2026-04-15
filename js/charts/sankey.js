import { attackColor, industryColor, SOURCE_COLORS, showTooltip, hideTooltip, ttRow } from '../utils.js';

let svg;
let containerId_;

export function createSankey(containerId, data) {
  containerId_ = containerId;
  renderSankey(data);
}

function renderSankey(data) {
  const container = document.getElementById(containerId_);
  container.querySelectorAll('svg').forEach(s => s.remove());

  const W = container.clientWidth;
  const H = container.clientHeight || 320;
  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  svg = d3.select('#' + containerId_).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  // Build nodes and links: Source → Attack Type → Industry
  const sources = [...new Set(data.map(d => d.source))];
  const attacks = [...new Set(data.map(d => d.attackType))];
  const industries = [...new Set(data.map(d => d.industry))];

  const nodeNames = [
    ...sources.map(s => 'src_' + s),
    ...attacks.map(a => 'atk_' + a),
    ...industries.map(i => 'ind_' + i)
  ];

  const nodeIndex = {};
  nodeNames.forEach((n, i) => { nodeIndex[n] = i; });

  const nodes = nodeNames.map(n => {
    const label = n.replace(/^(src_|atk_|ind_)/, '');
    return { name: label, fullKey: n };
  });

  // Aggregate links
  const linkMap = {};

  // Source → Attack Type
  data.forEach(d => {
    const key = `src_${d.source}|atk_${d.attackType}`;
    linkMap[key] = (linkMap[key] || 0) + 1;
  });

  // Attack Type → Industry
  data.forEach(d => {
    const key = `atk_${d.attackType}|ind_${d.industry}`;
    linkMap[key] = (linkMap[key] || 0) + 1;
  });

  const links = Object.entries(linkMap).map(([key, value]) => {
    const [s, t] = key.split('|');
    return { source: nodeIndex[s], target: nodeIndex[t], value };
  }).filter(l => l.source !== undefined && l.target !== undefined);

  if (links.length === 0 || nodes.length === 0) {
    g.append('text').attr('x', w/2).attr('y', h/2)
      .attr('text-anchor', 'middle').attr('fill', '#6b7280')
      .text('Pas assez de données');
    return;
  }

  const sankey = d3.sankey()
    .nodeWidth(18)
    .nodePadding(8)
    .extent([[0, 0], [w, h]])
    .nodeSort(null);

  const { nodes: sNodes, links: sLinks } = sankey({
    nodes: nodes.map(d => ({ ...d })),
    links: links.map(d => ({ ...d }))
  });

  // Links
  g.selectAll('.sankey-link')
    .data(sLinks)
    .join('path')
    .attr('class', 'sankey-link')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke', d => {
      const srcName = d.source.name;
      return SOURCE_COLORS[srcName] || attackColor(srcName) || '#6b7280';
    })
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('stroke-opacity', 0.35)
    .on('mouseover', function(event, d) {
      d3.select(this).attr('stroke-opacity', 0.7);
      showTooltip(
        `<div class="tt-title">${d.source.name} → ${d.target.name}</div>` +
        ttRow('Incidents', d.value),
        event
      );
    })
    .on('mouseout', function() {
      d3.select(this).attr('stroke-opacity', 0.35);
      hideTooltip();
    });

  // Nodes
  const nodeG = g.selectAll('.sankey-node')
    .data(sNodes)
    .join('g')
    .attr('class', 'sankey-node')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  nodeG.append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => Math.max(1, d.y1 - d.y0))
    .attr('fill', d => {
      const n = d.name;
      return SOURCE_COLORS[n] || attackColor(n) || industryColor(n) || '#6b7280';
    })
    .attr('fill-opacity', 0.8)
    .attr('rx', 3)
    .on('mouseover', (event, d) => {
      showTooltip(
        `<div class="tt-title">${d.name}</div>` +
        ttRow('Total flux', d.value),
        event
      );
    })
    .on('mouseout', () => hideTooltip());

  // Labels
  nodeG.append('text')
    .attr('x', d => (d.x0 < w / 2) ? (d.x1 - d.x0 + 6) : -6)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('text-anchor', d => (d.x0 < w / 2) ? 'start' : 'end')
    .attr('dominant-baseline', 'middle')
    .attr('fill', '#e5e7eb')
    .attr('font-size', '0.6rem')
    .text(d => (d.y1 - d.y0) > 12 ? d.name : '');
}

export function updateSankey(data) {
  renderSankey(data);
}
