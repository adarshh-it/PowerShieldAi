# PowerShield AI — Smart Microgrid Crisis Controller

PowerShield AI is an AI-powered renewable microgrid energy management platform designed to maintain power allocation for critical hospital infrastructure during emergency outages.

## Architecture & Features

The platform monitors **Solar Photovoltaics, Wind Turbines, Lithium Battery Packs, and Hydrogen Fuel Cells**. When the main electrical grid experiences an outage, it acts as an isolated microgrid and runs the **AI Priority Engine** to selectively allocate power according to the importance of facility services.

### Priority Level Allocations

*   **Tier 1: Critical Life Support** (ICU Departments, Emergency Rooms, Ventilators & Life Support) — *Always prioritized, never shed.*
*   **Tier 2: Clinical Operations** (Operating Theatres, Clinical Diagnostic Equipment)
*   **Tier 3: Water Sanitation** (Water Treatment Facilities)
*   **Tier 4: Critical Infrastructure** (Emergency Telecom Units)
*   **Tier 5: Support Operations** (Administrative & Billing Systems) — *First to be shed on power deficit.*

---

## Folder Structure

```
powershield-ai/
├── package.json               # Root config (runs client & server concurrently)
├── README.md                  # Project documentation & instructions
├── backend/
│   ├── package.json           # Express server packages
│   ├── server.js              # Express app endpoints
│   ├── db.json                # Local JSON state database
│   └── engine/
│       └── priorityEngine.js  # Priority allocation & depletion computations
└── frontend/
    ├── package.json           # React, Vite, Tailwind CSS, Recharts, Framer Motion
    ├── vite.config.js         # Port settings & backend dev proxies
    ├── tailwind.config.js     # Glassmorphic themes & dark mode custom styling
    ├── postcss.config.js      # PostCSS configurations
    ├── index.html             # Vite entry point
    └── src/
        ├── main.jsx           # React app entry point
        ├── App.jsx            # Router and Application Layout Shell
        ├── index.css          # Custom neon flows and backdrop blur style directives
        ├── components/
        │   ├── Navigation.jsx # Glassmorphic Sidebar console controls
        │   ├── PremiumCard.jsx# Reusable glass pane widget wrappers
        │   └── AlertItem.jsx  # Pulse warnings and alert acknowledgements
        ├── context/
        │   └── EnergyContext.jsx # Global energy state contexts and simulation hooks
        └── pages/
            ├── LandingPage.jsx        # Credentials product showcase
            ├── Dashboard.jsx          # Metric cards and real-time environment simulation sliders
            ├── ResourceAllocation.jsx # Flow diagram and consumer demand slider knobs
            ├── Analytics.jsx          # Area curves of demand vs generation & reserve timelines
            └── AlertCenter.jsx        # Risk diagnostics and alert acknowledge cards
```

---

## Installation & Setup

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended).

### 1. Set Workspace in VS Code
Open VS Code and set the active workspace to:
`C:\Users\vidus\.gemini\antigravity\scratch\powershield-ai`

### 2. Install Dependencies
Open a terminal in the project root directory and run:
```bash
npm run install:all
```
This automatically installs the required packages for the root workspace, the Express backend, and the React frontend.

### 3. Start the Platform
Run the following command in the root folder to boot both servers concurrently:
```bash
npm run dev
```

*   **Express API Server** launches at: [http://localhost:5000](http://localhost:5000)
*   **React Fronted Client** compiles and launches at: [http://localhost:5173](http://localhost:5173)

---

## API Documentation

- `GET /api/status` — Returns current telemetry parameters, demand values, and calculated metrics.
- `POST /api/telemetry/simulate` — Mutates telemetry parameters like base solar/wind capacity, weather conditions, or grid outage states.
- `POST /api/allocation/update-demand` — Updates the requested kW load of hospital departments.
- `GET /api/alerts` — Pulls active and archived alarms.
- `POST /api/alerts/acknowledge` — Dismisses a warning indicator.
- `POST /api/reset` — Resets simulation variables to standard values.

---

## Demonstration Scenarios

1.  **Standard Test**: The main grid is connected. Adjusting generation sliders on the dashboard updates solar/wind ratios but the grid handles deficits. No loads are shed.
2.  **Blackout Test**: Toggle the **Main Electrical Grid** to offline on the Dashboard. If total renewable generation is less than hospital demand, the system begins draining the battery reserve.
3.  **Discharge & Shedding**: Decrease the battery SOC slider. As the battery depletes to 0%, the fuel cell activates. When hydrogen reserves are exhausted, the AI Priority Engine automatically sheds lower-priority tiers to preserve ICU Life Support.
4.  **Disaster Mode**: Click the red **Activate Disaster Mode** button in the sidebar (or bottom of the Dashboard page). This simulates a catastrophe where weather generation drops and hospital ER/ICU loads increase by 40%. The system immediately triggers priority algorithms, reallocates power, and fires critical alarms in the Alert Center.
