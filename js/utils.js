// ── Palette de couleurs ──
export const ATTACK_COLORS = {
  'Phishing': '#00f0ff',
  'DDoS': '#ff006e',
  'Ransomware': '#ff8c00',
  'Malware': '#a855f7',
  'Injection SQL': '#39ff14',
  'Man-in-the-Middle': '#fbbf24',
  'Zero-Day': '#f43f5e',
  'Spear Phishing': '#06b6d4'
};

export const INDUSTRY_COLORS = {
  'Finance': '#00f0ff',
  'Santé': '#ff006e',
  'Technologie': '#39ff14',
  'Gouvernement': '#a855f7',
  'Éducation': '#fbbf24',
  'Énergie': '#ff8c00',
  'Télécommunications': '#06b6d4',
  'Commerce': '#f43f5e',
  'Transport': '#818cf8',
  'Défense': '#34d399'
};

export const SOURCE_COLORS = {
  'Cybercriminels': '#ff006e',
  'Nation-État': '#ff8c00',
  'Groupe de hackers': '#a855f7',
  'Hacktivistes': '#39ff14',
  'Insider': '#fbbf24',
  'Inconnu': '#6b7280'
};

export function attackColor(type) { return ATTACK_COLORS[type] || '#6b7280'; }
export function industryColor(ind) { return INDUSTRY_COLORS[ind] || '#6b7280'; }

// ── Tooltip ──
const tooltip = () => document.getElementById('tooltip');

export function showTooltip(html, event) {
  const tt = tooltip();
  tt.innerHTML = html;
  tt.classList.add('visible');
  const x = event.clientX + 15;
  const y = event.clientY - 10;
  tt.style.left = Math.min(x, window.innerWidth - 300) + 'px';
  tt.style.top = Math.min(y, window.innerHeight - 200) + 'px';
}

export function hideTooltip() {
  tooltip().classList.remove('visible');
}

export function ttRow(label, value) {
  return `<div class="tt-row"><span class="tt-label">${label}</span><span class="tt-value">${value}</span></div>`;
}

// ── Formatage ──
export function fmtNum(n) {
  if (n >= 1e9) return (n / 1e9).toFixed(1) + ' Mrd';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + ' M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + ' K';
  return Math.round(n).toLocaleString('fr-FR');
}

export function fmtMoney(n) { return fmtNum(n) + ' $'; }

// ── Dimensions helper ──
export function getDimensions(containerId, margin = { top: 20, right: 20, bottom: 30, left: 40 }) {
  const container = document.getElementById(containerId);
  const width = container.clientWidth - margin.left - margin.right;
  const height = container.clientHeight - margin.top - margin.bottom;
  return { width: Math.max(width, 200), height: Math.max(height, 200), margin };
}

// ── Data helpers ──
export function groupBy(data, key) {
  return d3.group(data, d => d[key]);
}

export function rollupCount(data, key) {
  return d3.rollup(data, v => v.length, d => d[key]);
}

// ── Country → ISO numeric code mapping ──
export const COUNTRY_CODES = {
  'États-Unis':'840','Chine':'156','Russie':'643','Royaume-Uni':'826','Allemagne':'276',
  'France':'250','Inde':'356','Brésil':'076','Japon':'392','Corée du Sud':'410',
  'Iran':'364','Australie':'036','Canada':'124','Ukraine':'804','Israël':'376',
  'Turquie':'792','Mexique':'484','Italie':'380','Espagne':'724','Pays-Bas':'528',
  'Suède':'752','Pologne':'616','Nigeria':'566','Afrique du Sud':'710','Égypte':'818',
  'Arabie Saoudite':'682','Indonésie':'360','Singapour':'702','Malaisie':'458','Colombie':'170'
};
