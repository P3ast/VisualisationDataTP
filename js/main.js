import { fmtNum, fmtMoney } from './utils.js';
import { createChoropleth, updateChoropleth } from './charts/choropleth.js';
import { createStackedArea, updateStackedArea } from './charts/stackedArea.js';
import { createTreemap, updateTreemap } from './charts/treemap.js';
import { createBubbleChart, updateBubbleChart } from './charts/bubbleChart.js';
import { createRadarChart, updateRadarChart } from './charts/radarChart.js';
import { createSankey, updateSankey } from './charts/sankey.js';

// ── Global State ──
const state = {
  allData: [],
  filters: {
    yearRange: [2015, 2024],
    attackType: null,
    country: null,
    industry: null
  }
};

// ── Filter Logic ──
function getFilteredData() {
  return state.allData.filter(d => {
    const f = state.filters;
    if (d.year < f.yearRange[0] || d.year > f.yearRange[1]) return false;
    if (f.attackType && d.attackType !== f.attackType) return false;
    if (f.country && d.country !== f.country) return false;
    if (f.industry && d.industry !== f.industry) return false;
    return true;
  });
}

function updateAll() {
  const data = getFilteredData();
  updateKPIs(data);
  updateChoropleth(data);
  updateStackedArea(data);
  updateTreemap(data);
  updateBubbleChart(data);
  updateRadarChart(data);
  updateSankey(data);
  syncFilterUI();
}

function applyFilter(change) {
  Object.assign(state.filters, change);
  updateAll();
}

// ── KPI Cards ──
function updateKPIs(data) {
  const total = data.length;
  const totalLoss = d3.sum(data, d => d.loss);
  const totalUsers = d3.sum(data, d => d.users);
  const avgResolution = d3.mean(data, d => d.resolution) || 0;

  animateValue('kpi-total', total, v => fmtNum(v));
  animateValue('kpi-loss', totalLoss, v => fmtMoney(v) + 'M');
  animateValue('kpi-users', totalUsers, v => fmtNum(v));
  animateValue('kpi-time', avgResolution, v => Math.round(v) + 'h');
}

function animateValue(id, target, formatter) {
  const el = document.getElementById(id);
  const current = parseFloat(el.dataset.current || 0);
  el.dataset.current = target;

  const duration = 600;
  const start = performance.now();

  function step(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
    const val = current + (target - current) * eased;
    el.textContent = formatter(val);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── Filter UI ──
function setupFilters() {
  const years = d3.range(2015, 2025);
  const attackTypes = [...new Set(state.allData.map(d => d.attackType))].sort();
  const industries = [...new Set(state.allData.map(d => d.industry))].sort();
  const countries = [...new Set(state.allData.map(d => d.country))].sort();

  const startSel = document.getElementById('filter-year-start');
  const endSel = document.getElementById('filter-year-end');
  years.forEach(y => {
    startSel.add(new Option(y, y));
    endSel.add(new Option(y, y));
  });
  endSel.value = 2024;

  const atkSel = document.getElementById('filter-attack');
  attackTypes.forEach(t => atkSel.add(new Option(t, t)));

  const indSel = document.getElementById('filter-industry');
  industries.forEach(t => indSel.add(new Option(t, t)));

  const ctrSel = document.getElementById('filter-country');
  countries.forEach(t => ctrSel.add(new Option(t, t)));

  startSel.addEventListener('change', () => {
    const y = +startSel.value;
    applyFilter({ yearRange: [y, state.filters.yearRange[1]] });
  });
  endSel.addEventListener('change', () => {
    const y = +endSel.value;
    applyFilter({ yearRange: [state.filters.yearRange[0], y] });
  });
  atkSel.addEventListener('change', () => applyFilter({ attackType: atkSel.value || null }));
  indSel.addEventListener('change', () => applyFilter({ industry: indSel.value || null }));
  ctrSel.addEventListener('change', () => applyFilter({ country: ctrSel.value || null }));

  document.getElementById('btn-reset').addEventListener('click', () => {
    state.filters = { yearRange: [2015, 2024], attackType: null, country: null, industry: null };
    updateAll();
  });
}

function syncFilterUI() {
  document.getElementById('filter-year-start').value = state.filters.yearRange[0];
  document.getElementById('filter-year-end').value = state.filters.yearRange[1];
  document.getElementById('filter-attack').value = state.filters.attackType || '';
  document.getElementById('filter-industry').value = state.filters.industry || '';
  document.getElementById('filter-country').value = state.filters.country || '';
}

// ── Data Loading & Init ──
async function init() {
  const raw = await d3.csv('data/cybersecurity_threats.csv');

  state.allData = raw.map(d => ({
    country: d['Country'],
    year: +d['Year'],
    attackType: d['Attack Type'],
    industry: d['Target Industry'],
    source: d['Attack Source'],
    loss: +d['Financial Loss (Millions)'],
    users: +d['Number of Affected Users'],
    resolution: +d['Incident Resolution Time (Hours)'],
    vulnerability: d['Security Vulnerability Type'],
    defense: d['Defense Mechanism Used']
  }));

  setupFilters();

  const data = getFilteredData();
  updateKPIs(data);

  createChoropleth('chart-map', data, applyFilter);
  createStackedArea('chart-area', data, applyFilter);
  createTreemap('chart-treemap', data, applyFilter);
  createBubbleChart('chart-bubble', data, applyFilter);
  createRadarChart('chart-radar', data);
  createSankey('chart-sankey', data);
}

init().catch(err => console.error('Erreur de chargement:', err));
