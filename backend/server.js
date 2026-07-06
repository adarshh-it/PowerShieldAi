import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { runPriorityEngine } from './engine/priorityEngine.js';
import { runPowerShieldSimulation } from './simulationEngine.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory state Cache
let dbState = null;
let currentMetrics = null;

// Read database helper
function readDb() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database file, fallback to default state:', error);
    return {
      telemetry: {
        solarBase: 150.0,
        windBase: 100.0,
        batteryCapacity: 1000.0,
        batterySoc: 80.0,
        hydrogenReserves: 80.0,
        hydrogenCapacity: 100.0,
        gridOnline: true,
        disasterMode: false,
        weather: "partly_cloudy"
      },
      demands: {
        tier1_icu: 50.0,
        tier1_er: 40.0,
        tier1_lifesupport: 30.0,
        tier2_operating: 45.0,
        tier2_medequipment: 35.0,
        tier3_watertreatment: 60.0,
        tier4_communication: 30.0,
        tier5_admin: 25.0
      },
      alerts: []
    };
  }
}

// Write database helper
function writeDb(state) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

// Initialize state
dbState = readDb();

// Run initial engine step
const initialResult = runPriorityEngine(dbState, 0);
dbState = initialResult.updatedDb;
currentMetrics = initialResult.metrics;
writeDb(dbState);

// Background Ticking Simulator - Ticks every 4 seconds
const TICK_INTERVAL_MS = 4000;
setInterval(() => {
  const result = runPriorityEngine(dbState, TICK_INTERVAL_MS / 1000);
  dbState = result.updatedDb;
  currentMetrics = result.metrics;
  writeDb(dbState);
}, TICK_INTERVAL_MS);

// --- API ENDPOINTS ---

// Get general status & metrics
app.get('/api/status', (req, res) => {
  // Always run calculation dynamically to capture any instant edits
  const result = runPriorityEngine(dbState, 0);
  res.json({
    telemetry: dbState.telemetry,
    demands: dbState.demands,
    metrics: result.metrics
  });
});

// Update simulator parameters
app.post('/api/telemetry/simulate', (req, res) => {
  const { solarBase, windBase, batterySoc, hydrogenReserves, gridOnline, disasterMode, weather } = req.body;
  
  if (solarBase !== undefined) dbState.telemetry.solarBase = parseFloat(solarBase);
  if (windBase !== undefined) dbState.telemetry.windBase = parseFloat(windBase);
  if (batterySoc !== undefined) dbState.telemetry.batterySoc = Math.min(100, Math.max(0, parseFloat(batterySoc)));
  if (hydrogenReserves !== undefined) dbState.telemetry.hydrogenReserves = Math.min(dbState.telemetry.hydrogenCapacity, Math.max(0, parseFloat(hydrogenReserves)));
  if (gridOnline !== undefined) dbState.telemetry.gridOnline = !!gridOnline;
  if (weather !== undefined) dbState.telemetry.weather = weather;

  if (disasterMode !== undefined) {
    dbState.telemetry.disasterMode = !!disasterMode;
    // When activating disaster mode, let's turn off the grid connection to simulate an isolated microgrid emergency!
    if (disasterMode === true) {
      dbState.telemetry.gridOnline = false;
    }
  }

  // Recalculate metrics immediately
  const result = runPriorityEngine(dbState, 0);
  dbState = result.updatedDb;
  currentMetrics = result.metrics;
  writeDb(dbState);

  res.json({
    message: "Simulation state updated",
    telemetry: dbState.telemetry,
    metrics: currentMetrics
  });
});

// Update consumer demand loads
app.post('/api/allocation/update-demand', (req, res) => {
  const demands = req.body; // Expect key-value map of updated demands

  for (const [key, val] of Object.entries(demands)) {
    if (dbState.demands[key] !== undefined) {
      dbState.demands[key] = Math.max(0, parseFloat(val));
    }
  }

  // Recalculate metrics immediately
  const result = runPriorityEngine(dbState, 0);
  dbState = result.updatedDb;
  currentMetrics = result.metrics;
  writeDb(dbState);

  res.json({
    message: "Consumer demands updated",
    demands: dbState.demands,
    metrics: currentMetrics
  });
});

// Get Alerts list
app.get('/api/alerts', (req, res) => {
  res.json(dbState.alerts);
});

// Acknowledge alert
app.post('/api/alerts/acknowledge', (req, res) => {
  const { id } = req.body;
  const alertIndex = dbState.alerts.findIndex(a => a.id === id);

  if (alertIndex !== -1) {
    dbState.alerts[alertIndex].acknowledged = true;
    writeDb(dbState);
    res.json({ message: "Alert acknowledged", alerts: dbState.alerts });
  } else {
    res.status(404).json({ error: "Alert not found" });
  }
});

// Reset simulation to standard state
app.post('/api/reset', (req, res) => {
  dbState = {
    telemetry: {
      solarBase: 150.0,
      windBase: 100.0,
      batteryCapacity: 1000.0,
      batterySoc: 80.0,
      hydrogenReserves: 80.0,
      hydrogenCapacity: 100.0,
      gridOnline: true,
      disasterMode: false,
      weather: "partly_cloudy"
    },
    demands: {
      tier1_icu: 50.0,
      tier1_er: 40.0,
      tier1_lifesupport: 30.0,
      tier2_operating: 45.0,
      tier2_medequipment: 35.0,
      tier3_watertreatment: 60.0,
      tier4_communication: 30.0,
      tier5_admin: 25.0
    },
    alerts: [
      {
        id: "alert-1",
        timestamp: new Date().toISOString(),
        type: "info",
        source: "System",
        message: "Simulation parameters reset to default configurations.",
        acknowledged: false
      }
    ]
  };

  const result = runPriorityEngine(dbState, 0);
  dbState = result.updatedDb;
  currentMetrics = result.metrics;
  writeDb(dbState);

  res.json({
    message: "Simulation reset completed",
    telemetry: dbState.telemetry,
    demands: dbState.demands,
    metrics: currentMetrics,
    alerts: dbState.alerts
  });
});
app.get('/api/simulation/run', (req, res) => {
    try {
        const results = runPowerShieldSimulation();
        res.json({ success: true, timeline: results });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});
app.listen(PORT, () => {
  console.log(`PowerShield AI Backend listening on http://localhost:${PORT}`);
});
