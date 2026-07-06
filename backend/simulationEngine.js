// backend/simulationEngine.js

function runPowerShieldSimulation() {
    // 1. HARDWARE SPECIFICATIONS (ROUND 1 CONSTANTS)
    const SOLAR_CAPACITY = 150.0;       // kW
    const WIND_CAPACITY = 100.0;        // kW
    const BATTERY_MAX_KWH = 1000.0;
    const BATT_EFFICIENCY = 0.95;
    const KG_TO_KWH_EQUIV = 33.3;        
    const FUEL_CELL_EFFICIENCY = 0.60;

    let batteryKwh = BATTERY_MAX_KWH * 0.80; // Start at 80% SoC
    let hydrogenKg = 80.0;               // Initial reserve

    // 2. MULTI-TIER SYSTEM DEMAND PROFILE
    const LOAD_TIERS = {
        Tier_1_Critical: 123.0, // ICU, ER, Life Support
        Tier_2_Theatres: 45.0,  // Operating Rooms
        Tier_3_Water: 60.0,     // Water Sanitation Facility
        Tier_4_Telecom: 30.0,   // Emergency Communications
        Tier_5_Admin: 25.0      // Non-critical Admin Systems
    };

    const HOURS = 168; // 7 Days Simulation
    const simulationLogs = [];

    for (let hour = 1; hour <= HOURS; hour++) {
        let hourOfDay = hour % 24;

        // Disaster Mode: Solar drops by 50%, Wind drops by 30%
        let solarProfile = (hourOfDay >= 6 && hourOfDay <= 18) ? Math.sin((hourOfDay - 6) * Math.PI / 12) : 0;
        let solarGen = SOLAR_CAPACITY * solarProfile * 0.50;

        // Simulated fluctuating wind profile
        let windFactor = 0.3 + Math.random() * 0.6; 
        let windGen = WIND_CAPACITY * windFactor * 0.70;

        let totalRenewableSupply = solarGen + windGen;
        let servedLoads = { ...LOAD_TIERS };
        let currentReservesKwh = batteryKwh + (hydrogenKg * KG_TO_KWH_EQUIV * FUEL_CELL_EFFICIENCY);

        // 3. PRIORITY SHEDDING LOGIC ENGINE
        if (currentReservesKwh < 2500) servedLoads.Tier_5_Admin = 0.0;
        if (currentReservesKwh < 1800) servedLoads.Tier_4_Telecom = 0.0;
        if (currentReservesKwh < 1000) servedLoads.Tier_3_Water = 0.0;
        if (currentReservesKwh < 400)  servedLoads.Tier_2_Theatres = 0.0;

        let totalActiveDemand = Object.values(servedLoads).reduce((a, b) => a + b, 0);
        let netEnergyBalance = totalRenewableSupply - totalActiveDemand;

        // 4. ENERGY FLOW ROUTING
        if (netEnergyBalance >= 0) {
            let availableChargeCapacity = BATTERY_MAX_KWH - batteryKwh;
            if (availableChargeCapacity > 0) {
                let chargeAmount = Math.min(netEnergyBalance, availableChargeCapacity);
                batteryKwh += chargeAmount * BATT_EFFICIENCY;
            }
        } else {
            let deficit = Math.abs(netEnergyBalance);

            // Drain Lithium Battery down to 15% safety floor
            if (batteryKwh > (BATTERY_MAX_KWH * 0.15)) {
                let drawFromBattery = Math.min(deficit, batteryKwh - (BATTERY_MAX_KWH * 0.15));
                batteryKwh -= drawFromBattery;
                deficit -= drawFromBattery;
            }

            // If battery is depleted to its safety floor, engage Hydrogen Fuel Cells
            if (deficit > 0 && hydrogenKg > 0) {
                let kwhNeededFromH2 = deficit / FUEL_CELL_EFFICIENCY;
                let kgConsumed = kwhNeededFromH2 / KG_TO_KWH_EQUIV;

                if (hydrogenKg >= kgConsumed) {
                    hydrogenKg -= kgConsumed;
                    deficit = 0;
                } else {
                    deficit -= (hydrogenKg * KG_TO_KWH_EQUIV * FUEL_CELL_EFFICIENCY);
                    hydrogenKg = 0.0;
                }
            }
        }

        simulationLogs.push({
            hour: hour,
            solarKw: parseFloat(solarGen.toFixed(1)),
            windKw: parseFloat(windGen.toFixed(1)),
            supplyKw: parseFloat(totalRenewableSupply.toFixed(1)),
            demandKw: parseFloat(totalActiveDemand.toFixed(1)),
            batterySoC: parseFloat(((batteryKwh / BATTERY_MAX_KWH) * 100).toFixed(1)),
            hydrogenKg: parseFloat(hydrogenKg.toFixed(1)),
            tier1Status: servedLoads.Tier_1_Critical > 0 ? "ONLINE" : "FAILED",
            sheddingState: {
                t5: servedLoads.Tier_5_Admin > 0 ? "FULLY POWERED" : "SHEDDED",
                t4: servedLoads.Tier_4_Telecom > 0 ? "FULLY POWERED" : "SHEDDED",
                t3: servedLoads.Tier_3_Water > 0 ? "FULLY POWERED" : "SHEDDED",
                t2: servedLoads.Tier_2_Theatres > 0 ? "FULLY POWERED" : "SHEDDED"
            }
        });
    }

    return simulationLogs;
}

export { runPowerShieldSimulation };