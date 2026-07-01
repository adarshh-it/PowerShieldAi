/**
 * PowerShield AI Priority Engine
 * Manages energy generation, consumption, tier-based allocation, and battery/hydrogen state of charge simulations.
 */

// Weather multiplier configuration
const WEATHER_MULTIPLIERS = {
  sunny: { solar: 1.2, wind: 0.8 },
  partly_cloudy: { solar: 0.9, wind: 0.9 },
  overcast: { solar: 0.5, wind: 1.0 },
  stormy: { solar: 0.1, wind: 1.5 },
  calm_night: { solar: 0.0, wind: 0.2 }
};

// Define consumer items and their mapping to Tiers
const TIER_MAPPING = {
  tier1: {
    name: "Tier 1: Critical Life Support",
    importance: 1,
    items: {
      tier1_icu: "ICU Departments",
      tier1_er: "Emergency Rooms",
      tier1_lifesupport: "Ventilators & Life Support"
    }
  },
  tier2: {
    name: "Tier 2: Clinical Operations",
    importance: 2,
    items: {
      tier2_operating: "Operating Theatres",
      tier2_medequipment: "Clinical Diagnostic Equipment"
    }
  },
  tier3: {
    name: "Tier 3: Water Sanitation",
    importance: 3,
    items: {
      tier3_watertreatment: "Water Treatment Facilities"
    }
  },
  tier4: {
    name: "Tier 4: Critical Infrastructure",
    importance: 4,
    items: {
      tier4_communication: "Emergency Telecom Units"
    }
  },
  tier5: {
    name: "Tier 5: Support Operations",
    importance: 5,
    items: {
      tier5_admin: "Administrative & Billing Systems"
    }
  }
};

/**
 * Executes the Priority Engine calculation.
 * @param {Object} db - The raw db.json content
 * @param {number} timeStepSeconds - Simulated time elapsed since last tick
 * @returns {Object} Updated database state and computed metrics
 */
