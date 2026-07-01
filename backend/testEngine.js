import { runPriorityEngine } from './engine/priorityEngine.js';

const baseDb = {
  telemetry: {
    solarBase: 150.0,
    windBase: 100.0,
    batteryCapacity: 1000.0,
    batterySoc: 75.0,
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

// Scenario 1: Grid Online
console.log("=== SCENARIO 1: Grid Online ===");
const db1 = JSON.parse(JSON.stringify(baseDb));
const res1 = runPriorityEngine(db1, 4);
console.log("Status Summary:", res1.metrics.statusSummary);
console.log("Resilience Score:", res1.metrics.resilienceScore);
console.log("AI Recommendations:", res1.metrics.aiRecommendations.map(r => r.text));

// Scenario 2: Grid Offline
console.log("\n=== SCENARIO 2: Grid Offline ===");
const db2 = JSON.parse(JSON.stringify(baseDb));
db2.telemetry.gridOnline = false;
const res2 = runPriorityEngine(db2, 4);
console.log("Status Summary:", res2.metrics.statusSummary);
console.log("Resilience Score:", res2.metrics.resilienceScore);

// Scenario 3: Disaster Mode
console.log("\n=== SCENARIO 3: Disaster Mode ===");
const db3 = JSON.parse(JSON.stringify(baseDb));
db3.telemetry.gridOnline = false;
db3.telemetry.disasterMode = true;
const res3 = runPriorityEngine(db3, 4);
console.log("Status Summary:", res3.metrics.statusSummary);
console.log("Resilience Score:", res3.metrics.resilienceScore);

// Scenario 4: High Demand
console.log("\n=== SCENARIO 4: High Demand ===");
const db4 = JSON.parse(JSON.stringify(baseDb));
db4.telemetry.gridOnline = false;
db4.telemetry.batterySoc = 0.0;
db4.telemetry.hydrogenReserves = 0.0;
db4.demands.tier1_icu = 200.0;
db4.demands.tier5_admin = 150.0;
const res4 = runPriorityEngine(db4, 4);
console.log("Status Summary:", res4.metrics.statusSummary);
console.log("Resilience Score:", res4.metrics.resilienceScore);
console.log("Allocations:");
res4.metrics.allocationMatrix.forEach(c => {
  console.log(`  - ${c.name} (${c.tierKey}): Alloc=${c.allocatedPower} kW [${c.status}]`);
});
