# 🛡️ CyberPulse — Dashboard Interactif des Menaces Cybersécurité Mondiales

> Visualisation interactive des menaces cybersécurité mondiales (2015–2024) réalisée avec **D3.js v7**

![D3.js](https://img.shields.io/badge/D3.js-v7-orange?logo=d3.js)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

---

## 📋 Description

**CyberPulse** est un tableau de bord interactif de visualisation de données qui explore et analyse les menaces cybersécurité à l'échelle mondiale entre 2015 et 2024. Le projet met en évidence les tendances, les patterns d'attaque, les industries les plus ciblées et les flux de menaces à travers **6 visualisations D3.js interconnectées**.

### 🎯 Objectifs

- Identifier les **tendances temporelles** des cyberattaques (croissance du ransomware, évolution du phishing)
- Visualiser la **répartition géographique** des incidents à l'échelle mondiale
- Analyser l'**impact financier** et le nombre d'utilisateurs affectés par type d'attaque
- Comparer les **profils de vulnérabilité** des industries ciblées
- Cartographier les **flux d'attaque** : de la source au type d'attaque jusqu'à l'industrie cible

---

## 🖥️ Aperçu

### Vue d'ensemble du dashboard
Le dashboard présente un design sombre de type « centre de commande cyber » avec des panneaux glassmorphism, des accents néon (cyan, magenta, vert) et des animations subtiles.

### Les 6 visualisations

| # | Visualisation | Type D3.js | Description |
|---|--------------|-----------|-------------|
| 1 | 🌍 **Carte des Menaces** | Choropleth | Distribution géographique des incidents par pays |
| 2 | 📈 **Évolution Temporelle** | Stacked Area | Tendances des types d'attaque au fil du temps |
| 3 | 🏢 **Industries Ciblées** | Treemap | Répartition des incidents par secteur d'activité |
| 4 | 💰 **Impact Financier** | Bubble Chart | Volume et impact par type d'attaque |
| 5 | 🎯 **Profil de Vulnérabilité** | Radar Chart | Comparaison multicritères des industries |
| 6 | 🔗 **Flux d'Attaques** | Sankey Diagram | Parcours : Source → Type d'attaque → Industrie cible |

---

## ⚡ Interactions implémentées

| Interaction | Description | Graphique(s) |
|------------|-------------|-------------|
| **Hover / Tooltip** | Information détaillée au survol | Tous les graphiques |
| **Clic / Filtrage** | Filtrage croisé entre tous les graphiques | Carte, Treemap, Bubble |
| **Zoom / Pan** | Navigation libre sur la carte | Carte mondiale |
| **Brush** | Sélection de plage temporelle par brossage | Évolution temporelle |
| **Drag** | Déplacement des bulles | Bubble Chart |
| **Drill-down** | Exploration hiérarchique (industrie → types d'attaque) | Treemap |
| **Filtres globaux** | Dropdowns : période, type d'attaque, industrie, pays | Barre de filtres |
| **Réinitialisation** | Remise à zéro de tous les filtres | Bouton « Réinitialiser » |

---

## 🚀 Installation et lancement

### Prérequis

- Un navigateur web moderne (Chrome, Firefox, Edge)
- Python 3.x **ou** Node.js (pour le serveur local)

### Étapes

1. **Cloner ou télécharger** le projet :
   ```bash
   git clone <url-du-repo>
   cd cyberpulse-d3
   ```

2. **(Optionnel) Régénérer les données** :
   ```bash
   node data/generate.js
   ```
   > Le fichier `data/cybersecurity_threats.csv` est déjà inclus (1 665 incidents).

3. **Lancer un serveur local** :
   ```bash
   # Avec Python
   python -m http.server 8080

   # Ou avec Node.js
   npx http-server . -p 8080
   ```

4. **Ouvrir dans le navigateur** :
   ```
   http://localhost:8080
   ```

> ⚠️ **Important** : Un serveur local est nécessaire car le projet utilise des modules ES6 (`import/export`) qui ne fonctionnent pas avec le protocole `file://`.

---

## 📁 Structure du projet

```
cyberpulse-d3/
│
├── index.html                      # Page principale du dashboard
├── README.md                       # Ce fichier
│
├── css/
│   └── style.css                   # Thème dark, glassmorphism, animations
│
├── js/
│   ├── main.js                     # Point d'entrée, état global, cross-filtering
│   ├── utils.js                    # Utilitaires (couleurs, tooltip, formatage)
│   └── charts/
│       ├── choropleth.js           # Carte mondiale (d3.geoNaturalEarth1)
│       ├── stackedArea.js          # Graphique en aires empilées (d3.stack)
│       ├── treemap.js              # Treemap hiérarchique (d3.treemap)
│       ├── bubbleChart.js          # Graphique à bulles (d3.forceSimulation)
│       ├── radarChart.js           # Graphique radar (SVG paths)
│       └── sankey.js               # Diagramme Sankey (d3-sankey)
│
└── data/
    ├── generate.js                 # Script Node.js de génération des données
    └── cybersecurity_threats.csv   # Jeu de données (1 665 incidents)
```

---

## 📊 Jeu de données

### Source
Données synthétiques générées de manière réaliste à partir de distributions pondérées, simulant le dataset **« Global Cybersecurity Threats 2015–2024 »** disponible sur Kaggle.

### Colonnes

| Colonne | Type | Description |
|---------|------|-------------|
| `Country` | String | Pays de l'incident (30 pays) |
| `Year` | Integer | Année (2015–2024) |
| `Attack Type` | String | Type d'attaque (8 catégories) |
| `Target Industry` | String | Industrie ciblée (10 secteurs) |
| `Attack Source` | String | Origine de l'attaque (6 catégories) |
| `Financial Loss (Millions)` | Float | Pertes financières en millions $ |
| `Number of Affected Users` | Integer | Nombre d'utilisateurs impactés |
| `Incident Resolution Time (Hours)` | Float | Temps de résolution en heures |
| `Security Vulnerability Type` | String | Type de vulnérabilité exploitée |
| `Defense Mechanism Used` | String | Mécanisme de défense déployé |

### Statistiques clés
- **1 665 incidents** générés
- **30 pays** représentés
- **8 types d'attaque** : Phishing, DDoS, Ransomware, Malware, Injection SQL, Man-in-the-Middle, Zero-Day, Spear Phishing
- **10 industries** : Finance, Santé, Technologie, Gouvernement, Éducation, Énergie, Télécommunications, Commerce, Transport, Défense
- **Tendances réalistes** : croissance exponentielle du ransomware, augmentation des incidents au fil du temps

---

## 🛠️ Technologies

| Technologie | Version | Utilisation |
|------------|---------|-------------|
| [D3.js](https://d3js.org/) | v7 | Visualisation de données |
| [d3-sankey](https://github.com/d3/d3-sankey) | v0.12.3 | Diagramme Sankey |
| [TopoJSON](https://github.com/topojson/topojson-client) | v3 | Données géographiques |
| [World Atlas](https://github.com/topojson/world-atlas) | v2 | Carte du monde (countries-110m) |
| HTML5 / CSS3 / ES6+ | — | Structure, style, logique |
| [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) | — | Typographie |

---

## 🔍 Insights principaux

1. **📈 Croissance du Ransomware** : Les attaques ransomware montrent la croissance la plus rapide, passant de ~5% des incidents en 2015 à ~30% en 2024.
2. **🏦 Finance = Cible n°1** : Le secteur financier reste l'industrie la plus ciblée avec le plus grand nombre d'incidents.
3. **💸 Zero-Day = Coût maximal** : Les attaques Zero-Day engendrent les pertes financières les plus élevées par incident.
4. **🌍 USA & Chine en tête** : Les États-Unis et la Chine concentrent le plus grand nombre d'incidents signalés.
5. **⏱️ Ransomware = Résolution longue** : Le temps moyen de résolution est significativement plus élevé pour les attaques ransomware.

---

## 👤 Auteur

Projet réalisé dans le cadre du cours de **Visualisation de Données** — Option 1 : D3.js

---

## 📄 Licence

Ce projet est à usage académique uniquement.