export function runPriorityEngine(db, timeStepSeconds = 5) {
  const telemetry = { ...db.telemetry };
  const demands = { ...db.demands };
  let alerts = [ ...db.alerts ];

  // 1. Calculate generation based on weather & disaster mode multipliers
  const weatherCfg = WEATHER_MULTIPLIERS[telemetry.weather] || WEATHER_MULTIPLIERS.partly_cloudy;
  let solarGen = telemetry.solarBase * weatherCfg.solar;
  let windGen = telemetry.windBase * weatherCfg.wind;

  // Apply Disaster Mode adjustments:
  // - Solar drops by 50%
  // - Wind drops by 30%
  if (telemetry.disasterMode) {
    solarGen *= 0.5;
    windGen *= 0.7;
  }

  const totalRenewableGen = solarGen + windGen; // kW

  // Apply Disaster Mode demand adjustments (40% increase)
  const demandMultiplier = telemetry.disasterMode ? 1.4 : 1.0;
  
  // Calculate demands
  const consumerDemands = [];
  let totalRequestedPower = 0;

  for (const [tierKey, tierInfo] of Object.entries(TIER_MAPPING)) {
    for (const [itemKey, itemName] of Object.entries(tierInfo.items)) {
      const baseReq = demands[itemKey] || 0;
      const requested = baseReq * demandMultiplier;
      totalRequestedPower += requested;
      consumerDemands.push({
        id: itemKey,
        name: itemName,
        tierKey,
        tierName: tierInfo.name,
        importance: tierInfo.importance,
        requestedPower: parseFloat(requested.toFixed(1)),
        allocatedPower: 0,
        status: "Offline"
      });
    }
  }

  const netPower = totalRenewableGen - totalRequestedPower; // kW

  // 2. Perform energy state of charge simulations for the time step
  const batteryMaxCapacityKwh = telemetry.batteryCapacity; // e.g. 1000 kWh
  const hydrogenMaxCapacityKg = telemetry.hydrogenCapacity; // e.g. 100 kg
  const hydrogenKwhPerKg = 33.3; // Approx electrical conversion equivalent
  
  let currentBatterySoc = telemetry.batterySoc;
  let currentHydrogenReserves = telemetry.hydrogenReserves;

  const currentBatteryKwh = (currentBatterySoc / 100) * batteryMaxCapacityKwh;
  const currentHydrogenKwh = currentHydrogenReserves * hydrogenKwhPerKg;

  // Recalculate available active power source limit dynamically
  let activePowerSupplyRate = totalRenewableGen; // kW
  let batteryMaxDischargeRate = 0;
  let hydrogenMaxDischargeRate = 0;

  if (telemetry.gridOnline) {
    activePowerSupplyRate = totalRequestedPower; // Grid covers everything
  } else {
    // Dynamic max discharge rate scaled by SOC to trigger load shedding under high demand
    batteryMaxDischargeRate = currentBatterySoc > 0.5 ? (currentBatterySoc / 100) * 150 : 0;
    hydrogenMaxDischargeRate = currentHydrogenReserves > 0.5 ? (currentHydrogenReserves / telemetry.hydrogenCapacity) * 100 : 0;
    activePowerSupplyRate += batteryMaxDischargeRate + hydrogenMaxDischargeRate;
  }

  // 3. AI Allocation logic:
  // Allocate the activePowerSupplyRate to consumers according to tier priority
  let pool = activePowerSupplyRate;
  
  // Sort consumer demands by importance (ascending: 1 is top, 5 is bottom)
  const sortedConsumers = [...consumerDemands].sort((a, b) => a.importance - b.importance);

  // Debug logs header
  console.log(`\n=== [AI Engine Debug] Available Power: ${activePowerSupplyRate.toFixed(1)} kW | Total Demand: ${totalRequestedPower.toFixed(1)} kW ===`);

  for (const consumer of sortedConsumers) {
    if (pool >= consumer.requestedPower) {
      consumer.allocatedPower = consumer.requestedPower;
      consumer.status = "Fully Powered";
      pool -= consumer.requestedPower;
    } else if (pool > 0) {
      consumer.allocatedPower = parseFloat(pool.toFixed(1));
      consumer.status = "Partially Powered";
      pool = 0;
    } else {
      consumer.allocatedPower = 0;
      consumer.status = "Shedded";
    }
    // Debug log for each tier consumer allocation decision
    console.log(`  - Tier ${consumer.importance} [${consumer.name}]: Req=${consumer.requestedPower} kW, Alloc=${consumer.allocatedPower} kW, Status=${consumer.status} (Remaining Pool: ${pool.toFixed(1)} kW)`);
  }

  // Calculate overall summary metrics
  const totalAllocatedPower = consumerDemands.reduce((sum, c) => sum + c.allocatedPower, 0);
  const powerShortfall = Math.max(0, totalRequestedPower - totalAllocatedPower);
  const statusSummary = powerShortfall === 0 ? "Normal Operations" : (totalAllocatedPower > 0 ? "Degraded Service" : "Grid Outage / System Shutdown");

  // Final allocation debug log
  console.log(`=== [AI Engine Debug] Final Allocation: ${totalAllocatedPower.toFixed(1)} / ${totalRequestedPower.toFixed(1)} kW [${statusSummary}] ===\n`);

  // 4. Physical Storage Updates (calculated based on ACTUAL allocated deficit)
  let gridDraw = 0;
  let storageState = "idle"; // charging, discharging, idle
  const actualDeficitKw = Math.max(0, totalAllocatedPower - totalRenewableGen);
  const timeStepHours = timeStepSeconds / 3600;

  if (telemetry.gridOnline) {
    gridDraw = actualDeficitKw;
    storageState = "idle";
  } else {
    if (actualDeficitKw > 0) {
      storageState = "discharging";
      const deficitKwhNeeded = actualDeficitKw * timeStepHours;

      if (currentBatteryKwh >= deficitKwhNeeded) {
        // Battery can fully handle the deficit
        const newBatteryKwh = currentBatteryKwh - deficitKwhNeeded;
        currentBatterySoc = (newBatteryKwh / batteryMaxCapacityKwh) * 100;
      } else {
        // Battery drained completely, use remaining battery, and then use hydrogen
        currentBatterySoc = 0;
        const remainingDeficitKwh = deficitKwhNeeded - currentBatteryKwh;
        const hydrogenKwhNeeded = remainingDeficitKwh;

        if (currentHydrogenKwh >= hydrogenKwhNeeded) {
          // Hydrogen fuel cell handles the rest
          const newHydrogenKwh = currentHydrogenKwh - hydrogenKwhNeeded;
          currentHydrogenReserves = newHydrogenKwh / hydrogenKwhPerKg;
        } else {
          // Hydrogen also completely drained!
          currentHydrogenReserves = 0;
        }
      }
    } else {
      // Surplus power charges battery & hydrogen
      const surplusKw = Math.abs(totalRenewableGen - totalAllocatedPower);
      const surplusKwhAvailable = surplusKw * timeStepHours;

      if (surplusKwhAvailable > 0) {
        storageState = "charging";
        const batterySpaceKwh = batteryMaxCapacityKwh - currentBatteryKwh;
        
        if (surplusKwhAvailable <= batterySpaceKwh) {
          const newBatteryKwh = currentBatteryKwh + surplusKwhAvailable;
          currentBatterySoc = (newBatteryKwh / batteryMaxCapacityKwh) * 100;
        } else {
          currentBatterySoc = 100;
          const excessKwh = surplusKwhAvailable - batterySpaceKwh;
          const hydrogenKgProduced = excessKwh / hydrogenKwhPerKg;
          currentHydrogenReserves = Math.min(hydrogenMaxCapacityKg, currentHydrogenReserves + hydrogenKgProduced);
        }
      }
    }
  }

  // Sync state back
  telemetry.batterySoc = parseFloat(currentBatterySoc.toFixed(2));
  telemetry.hydrogenReserves = parseFloat(currentHydrogenReserves.toFixed(2));

  // 5. Predictive Analytics
  // Compute depletion rates based on actual draw deficit
  let remainingHours = 999;
  let batteryDepletionHours = 999;
  let hydrogenDepletionHours = 999;

  if (actualDeficitKw > 0 && !telemetry.gridOnline) {
    const batteryDischargeKwhPerHr = Math.min(actualDeficitKw, batteryMaxDischargeRate);
    batteryDepletionHours = batteryDischargeKwhPerHr > 0 ? (currentBatteryKwh / batteryDischargeKwhPerHr) : 999;

    const remainingDeficitForHydrogen = Math.max(0, actualDeficitKw - batteryDischargeKwhPerHr);
    if (remainingDeficitForHydrogen > 0 || currentBatterySoc <= 0.1) {
      const hydrogenDischargeKw = currentBatterySoc <= 0.1 ? actualDeficitKw : remainingDeficitForHydrogen;
      hydrogenDepletionHours = hydrogenDischargeKw > 0 ? (currentHydrogenKwh / hydrogenDischargeKw) : 999;
    }

    if (currentBatterySoc > 0) {
      remainingHours = batteryDepletionHours + (currentBatterySoc <= 0.1 ? 0 : hydrogenDepletionHours);
    } else {
      remainingHours = hydrogenDepletionHours;
    }
  }

  if (remainingHours > 72) remainingHours = 72;

  // Future demand forecast simulation
  const hoursOfForecast = 6;
  const demandForecast = [];
  const generationForecast = [];
  const currentHour = new Date().getHours();

  for (let i = 0; i < hoursOfForecast; i++) {
    const hr = (currentHour + i) % 24;
    const demandFactor = 1.0 + 0.3 * Math.sin((hr - 6) * Math.PI / 12) + (Math.random() * 0.05 - 0.025);
    const genFactor = (hr >= 6 && hr <= 18) ? Math.sin((hr - 6) * Math.PI / 12) : 0.05;
    
    demandForecast.push({
      time: `${hr}:00`,
      value: parseFloat((totalRequestedPower * demandFactor).toFixed(1))
    });
    generationForecast.push({
      time: `${hr}:00`,
      value: parseFloat((totalRenewableGen * (0.8 + 0.4 * genFactor)).toFixed(1))
    });
  }

  // 6. Resilience Score (0-100) Formula
  let resilienceScore = 0;
  
  // A. Grid Connected Component: Max 40 points
  const gridPoints = telemetry.gridOnline ? 40 : 10;
  resilienceScore += gridPoints;

  // B. Battery SOC Component: Max 30 points
  const batteryPoints = currentBatterySoc * 0.3;
  resilienceScore += batteryPoints;

  // C. Hydrogen reserves Component: Max 20 points
  const hydrogenPoints = (currentHydrogenReserves / telemetry.hydrogenCapacity) * 20;
  resilienceScore += hydrogenPoints;

  // D. Power Balance Component: Max 10 points
  let balancePoints = 0;
  if (totalRenewableGen >= totalRequestedPower) {
    balancePoints = 10;
  } else {
    balancePoints = (totalRenewableGen / totalRequestedPower) * 10;
  }
  resilienceScore += balancePoints;

  // E. Disaster Mode Modifier: Subtract 15 points
  if (telemetry.disasterMode) {
    resilienceScore -= 15;
  }

  resilienceScore = Math.max(0, Math.min(100, Math.round(resilienceScore)));

  let resilienceLabel = "Stable";
  if (resilienceScore >= 90) resilienceLabel = "Excellent";
  else if (resilienceScore >= 70) resilienceLabel = "Stable";
  else if (resilienceScore >= 50) resilienceLabel = "Warning";
  else resilienceLabel = "Critical";

  // 7. AI Recommendation Engine
  const aiRecommendations = [];

  // Rule 1: Check Life Support Status (Tier 1)
  const tier1Items = sortedConsumers.filter(c => c.tierKey === 'tier1');
  const allTier1Powered = tier1Items.every(c => c.status === 'Fully Powered');
  if (allTier1Powered) {
    aiRecommendations.push({
      text: "✓ Tier 1 critical life support loads are fully protected and operational.",
      severity: "success",
      category: "Life Safety"
    });
  } else {
    aiRecommendations.push({
      text: "❌ CRITICAL: Tier 1 life support systems are compromised. Immediately reduce all other system loads!",
      severity: "danger",
      category: "Life Safety"
    });
  }

  // Rule 2: Generation surplus/deficit
  if (netPower >= 0) {
    aiRecommendations.push({
      text: `✓ Renewable generation exceeds demand by ${netPower.toFixed(1)} kW. Excess power is charging storage reserves.`,
      severity: "success",
      category: "Generation"
    });
  } else {
    const deficitAmount = Math.abs(netPower).toFixed(1);
    if (telemetry.gridOnline) {
      aiRecommendations.push({
        text: `ℹ️ Local generation falls short by ${deficitAmount} kW. Grid backup is currently covering the deficit.`,
        severity: "info",
        category: "Generation"
      });
    } else {
      aiRecommendations.push({
        text: `⚠ Local generation falls short by ${deficitAmount} kW. Outage is active; drawing from active storage reserves.`,
        severity: "warning",
        category: "Generation"
      });
    }
  }

  // Rule 3: Battery Level warnings
  if (telemetry.batterySoc < 25) {
    const hoursToExtend = 8;
    aiRecommendations.push({
      text: `⚠ Battery storage is critically low (${telemetry.batterySoc}%). Consider reducing Tier 5 loads by 15% to extend backup duration by ${hoursToExtend} hours.`,
      severity: "danger",
      category: "Storage"
    });
  }

  // Rule 4: Hydrogen reserves
  if (telemetry.hydrogenReserves < 20) {
    aiRecommendations.push({
      text: `⚠ Hydrogen reserves are approaching critical threshold (${telemetry.hydrogenReserves} kg). Limit fuel cell activation cycles.`,
      severity: "warning",
      category: "Storage"
    });
  }

  // Rule 5: Grid risks
  if (telemetry.weather === 'stormy' && telemetry.gridOnline) {
    aiRecommendations.push({
      text: "⚠ Alert: Stormy meteorological profile active. Elevated main electrical grid outage risk detected.",
      severity: "warning",
      category: "Grid Security"
    });
  } else if (!telemetry.gridOnline) {
    aiRecommendations.push({
      text: "❌ Outage active: System disconnected from utility grid. Relying on autonomous microgrid reserves.",
      severity: "danger",
      category: "Grid Security"
    });
  }

  // Rule 6: Load shedding alerts
  const totalShedded = sortedConsumers.filter(c => c.status === "Shedded").length;
  if (totalShedded > 0) {
    aiRecommendations.push({
      text: `ℹ️ AI Engine has shed ${totalShedded} lower-priority load(s) to conserve remaining battery life.`,
      severity: "info",
      category: "Engine Action"
    });
  }

  // 8. Alert Generation
  const newAlerts = [];
  alerts.forEach(alert => {
    if (alert.acknowledged) {
      newAlerts.push(alert);
    }
  });

  const addSystemAlert = (type, source, message) => {
    const id = `alert-${source.toLowerCase().replace(/\s+/g, '-')}-${type}`;
    const exists = alerts.find(a => a.id === id);
    if (exists && exists.acknowledged) {
      newAlerts.push(exists);
    } else {
      newAlerts.push({
        id,
        timestamp: new Date().toISOString(),
        type,
        source,
        message,
        acknowledged: false
      });
    }
  };

  // Grid Outage alert
  if (!telemetry.gridOnline) {
    addSystemAlert("danger", "Grid Monitor", "CRITICAL Outage: Facility is operating on isolated microgrid.");
  }

  // Battery State warnings
  if (telemetry.batterySoc < 20 && telemetry.batterySoc > 5) {
    addSystemAlert("warning", "Battery Storage", `Low battery warning: SoC is at ${telemetry.batterySoc}%.`);
  } else if (telemetry.batterySoc <= 5) {
    addSystemAlert("danger", "Battery Storage", "CRITICAL Battery Level: Battery backup is near exhaustion.");
  }

  // Hydrogen State warning
  if (telemetry.hydrogenReserves < 15) {
    addSystemAlert("warning", "Hydrogen Storage", `Low hydrogen backup: Reserves are at ${telemetry.hydrogenReserves} kg.`);
  }

  // Load shedding warnings
  const totalPartial = sortedConsumers.filter(c => c.status === "Partially Powered").length;
  if (totalShedded > 0) {
    addSystemAlert("danger", "Load Controller", `CRITICAL: Energy shedding active. ${totalShedded} low-priority system(s) offline.`);
  } else if (totalPartial > 0) {
    addSystemAlert("warning", "Load Controller", `Degraded Power: ${totalPartial} system(s) operating on partial allocation.`);
  }

  // Disaster Mode Alert
  if (telemetry.disasterMode) {
    addSystemAlert("danger", "Disaster Protocol", "Disaster Mode active: Generation capacity restricted, demand inflated.");
  }

  // Update db object values
  return {
    updatedDb: {
      telemetry,
      demands,
      alerts: newAlerts
    },
    metrics: {
      totalRenewableGen: parseFloat(totalRenewableGen.toFixed(1)),
      solarGen: parseFloat(solarGen.toFixed(1)),
      windGen: parseFloat(windGen.toFixed(1)),
      totalRequestedPower: parseFloat(totalRequestedPower.toFixed(1)),
      totalAllocatedPower: parseFloat(totalAllocatedPower.toFixed(1)),
      powerShortfall: parseFloat(powerShortfall.toFixed(1)),
      gridDraw: parseFloat(gridDraw.toFixed(1)),
      storageState,
      statusSummary,
      remainingHours: parseFloat(remainingHours.toFixed(1)),
      batteryDepletionHours: parseFloat(batteryDepletionHours.toFixed(1)),
      hydrogenDepletionHours: parseFloat(hydrogenDepletionHours.toFixed(1)),
      allocationMatrix: sortedConsumers,
      resilienceScore,
      resilienceLabel,
      aiRecommendations,
      forecast: {
        demandForecast,
        generationForecast
      }
    }
  };
}
