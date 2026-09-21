# Market Pulse

Crée une web app appelée TOP 100 PERFORMERS - MTD.

OBJECTIF :

Une page web qui affiche les 100 actions et ETFs les plus performants depuis le début du mois en cours (du 1er septembre 2026 à aujourd'hui). Pas de fausses données, fetch des vraies données de marché.

DESIGN SYSTEM - INSPIRATION OBLIGATOIRE ELOQWNT.COM :

Tu t'inspires à 100% de eloqwnt.com :

- Fond noir #0A0A0A / blanc cassé #F5F5F3, texte blanc/noir ultra contrasté

- Une seule couleur d'accent : magenta néon #FF2E6A

- Typo énorme, bold, sans-serif style Suisse Int. / Inter. Titres en 80px+, tracking serré.

- Hero minimaliste avec un ticker marquee infini en haut (comme Eloqwnt)

- Layout grille éditoriale, beaucoup de white space, bordures fines 1px

- Dark mode obligatoire, look B2B Tech premium, pas crypto flashy

- Manifeste Eloqwnt adapté : "Most investors see the same gap - between what moved and why it moved."

STRUCTURE DE LA PAGE :

1. HEADER TICKER (style Eloqwnt) :

Marquee infini qui scroll : / TOP MOVER +34.2% / AVG TOP 100 +12.4% / 100 ASSETS TRACKED / SINCE SEP 01 / etc.

2. HERO :

H1 massif : "The 100 assets that closed the gap this month."

Sous-titre : "Actions & ETFs. Performance pure depuis le 1er du mois. Pas d'opinion, que du signal."

Affiche 3 KPIs style Eloqwnt : [Best performer %] [Worst of top 100 %] [Date range]

3. TABLE PRINCIPALE - LE COEUR :

Tableau de 100 lignes, design ultra clean, inspiré d'un terminal.

Colonnes : Rank | Ticker | Name | Type (Stock/ETF badge) | Price Now | Price Sep 1st | Performance % MTD | Sparkline 1 mois | Market Cap | Volume

- Tri par défaut : Performance % DESC

- Performance en vert néon si positif, avec badge +XX.XX%

- Hover = highlight magenta très léger

- Sticky header

4. FILTRES & FONCTIONS (au dessus du tableau) :

- Search par ticker/nom

- Toggle : All / Stocks only / ETFs only

- Filtre secteur (Tech, Energy, etc.)

- Bouton Export CSV

- Bouton Refresh Live Data

5. FOOTER : Disclaimer "Not financial advice. Data for information only." + style Eloqwnt : "The right data at the right moment changes everything."

DATA & LOGIQUE - TRÈS IMPORTANT :

- Performance MTD = ((Prix actuel - Prix clôture 1er jour ouvré du mois) / Prix clôture 1er jour ouvré) * 100

- Source de données : utilise TwelveData API ou Finnhub ou Yahoo Finance API via une edge function. Si pas de clé API, utilise des données mock réalistes mais structure le code pour être plug-and-play avec une vraie API.

- Tu dois gérer le loading state, error state, empty state avec le style Eloqwnt.

- Responsive : table devient cards sur mobile.

TECH STACK :

- React + Tailwind + shadcn/ui

- Recharts pour les sparklines

- Framer Motion pour le marquee ticker et les animations d'entrée

- Design 100% dark, minimal, premium B2B. Pas de couleur partout, seulement le rose pour les % et les hovers.

Le résultat doit ressembler à une page produit d'Eloqwnt, mais pour de la finance. Ultra crédible, ultra pro.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/9c64889b-7ccb-4c6e-9530-eac44b36aacd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
