import React, { createContext, useContext, useState, useEffect } from 'react';

const EnergyContext = createContext();

export function EnergyProvider({ children }) {
  const [telemetry, setTelemetry] = useState({
    solarBase: 150.0,
    windBase: 100.0,
    batteryCapacity: 1000.0,
    batterySoc: 80.0,
    hydrogenReserves: 80.0,
    hydrogenCapacity: 100.0,
    gridOnline: true,
    disasterMode: false,
    weather: "partly_cloudy"
  });
  
  const [demands, setDemands] = useState({
    tier1_icu: 50.0,
    tier1_er: 40.0,
    tier1_lifesupport: 30.0,
    tier2_operating: 45.0,
    tier2_medequipment: 35.0,
    tier3_watertreatment: 60.0,
    tier4_communication: 30.0,
    tier5_admin: 25.0
  });

  const [metrics, setMetrics] = useState({
    totalRenewableGen: 250,
    solarGen: 150,
    windGen: 100,
    totalRequestedPower: 315,
    totalAllocatedPower: 315,
    powerShortfall: 0,
    gridDraw: 65,
    storageState: "idle",
    statusSummary: "Normal Operations",
    remainingHours: 72,
    batteryDepletionHours: 999,
    hydrogenDepletionHours: 999,
    allocationMatrix: [],
    forecast: { demandForecast: [], generationForecast: [] }
  });

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch status and alerts from backend
  const fetchStatus = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    try {
      // Fetch /api/status which returns telemetry, demands, and computed metrics
      const res = await fetch('/api/status');
      if (!res.ok) throw new Error('Failed to fetch status from server');
      const data = await res.json();
      
      setTelemetry(data.telemetry);
      setDemands(data.demands);
      setMetrics(data.metrics);
      
      // Fetch alerts list
      const alertsRes = await fetch('/api/alerts');
      if (alertsRes.ok) {
        const alertsData = await alertsRes.json();
        setAlerts(alertsData);
      }
      
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to backend service. Running with client mockup fallback.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Poll server state every 3 seconds to animate real-time battery/hydrogen change
  useEffect(() => {
    fetchStatus(true);
    const interval = setInterval(() => {
      fetchStatus(false);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Update simulator parameters
  const updateSimulation = async (params) => {
    try {
      const res = await fetch('/api/telemetry/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
        setMetrics(data.metrics);
        // Refresh alerts
        fetchStatus(false);
      }
    } catch (err) {
      console.error('Simulation update error:', err);
    }
  };

  // Update consumer demand loads
  const updateDemands = async (updatedDemands) => {
    try {
      const res = await fetch('/api/allocation/update-demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedDemands)
      });
      if (res.ok) {
        const data = await res.json();
        setDemands(data.demands);
        setMetrics(data.metrics);
        fetchStatus(false);
      }
    } catch (err) {
      console.error('Demand update error:', err);
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = async (id) => {
    try {
      const res = await fetch('/api/alerts/acknowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Alert acknowledgment error:', err);
    }
  };

  // Trigger Disaster Mode Protocol
  const triggerDisasterMode = async () => {
    await updateSimulation({ disasterMode: true });
  };

  // Reset simulation to default configurations
  const resetSimulation = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
        setDemands(data.demands);
        setMetrics(data.metrics);
        setAlerts(data.alerts);
      }
    } catch (err) {
      console.error('Reset simulation error:', err);
    }
  };

  return (
    <EnergyContext.Provider value={{
      telemetry,
      demands,
      metrics,
      alerts,
      loading,
      error,
      updateSimulation,
      updateDemands,
      acknowledgeAlert,
      triggerDisasterMode,
      resetSimulation,
      refresh: fetchStatus
    }}>
      {children}
    </EnergyContext.Provider>
  );
}

export function useEnergy() {
  return useContext(EnergyContext);
}
