import { COUNTRY_CODES, showTooltip, hideTooltip, ttRow, fmtNum, fmtMoney } from '../utils.js';

let svg, g, path, projection, colorScale, zoom;
let countryData = {};
let onFilterCb = null;
let selectedCountry = null;

export function createChoropleth(containerId, data, onFilter) {
  onFilterCb = onFilter;
  const container = document.getElementById(containerId);
  const W = container.clientWidth;
  const H = container.clientHeight || 320;

  svg = d3.select('#' + containerId).append('svg')
    .attr('width', W).attr('height', H);

  g = svg.append('g');

  projection = d3.geoNaturalEarth1()
    .scale(W / 5.5)
    .translate([W / 2, H / 2]);

  path = d3.geoPath().projection(projection);

  zoom = d3.zoom()
    .scaleExtent([1, 8])
    .on('zoom', (e) => g.attr('transform', e.transform));
  svg.call(zoom);

  // Build reverse map: ISO code → country name
  const codeToName = {};
  Object.entries(COUNTRY_CODES).forEach(([name, code]) => { codeToName[code] = name; });

  // Load world map
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json').then(world => {
    const countries = topojson.feature(world, world.objects.countries).features;
    updateCountryData(data);

    g.selectAll('.country-path')
      .data(countries)
      .join('path')
      .attr('class', 'country-path')
      .attr('d', path)
      .attr('fill', d => {
        const name = codeToName[d.id];
        const val = countryData[name];
        return val ? colorScale(val.count) : '#1a1f2e';
      })
      .on('mouseover', (event, d) => {
        const name = codeToName[d.id];
        const val = countryData[name];
        if (val) {
          showTooltip(
            `<div class="tt-title">${name}</div>` +
            ttRow('Incidents', val.count) +
            ttRow('Pertes', fmtMoney(val.loss) + 'M') +
            ttRow('Utilisateurs', fmtNum(val.users)),
            event
          );
        }
      })
      .on('mousemove', (event) => showTooltip(document.getElementById('tooltip').innerHTML, event))
      .on('mouseout', () => hideTooltip())
      .on('click', (event, d) => {
        const name = codeToName[d.id];
        if (!name) return;
        if (selectedCountry === name) {
          selectedCountry = null;
          g.selectAll('.country-path').classed('selected', false);
          onFilterCb({ country: null });
        } else {
          selectedCountry = name;
          g.selectAll('.country-path').classed('selected', dd => codeToName[dd.id] === name);
          onFilterCb({ country: name });
        }
      });
  });
}

function updateCountryData(data) {
  countryData = {};
  data.forEach(d => {
    if (!countryData[d.country]) countryData[d.country] = { count: 0, loss: 0, users: 0 };
    countryData[d.country].count++;
    countryData[d.country].loss += d.loss;
    countryData[d.country].users += d.users;
  });

  const maxCount = d3.max(Object.values(countryData), d => d.count) || 1;
  colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxCount]);
}

export function updateChoropleth(data) {
  updateCountryData(data);
  const codeToName = {};
  Object.entries(COUNTRY_CODES).forEach(([name, code]) => { codeToName[code] = name; });

  g.selectAll('.country-path')
    .transition().duration(500)
    .attr('fill', d => {
      const name = codeToName[d.id];
      const val = countryData[name];
      return val ? colorScale(val.count) : '#1a1f2e';
    });
}
