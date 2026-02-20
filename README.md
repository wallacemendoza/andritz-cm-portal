# ANDRITZ Condition Monitoring Portal

> A high-tech, industrial-grade web application for ANDRITZ paper mill condition monitoring operations.

![Status](https://img.shields.io/badge/Status-Active-00ff88?style=flat-square&logo=circle)
![React](https://img.shields.io/badge/React-18.2-00c8ff?style=flat-square&logo=react)
![Version](https://img.shields.io/badge/Version-2.0.0-ff6b35?style=flat-square)

---

## Overview

The ANDRITZ CM Portal is a React-based single-page application that centralizes condition monitoring operations across multiple paper mill facilities. It provides field technicians and engineers with a unified platform for managing work orders, accessing vibration route drawings, and completing standardized maintenance forms with automatic PDF generation.

---

## Features

### 🏭 Multi-Mill Dashboard
- **Clearwater Paper** – Augusta, GA
- **Graphic Packaging International** – Macon, GA
- **New Indy Container Board** – Catawba, SC

### 📋 Work Orders
- Create, track, and update maintenance work orders
- Fields: WO Number (auto-generated), opened by, date, asset name, reason, priority, status, and file attachments
- Filter by status (Open, In-Progress, Completed, On-Hold) and search by keyword
- Status updates with live color-coded badges
- Persistent storage via localStorage (no backend required)

### 🗺️ Route Drawings
- Hierarchical area/sub-area/floor navigation tree
- Interactive SVG vibration route maps (currently includes Pulp #3 – 5th Floor for CWP Augusta)
- Asset hover tooltips showing IDs and types
- Visual route path with directional arrows
- Legend for in-route / not-in-route / missing ID assets
- Placeholder state for floors without uploaded drawings

### 📄 Forms (Auto PDF Generation)
All forms generate branded ANDRITZ PDFs via `jsPDF`:

| Form | Description |
|---|---|
| **Condition Monitor Form** | Vibration analysis, diagnosis, readings, recommendations |
| **Post Maintenance Form** | Pre/post readings, parts replaced, work performed |
| **RCFA Form** | Root Cause Failure Analysis with 5 Whys methodology |
| **Safety Form** | PPE checklist, hazard ID, control measures, sign-off |

---

## Architecture

```
andritz-cm-portal/
├── public/
│   └── index.html               # App shell with Google Fonts (Orbitron, Rajdhani, JetBrains Mono)
├── src/
│   ├── index.js                 # React entry point
│   ├── index.css                # Global CSS (custom properties, utility classes, animations)
│   ├── App.js                   # Root component with React Router
│   ├── data/
│   │   └── mills.js             # Mill configuration: areas, subareas, floors, sample reports
│   ├── hooks/
│   │   └── useLocalStorage.js   # Persistent storage hook for work orders
│   ├── utils/
│   │   └── pdfGenerator.js      # jsPDF-based PDF generation for all 4 form types
│   └── pages/
│       ├── MillSelector.js      # Landing page — facility selection
│       ├── MillDashboard.js     # Per-mill shell with tab navigation + Overview tab
│       ├── WorkOrders.js        # Work order CRUD with filtering and modal forms
│       ├── DrawingsTab.js       # Route map browser with SVG drawing viewer
│       └── FormsTab.js          # Form cards + fill-out modals → PDF generation
├── package.json
└── README.md
```

### Data Flow

```
MillSelector → navigate to /mill/:millId
MillDashboard → reads MILLS[millId] config → renders active tab
  ├── Overview    → static mill stats
  ├── WorkOrders  → useLocalStorage(`wo_${millId}`) ← persisted to browser
  ├── DrawingsTab → reads AREA_TREE, renders SVG maps
  └── FormsTab    → form modals → pdfGenerator.js → triggers browser download
```

### Key Design Decisions

- **No backend required** – All data is stored in `localStorage`, making it instantly deployable as a static site
- **SVG-based drawings** – Route maps are rendered as interactive SVGs, not raster images, enabling tooltips and future interactivity
- **CSS-only animations** – Uses CSS custom properties and keyframes instead of a heavy animation library
- **Clip-path styling** – The distinctive chamfered corners are achieved with CSS `clip-path`, not images or borders
- **Consistent color system** – Each mill has its own brand color defined in `mills.js`, propagated through props

---

## Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **npm** v8 or higher
- VSCode (recommended)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR-USERNAME/andritz-cm-portal.git
cd andritz-cm-portal

# 2. Install dependencies
npm install

# 3. Start development server
npm start
```

The app will open at `http://localhost:3000`.

### Build for Production

```bash
npm run build
```

Output goes to `build/` — deploy to any static host (GitHub Pages, Netlify, Vercel, S3).

---

## VSCode Setup (Recommended)

Install these extensions for the best experience:

- **ES7+ React/Redux/React-Native snippets** (`dsznajder.es7-react-js-snippets`)
- **Prettier – Code formatter** (`esbenp.prettier-vscode`)
- **Auto Rename Tag** (`formulahendry.auto-rename-tag`)
- **Path Intellisense** (`christian-kohler.path-intellisense`)

### Recommended `settings.json` additions

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "emmet.includeLanguages": { "javascript": "javascriptreact" }
}
```

---

## Adding New Drawings

1. Open `src/pages/DrawingsTab.js`
2. Add your drawing key to the `HAS_DRAWING` object:
   ```js
   const HAS_DRAWING = {
     'clearwater-augusta-Pulp-Pulp 3-5th Floor': true,
     'clearwater-augusta-Pulp-Pulp 3-Ground Floor 1': true,  // ← add this
   };
   ```
3. Create a new SVG map component (e.g., `Pulp3GroundFloor1Map`)
4. Add a conditional render inside the `hasDrawing` block

---

## Adding New Mills

1. Open `src/data/mills.js`
2. Add a new entry to the `MILLS` object following the existing pattern:
   ```js
   'my-mill-id': {
     id: 'my-mill-id',
     name: 'Full Mill Name',
     shortName: 'Short Name',
     location: 'City, ST',
     client: 'Client Company',
     color: '#hexcolor',
     accentColor: '#hexcolor',
     areas: { ... }
   }
   ```

---

## Tech Stack

| Package | Purpose |
|---|---|
| React 18 | UI framework |
| React Router v6 | Client-side routing |
| jsPDF + jspdf-autotable | PDF generation |
| react-hot-toast | Toast notifications |
| date-fns | Date formatting |
| uuid | Unique ID generation |

---

## License

Proprietary — ANDRITZ Internal Use Only.

---

*Built for ANDRITZ Condition Monitoring · Paper Mill Operations*
