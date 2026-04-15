import { ATTACK_COLORS, attackColor, showTooltip, hideTooltip, ttRow, fmtNum } from '../utils.js';

let svg, xScale, yScale, area, stack, brush;
let chartG, brushG;
let onFilterCb = null;
const margin = { top: 20, right: 20, bottom: 50, left: 50 };

export function createStackedArea(containerId, data, onFilter) {
  onFilterCb = onFilter;
  const container = document.getElementById(containerId);
  const W = container.clientWidth;
  const H = container.clientHeight || 320;
  const w = W - margin.left - margin.right;
  const h = H - margin.top - margin.bottom;

  const attackTypes = Object.keys(ATTACK_COLORS);

  // Aggregate by year and type
  const yearData = buildYearData(data, attackTypes);

  svg = d3.select('#' + containerId).append('svg').attr('width', W).attr('height', H);
  chartG = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

  xScale = d3.scaleLinear().domain([2015, 2024]).range([0, w]);
  yScale = d3.scaleLinear().range([h, 0]);

  stack = d3.stack().keys(attackTypes).order(d3.stackOrderNone).offset(d3.stackOffsetNone);
  area = d3.area()
    .x(d => xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))
    .curve(d3.curveMonotoneX);

  const stacked = stack(yearData);
  yScale.domain([0, d3.max(stacked, s => d3.max(s, d => d[1])) * 1.05]);

  // Axes
  chartG.append('g').attr('class', 'axis x-axis')
    .attr('transform', `translate(0,${h})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format('d')).ticks(10));

  chartG.append('g').attr('class', 'axis y-axis')
    .call(d3.axisLeft(yScale).ticks(6));

  // Areas
  chartG.selectAll('.area-path')
    .data(stacked)
    .join('path')
    .attr('class', 'area-path')
    .attr('d', area)
    .attr('fill', d => attackColor(d.key))
    .attr('fill-opacity', 0.6)
    .attr('stroke', d => attackColor(d.key))
    .attr('stroke-width', 1)
    .on('mouseover', (event, d) => {
      showTooltip(`<div class="tt-title">${d.key}</div>`, event);
    })
    .on('mousemove', (event, d) => {
      const [mx] = d3.pointer(event, chartG.node());
      const year = Math.round(xScale.invert(mx));
      const yearEntry = yearData.find(y => y.year === year);
      const count = yearEntry ? yearEntry[d.key] : 0;
      showTooltip(
        `<div class="tt-title">${d.key}</div>` +
        ttRow('Année', year) +
        ttRow('Incidents', count),
        event
      );
    })
    .on('mouseout', () => hideTooltip());

  // Brush
  brush = d3.brushX()
    .extent([[0, 0], [w, h]])
    .on('end', (event) => {
      if (!event.selection) {
        onFilterCb({ yearRange: [2015, 2024] });
        return;
      }
      const [x0, x1] = event.selection;
      const y0 = Math.round(xScale.invert(x0));
      const y1 = Math.round(xScale.invert(x1));
      onFilterCb({ yearRange: [Math.max(2015, y0), Math.min(2024, y1)] });
    });

  brushG = chartG.append('g').attr('class', 'brush').call(brush);

  // Legend
  const legend = d3.select('#' + containerId).append('div').attr('class', 'legend');
  attackTypes.forEach(type => {
    legend.append('div').attr('class', 'legend-item')
      .html(`<span class="legend-swatch" style="background:${attackColor(type)}"></span>${type}`);
  });
}

function buildYearData(data, attackTypes) {
  const grouped = d3.rollup(data, v => v.length, d => d.year, d => d.attackType);
  const years = d3.range(2015, 2025);
  return years.map(year => {
    const row = { year };
    attackTypes.forEach(t => { row[t] = grouped.get(year)?.get(t) || 0; });
    return row;
  });
}

export function updateStackedArea(data) {
  const attackTypes = Object.keys(ATTACK_COLORS);
  const yearData = buildYearData(data, attackTypes);
  const stacked = stack(yearData);
  yScale.domain([0, d3.max(stacked, s => d3.max(s, d => d[1])) * 1.05 || 1]);

  chartG.select('.y-axis').transition().duration(500).call(d3.axisLeft(yScale).ticks(6));

  chartG.selectAll('.area-path')
    .data(stacked)
    .transition().duration(500)
    .attr('d', area);
}
