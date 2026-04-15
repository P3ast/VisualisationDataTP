const fs = require('fs');
const path = require('path');

function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function weightedChoice(items, weights) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < items.length; i++) { r -= weights[i]; if (r <= 0) return items[i]; }
  return items[items.length - 1];
}
function rand(min, max) { return Math.random() * (max - min) + min; }
function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

const countries = [
  ['États-Unis',15],['Chine',12],['Russie',10],['Royaume-Uni',8],['Allemagne',7],
  ['France',7],['Inde',8],['Brésil',5],['Japon',6],['Corée du Sud',5],
  ['Iran',4],['Australie',4],['Canada',5],['Ukraine',4],['Israël',3],
  ['Turquie',3],['Mexique',3],['Italie',4],['Espagne',3],['Pays-Bas',3],
  ['Suède',2],['Pologne',2],['Nigeria',3],['Afrique du Sud',2],['Égypte',2],
  ['Arabie Saoudite',2],['Indonésie',3],['Singapour',2],['Malaisie',2],['Colombie',2]
];

const attackTypes = ['Phishing','DDoS','Ransomware','Malware','Injection SQL','Man-in-the-Middle','Zero-Day','Spear Phishing'];
const attackWeights = {
  'Phishing':       [15,16,17,18,19,20,20,21,22,22],
  'DDoS':           [12,12,11,11,10,10,9,9,8,8],
  'Ransomware':     [5,7,9,12,15,18,22,25,28,30],
  'Malware':        [18,17,16,15,14,13,12,11,10,9],
  'Injection SQL':  [10,9,8,7,7,6,5,5,4,4],
  'Man-in-the-Middle':[8,7,7,6,6,5,5,4,4,3],
  'Zero-Day':       [4,5,6,7,8,9,10,11,12,13],
  'Spear Phishing': [8,9,10,10,11,11,12,12,13,13]
};

const industries = [
  ['Finance',18],['Santé',14],['Technologie',15],['Gouvernement',12],['Éducation',8],
  ['Énergie',7],['Télécommunications',8],['Commerce',9],['Transport',4],['Défense',5]
];

const sources = [
  ['Cybercriminels',30],['Nation-État',20],['Groupe de hackers',20],
  ['Hacktivistes',10],['Insider',10],['Inconnu',10]
];

const vulns = ['Mots de passe faibles','Logiciels non patchés','Vulnérabilité zero-day',
  'Mauvaise configuration','Ingénierie sociale','Absence de chiffrement','API non sécurisée','Accès non autorisé'];

const defenses = ['Pare-feu','IDS/IPS','Chiffrement','Authentification multifacteur',
  'EDR','SIEM','Sauvegarde et restauration','Formation et sensibilisation','Segmentation réseau','Analyse forensique'];

const lossRange = {
  'Phishing':[0.1,50],'DDoS':[0.5,30],'Ransomware':[1,200],'Malware':[0.5,80],
  'Injection SQL':[0.2,40],'Man-in-the-Middle':[0.1,25],'Zero-Day':[5,500],'Spear Phishing':[1,100]
};
const userRange = {
  'Phishing':[100,5e6],'DDoS':[1000,1e7],'Ransomware':[50,1e6],'Malware':[500,8e6],
  'Injection SQL':[1000,2e7],'Man-in-the-Middle':[10,5e5],'Zero-Day':[100,1.5e7],'Spear Phishing':[10,1e5]
};

const perYear = {2015:80,2016:95,2017:110,2018:130,2019:150,2020:180,2021:200,2022:220,2023:240,2024:260};

const rows = [];
for (let year = 2015; year <= 2024; year++) {
  const yi = year - 2015;
  for (let i = 0; i < perYear[year]; i++) {
    const country = weightedChoice(countries.map(c=>c[0]), countries.map(c=>c[1]));
    const atk = weightedChoice(attackTypes, attackTypes.map(t=>attackWeights[t][yi]));
    const ind = weightedChoice(industries.map(x=>x[0]), industries.map(x=>x[1]));
    const src = weightedChoice(sources.map(x=>x[0]), sources.map(x=>x[1]));
    const ym = 1 + yi * 0.15;
    const loss = (rand(lossRange[atk][0], lossRange[atk][1]) * ym).toFixed(2);
    const users = Math.round(Math.exp(rand(Math.log(userRange[atk][0]), Math.log(userRange[atk][1]))));
    let resTime = atk === 'Ransomware' ? rand(24,720) : atk === 'Zero-Day' ? rand(48,500) : rand(2,168);
    rows.push([country,year,atk,ind,src,loss,users,resTime.toFixed(1),choice(vulns),choice(defenses)]);
  }
}

const headers = 'Country,Year,Attack Type,Target Industry,Attack Source,Financial Loss (Millions),Number of Affected Users,Incident Resolution Time (Hours),Security Vulnerability Type,Defense Mechanism Used';
const csv = headers + '\n' + rows.map(r => r.map(v => String(v).includes(',') ? `"${v}"` : v).join(',')).join('\n');
fs.writeFileSync(path.join(__dirname, 'cybersecurity_threats.csv'), csv, 'utf8');
console.log(`Generated ${rows.length} incidents`);
