import { attackColor, showTooltip, hideTooltip, ttRow, fmtNum, fmtMoney } from '../utils.js';

let svg, simulation;
let onFilterCb = null;
let selectedType = null;
const margin = { top: 10, right: 10, bottom: 10, left: 10 };

export function createBubbleChart(containerId, data, onFilter) {
  onFilterCb = onFilter;
  const container = document.getElementById(containerId);
  const W = container.clientWidth;
  const H = container.clientHeight || 320;

  svg = d3.select('#' + containerId).append('svg').attr('width', W).attr('height', H);
  renderBubbles(data, W, H);
}

function renderBubbles(data, W, H) {
  // Aggregate by attack type
  const grouped = d3.rollup(data, v => ({
    count: v.length,
    loss: d3.sum(v, d => d.loss),
    users: d3.sum(v, d => d.users),
    avgResolution: d3.mean(v, d => d.resolution)
  }), d => d.attackType);

  const nodes = Array.from(grouped, ([key, val]) => ({
    name: key, ...val,
    radius: 0
  }));

  const radiusScale = d3.scaleSqrt()
    .domain([0, d3.max(nodes, d => d.count)])
    .range([15, Math.min(W, H) / 5]);

  nodes.forEach(d => { d.radius = radiusScale(d.count); });

  simulation = d3.forceSimulation(nodes)
    .force('center', d3.forceCenter(W / 2, H / 2))
    .force('charge', d3.forceManyBody().strength(5))
    .force('collide', d3.forceCollide(d => d.radius + 3).strength(0.8))
    .on('tick', ticked);

  const bubbles = svg.selectAll('.bubble-g')
    .data(nodes, d => d.name)
    .join(
      enter => {
        const g = enter.append('g').attr('class', 'bubble-g');
        g.append('circle')
          .attr('class', 'bubble-circle')
          .attr('r', 0)
          .attr('fill', d => attackColor(d.name))
          .attr('fill-opacity', 0.65)
          .attr('stroke', d => attackColor(d.name))
          .attr('stroke-width', 1.5)
          .transition().duration(600)
          .attr('r', d => d.radius);

        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '-0.3em')
          .attr('fill', '#fff')
          .attr('font-size', d => d.radius > 30 ? '0.7rem' : '0.55rem')
          .attr('font-weight', 500)
          .text(d => d.radius > 20 ? d.name : '');

        g.append('text')
          .attr('text-anchor', 'middle')
          .attr('dy', '1em')
          .attr('fill', 'rgba(255,255,255,0.6)')
          .attr('font-size', '0.6rem')
          .text(d => d.radius > 30 ? d.count : '');

        return g;
      }
    )
    .on('mouseover', (event, d) => {
      showTooltip(
        `<div class="tt-title">${d.name}</div>` +
        ttRow('Incidents', d.count) +
        ttRow('Pertes totales', fmtMoney(d.loss) + 'M') +
        ttRow('Utilisateurs', fmtNum(d.users)) +
        ttRow('Résolution moy.', Math.round(d.avgResolution) + 'h'),
        event
      );
    })
    .on('mouseout', () => hideTooltip())
    .on('click', (event, d) => {
      if (selectedType === d.name) {
        selectedType = null;
        svg.selectAll('.bubble-circle').attr('fill-opacity', 0.65);
        onFilterCb({ attackType: null });
      } else {
        selectedType = d.name;
        svg.selectAll('.bubble-circle')
          .attr('fill-opacity', dd => dd.name === d.name ? 0.9 : 0.2);
        onFilterCb({ attackType: d.name });
      }
    })
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  function ticked() {
    svg.selectAll('.bubble-g')
      .attr('transform', d => `translate(${d.x},${d.y})`);
  }
}

export function updateBubbleChart(data) {
  const container = svg.node().parentElement;
  const W = container.clientWidth;
  const H = container.clientHeight || 320;
  svg.selectAll('*').remove();
  if (simulation) simulation.stop();
  selectedType = null;
  renderBubbles(data, W, H);
}
