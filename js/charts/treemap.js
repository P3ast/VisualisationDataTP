import { industryColor, attackColor, showTooltip, hideTooltip, ttRow, fmtNum, fmtMoney } from '../utils.js';

let svg, treemapLayout;
let currentDepth = 'industry'; // 'industry' or drilled down
let onFilterCb = null;
let containerId_;
let allData = [];

const margin = { top: 5, right: 5, bottom: 5, left: 5 };

export function createTreemap(containerId, data, onFilter) {
  containerId_ = containerId;
  onFilterCb = onFilter;
  allData = data;
  renderTreemap(data, 'industry');
}

function renderTreemap(data, depth, parentIndustry = null) {
  currentDepth = depth;
  const container = document.getElementById(containerId_);
  container.innerHTML = '';

  const W = container.clientWidth;
  const H = container.clientHeight || 320;
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  // Breadcrumb
  if (parentIndustry) {
    const bc = document.createElement('div');
    bc.className = 'breadcrumb';
    bc.innerHTML = `<span id="bc-back">◂ Toutes industries</span> / ${parentIndustry}`;
    container.appendChild(bc);
    bc.querySelector('#bc-back').addEventListener('click', () => {
      renderTreemap(allData, 'industry');
      onFilterCb({ industry: null });
    });
  }

  svg = d3.select('#' + containerId_).append('svg')
    .attr('width', W).attr('height', parentIndustry ? H - 25 : H);

  const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  let hierarchy;
  if (depth === 'industry') {
    const grouped = d3.rollup(data, v => ({
      count: v.length,
      loss: d3.sum(v, d => d.loss),
      users: d3.sum(v, d => d.users)
    }), d => d.industry);

    const children = Array.from(grouped, ([key, val]) => ({
      name: key, ...val
    }));

    hierarchy = d3.hierarchy({ name: 'root', children })
      .sum(d => d.count)
      .sort((a, b) => b.value - a.value);
  } else {
    // Drill down: show attack types within industry
    const filtered = data.filter(d => d.industry === parentIndustry);
    const grouped = d3.rollup(filtered, v => ({
      count: v.length,
      loss: d3.sum(v, d => d.loss),
      users: d3.sum(v, d => d.users)
    }), d => d.attackType);

    const children = Array.from(grouped, ([key, val]) => ({
      name: key, ...val
    }));

    hierarchy = d3.hierarchy({ name: parentIndustry, children })
      .sum(d => d.count)
      .sort((a, b) => b.value - a.value);
  }

  treemapLayout = d3.treemap()
    .size([w, parentIndustry ? h - 20 : h])
    .padding(3)
    .round(true);

  treemapLayout(hierarchy);

  const leaves = g.selectAll('.treemap-cell')
    .data(hierarchy.leaves())
    .join('g')
    .attr('class', 'treemap-cell')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  leaves.append('rect')
    .attr('class', 'treemap-rect')
    .attr('width', d => Math.max(0, d.x1 - d.x0))
    .attr('height', d => Math.max(0, d.y1 - d.y0))
    .attr('fill', d => depth === 'industry' ? industryColor(d.data.name) : attackColor(d.data.name))
    .attr('fill-opacity', 0.75)
    .attr('rx', 4)
    .on('mouseover', (event, d) => {
      showTooltip(
        `<div class="tt-title">${d.data.name}</div>` +
        ttRow('Incidents', d.data.count) +
        ttRow('Pertes', fmtMoney(d.data.loss) + 'M') +
        ttRow('Utilisateurs', fmtNum(d.data.users)),
        event
      );
    })
    .on('mouseout', () => hideTooltip())
    .on('click', (event, d) => {
      if (depth === 'industry') {
        renderTreemap(allData, 'attackType', d.data.name);
        onFilterCb({ industry: d.data.name });
      }
    });

  // Labels
  leaves.append('text')
    .attr('x', 6).attr('y', 16)
    .text(d => {
      const w = d.x1 - d.x0;
      return w > 50 ? d.data.name : '';
    })
    .attr('fill', '#fff')
    .attr('font-size', '0.7rem')
    .attr('font-weight', 500);

  leaves.append('text')
    .attr('x', 6).attr('y', 30)
    .text(d => {
      const w = d.x1 - d.x0;
      return w > 50 ? d.data.count + ' incidents' : '';
    })
    .attr('fill', 'rgba(255,255,255,0.6)')
    .attr('font-size', '0.6rem');
}

export function updateTreemap(data) {
  allData = data;
  renderTreemap(data, 'industry');
}
