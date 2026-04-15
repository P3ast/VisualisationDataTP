import { industryColor, showTooltip, hideTooltip, ttRow, fmtNum } from '../utils.js';

let svg;
const margin = { top: 30, right: 30, bottom: 30, left: 30 };

const axes = [
  { key: 'count', label: 'Nb incidents' },
  { key: 'loss', label: 'Pertes ($M)' },
  { key: 'users', label: 'Utilisateurs' },
  { key: 'resolution', label: 'Résolution (h)' },
  { key: 'vulnDiversity', label: 'Types vulnérabilités' }
];

export function createRadarChart(containerId, data) {
  const container = document.getElementById(containerId);
  const W = container.clientWidth;
  const H = container.clientHeight || 320;
  const radius = Math.min(W, H) / 2 - 50;
  const cx = W / 2, cy = H / 2;

  svg = d3.select('#' + containerId).append('svg').attr('width', W).attr('height', H);
  const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

  renderRadar(g, data, radius);

  // Legend
  const industryData = computeIndustryMetrics(data);
  const legend = d3.select('#' + containerId).append('div').attr('class', 'legend');
  industryData.slice(0, 6).forEach(ind => {
    legend.append('div').attr('class', 'legend-item')
      .html(`<span class="legend-swatch" style="background:${industryColor(ind.name)}"></span>${ind.name}`);
  });
}

function computeIndustryMetrics(data) {
  const grouped = d3.rollup(data, v => ({
    count: v.length,
    loss: d3.sum(v, d => d.loss),
    users: d3.sum(v, d => d.users),
    resolution: d3.mean(v, d => d.resolution),
    vulnDiversity: new Set(v.map(d => d.vulnerability)).size
  }), d => d.industry);

  return Array.from(grouped, ([key, val]) => ({ name: key, ...val }))
    .sort((a, b) => b.count - a.count);
}

function renderRadar(g, data, radius) {
  g.selectAll('*').remove();
  const industries = computeIndustryMetrics(data);
  const top6 = industries.slice(0, 6);

  // Find max for each axis across all industries
  const maxValues = {};
  axes.forEach(axis => {
    maxValues[axis.key] = d3.max(top6, d => d[axis.key]) || 1;
  });

  const angleSlice = (Math.PI * 2) / axes.length;

  // Grid circles
  const levels = 5;
  for (let i = 1; i <= levels; i++) {
    const r = (radius / levels) * i;
    g.append('circle')
      .attr('r', r)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(156,163,175,0.1)')
      .attr('stroke-dasharray', '3,3');
  }

  // Axis lines and labels
  axes.forEach((axis, i) => {
    const angle = angleSlice * i - Math.PI / 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    g.append('line')
      .attr('x1', 0).attr('y1', 0)
      .attr('x2', x).attr('y2', y)
      .attr('stroke', 'rgba(156,163,175,0.2)');

    g.append('text')
      .attr('x', Math.cos(angle) * (radius + 20))
      .attr('y', Math.sin(angle) * (radius + 20))
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', '#9ca3af')
      .attr('font-size', '0.65rem')
      .text(axis.label);
  });

  // Draw polygons for each industry
  const line = d3.lineRadial().curve(d3.curveLinearClosed);

  top6.forEach(ind => {
    const points = axes.map((axis, i) => {
      const val = ind[axis.key] / maxValues[axis.key];
      return [angleSlice * i - Math.PI / 2, val * radius];
    });

    g.append('path')
      .datum(points)
      .attr('class', 'radar-area')
      .attr('d', line)
      .attr('fill', industryColor(ind.name))
      .attr('fill-opacity', 0.1)
      .attr('stroke', industryColor(ind.name))
      .attr('stroke-width', 1.5)
      .attr('stroke-opacity', 0.7)
      .on('mouseover', (event) => {
        showTooltip(
          `<div class="tt-title">${ind.name}</div>` +
          ttRow('Incidents', ind.count) +
          ttRow('Pertes', fmtNum(ind.loss) + ' M$') +
          ttRow('Utilisateurs', fmtNum(ind.users)) +
          ttRow('Résolution', Math.round(ind.resolution) + 'h'),
          event
        );
      })
      .on('mouseout', () => hideTooltip());

    // Dots at vertices
    points.forEach(([angle, r]) => {
      g.append('circle')
        .attr('cx', Math.cos(angle) * r)
        .attr('cy', Math.sin(angle) * r)
        .attr('r', 3)
        .attr('fill', industryColor(ind.name))
        .attr('fill-opacity', 0.8);
    });
  });
}

export function updateRadarChart(data) {
  const svgEl = svg.node();
  const W = svgEl.parentElement.clientWidth;
  const H = svgEl.parentElement.clientHeight || 320;
  const radius = Math.min(W, H) / 2 - 50;
  const g = svg.select('g');
  renderRadar(g, data, radius);
}
