import React from 'react';
import { 
  Sun, 
  Wind, 
  BatteryCharging, 
  Droplet, 
  AlertTriangle, 
  ToggleLeft, 
  ToggleRight, 
  CloudSun,
  Flame,
  Zap,
  Clock,
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import PremiumCard from '../components/PremiumCard';

export default function Dashboard() {
  const { 
    telemetry, 
    metrics, 
    updateSimulation, 
    triggerDisasterMode, 
    resetSimulation 
  } = useEnergy();

  const handleGridToggle = () => {
    updateSimulation({ gridOnline: !telemetry.gridOnline });
  };

  const handleWeatherChange = (e) => {
    updateSimulation({ weather: e.target.value });
  };

  const handleSliderChange = (param, val) => {
    updateSimulation({ [param]: parseFloat(val) });
  };

  const getStorageGlow = (soc) => {
    if (soc <= 15) return 'danger';
    if (soc < 35) return 'amber';
    return 'teal';
  };

  // Resilience score color configurations
  const getResilienceStyles = (score) => {
    if (score >= 90) return { text: 'text-emerald-400', stroke: 'stroke-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', label: 'Excellent' };
    if (score >= 70) return { text: 'text-teal-400', stroke: 'stroke-teal-500', bg: 'bg-teal-500/10', border: 'border-teal-500/20', label: 'Stable' };
    if (score >= 50) return { text: 'text-amber-400', stroke: 'stroke-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Warning' };
    if (score >= 30) return { text: 'text-orange-400', stroke: 'stroke-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'Warning' };
    return { text: 'text-rose-500', stroke: 'stroke-rose-600', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Critical' };
  };

  const resStyles = getResilienceStyles(metrics.resilienceScore);

  // Backup duration helpers
  const getDurationStyles = () => {
    if (telemetry.gridOnline) return { text: 'text-emerald-400', label: 'Continuous Grid Supply', percent: 100, bar: 'bg-emerald-500', bg: 'bg-emerald-500/10' };
    if (metrics.remainingHours >= 72) return { text: 'text-teal-400', label: 'Grid Stabilized (72h+)', percent: 100, bar: 'bg-teal-400', bg: 'bg-teal-500/10' };
    
    const percent = Math.min(100, (metrics.remainingHours / 48) * 100);
    if (metrics.remainingHours < 6) return { text: 'text-rose-500 animate-pulse', label: 'CRITICAL ENERGY DEFICIT', percent, bar: 'bg-rose-600 animate-pulse', bg: 'bg-rose-500/10' };
    if (metrics.remainingHours < 24) return { text: 'text-amber-500', label: 'Restricted Backup Mode', percent, bar: 'bg-amber-500', bg: 'bg-amber-500/10' };
    return { text: 'text-cyan-400', label: 'Sufficient Local Buffer', percent, bar: 'bg-cyan-400', bg: 'bg-cyan-500/10' };
  };

  const durStyles = getDurationStyles();

  const getSystemStatusStyles = () => {
    if (telemetry.disasterMode) {
      return {
        bg: 'bg-rose-500/10 border-rose-500/30 text-rose-500',
        text: 'EMERGENCY OPERATION MODE',
        glow: 'shadow-glowRed/15'
      };
    }
    if (!telemetry.gridOnline) {
      return {
        bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
        text: 'ISOLATED MICROGRID EMERGENCY RESERVE SUPPLY RUNNING',
        glow: 'shadow-glowAmber/10'
      };
    }
    return {
      bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
      text: 'SYSTEM STATUS STABLE - MAIN POWER GRID COMMITTED',
      glow: 'shadow-glowTeal/5'
    };
  };

  const systemStatus = getSystemStatusStyles();

  return (
    <div className="space-y-6">
      
      {/* System Status Banner */}
      <div className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-300 ${systemStatus.bg} ${systemStatus.glow}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.04]">
            <Zap className={`w-5 h-5 ${telemetry.disasterMode ? 'text-rose-500 animate-pulse' : !telemetry.gridOnline ? 'text-amber-500 animate-bounce' : 'text-emerald-400'}`} />
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest font-extrabold opacity-60">System Security Diagnostic</h4>
            <p className="text-base font-extrabold mt-0.5 tracking-tight">{systemStatus.text}</p>
          </div>
        </div>
        
        {telemetry.disasterMode ? (
          <div className="flex gap-2">
            <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 font-bold animate-pulse">
              ● Grid Shedding Active
            </span>
            <button 
              onClick={resetSimulation} 
              className="px-3.5 py-1.5 rounded-lg bg-red-500 text-black text-xs font-bold hover:bg-red-400 transition-all flex items-center gap-1.5"
            >
              Deactivate Disaster Mode
            </button>
          </div>
        ) : (
          !telemetry.gridOnline && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 font-bold animate-pulse">
              ● Disconnected from Grid
            </span>
          )
        )}
      </div>

      {/* HERO SECTION: Resilience Index & Backup Clock (2 Cols) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Global Resilience Card */}
        <PremiumCard 
          glowType={metrics.resilienceScore < 30 ? "danger" : metrics.resilienceScore < 70 ? "amber" : "teal"}
          title="Global Resilience Score"
          subtitle="Real-time capability assessment rating"
        >
          <div className="flex items-center justify-between py-1 px-2">
            <div className="space-y-3">
              <div>
                <span className="text-sm font-semibold text-gray-500">Security Index Rating</span>
                <div className="text-4xl font-extrabold text-white mt-1">
                  {metrics.resilienceScore}<span className="text-lg font-medium text-gray-500">/100</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${resStyles.bg} ${resStyles.text} border ${resStyles.border}`}>
                  {resStyles.label}
                </span>
                <span className="text-[10px] text-gray-400 font-medium">Grid factor applied</span>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  stroke="rgba(255, 255, 255, 0.02)" 
                  strokeWidth="8.5" 
                  fill="transparent" 
                />
                <circle 
                  cx="50" 
                  cy="50" 
                  r="40" 
                  className={`${resStyles.stroke} transition-all duration-1000`} 
                  strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - metrics.resilienceScore / 100)}`}
                  strokeLinecap="round"
                  fill="transparent" 
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-xl font-extrabold text-white tracking-tight">{metrics.resilienceScore}%</span>
              </div>
            </div>
          </div>
        </PremiumCard>

        {/* Estimated Backup Duration Hero KPI Card */}
        <PremiumCard 
          glowType={telemetry.gridOnline ? "teal" : metrics.remainingHours < 6 ? "danger" : "amber"}
          title="Estimated Backup Duration"
          subtitle="Storage backup countdown timeline"
        >
          <div className="space-y-4 py-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-semibold text-gray-500">Available Reserve Life</span>
                <div className={`text-4xl font-extrabold tracking-tight mt-1 font-mono ${durStyles.text}`}>
                  {telemetry.gridOnline ? "Continuous" : `${metrics.remainingHours} Hours`}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-black/40 border border-white/[0.04] text-gray-400">
                <Clock className={`w-6 h-6 ${telemetry.gridOnline ? 'text-emerald-400' : metrics.remainingHours < 6 ? 'text-rose-500 animate-pulse' : 'text-amber-500 animate-spin'}`} style={{ animationDuration: '4s' }} />
              </div>
            </div>

            {/* Countdown styling progress bar */}
            <div className="space-y-2">
              <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${durStyles.bar}`}
                  style={{ width: `${durStyles.percent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400">
                <span className="font-semibold">{durStyles.label}</span>
                <span>Max Projection: 48h</span>
              </div>
            </div>
          </div>
        </PremiumCard>

      </div>

      {/* Grid of Main Telemetry Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Solar Card */}
        <PremiumCard 
          glowType={telemetry.disasterMode ? "danger" : "cyan"}
          title="Solar Generation"
          subtitle="Array Photovoltaic Inputs"
          action={<Sun className="w-5 h-5 text-cyan-400" />}
        >
          <div className="mt-2 space-y-4">
            <div>
              <div className="text-3xl font-extrabold text-white">{metrics.solarGen} <span className="text-sm font-medium text-gray-500">kW</span></div>
              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>Base: {telemetry.solarBase} kW</span>
                {telemetry.disasterMode && <span className="text-rose-400 font-bold">-50% Disaster drop</span>}
              </div>
            </div>
            {/* Simulation Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Base Solar Capacity</span>
                <span className="font-semibold text-white">{telemetry.solarBase} kW</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="300" 
                value={telemetry.solarBase} 
                onChange={(e) => handleSliderChange('solarBase', e.target.value)}
                className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Wind Card */}
        <PremiumCard 
          glowType={telemetry.disasterMode ? "danger" : "cyan"}
          title="Wind Generation"
          subtitle="Turbine Kinematics"
          action={<Wind className="w-5 h-5 text-cyan-400" />}
        >
          <div className="mt-2 space-y-4">
            <div>
              <div className="text-3xl font-extrabold text-white">{metrics.windGen} <span className="text-sm font-medium text-gray-500">kW</span></div>
              <div className="text-xs text-gray-400 mt-1 flex justify-between">
                <span>Base: {telemetry.windBase} kW</span>
                {telemetry.disasterMode && <span className="text-rose-400 font-bold">-30% Disaster drop</span>}
              </div>
            </div>
            {/* Simulation Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Base Wind Capacity</span>
                <span className="font-semibold text-white">{telemetry.windBase} kW</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="200" 
                value={telemetry.windBase} 
                onChange={(e) => handleSliderChange('windBase', e.target.value)}
                className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Battery Card */}
        <PremiumCard 
          glowType={getStorageGlow(telemetry.batterySoc)}
          title="Battery Storage"
          subtitle="Lithium Reserve System"
          action={<BatteryCharging className="w-5 h-5 text-teal-400" />}
        >
          <div className="mt-2 space-y-4">
            <div>
              <div className="text-3xl font-extrabold text-white">
                {telemetry.batterySoc}%
                <span className="text-xs font-semibold text-gray-500 ml-2">
                  ({Math.round((telemetry.batterySoc/100) * telemetry.batteryCapacity)}/{telemetry.batteryCapacity} kWh)
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                Charge state: 
                <span className={`font-semibold capitalize ${
                  metrics.storageState === 'charging' ? 'text-emerald-400' :
                  metrics.storageState === 'discharging' ? 'text-amber-400 animate-pulse' : 'text-gray-400'
                }`}>
                  {metrics.storageState}
                </span>
              </div>
            </div>
            {/* Simulation Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Battery charge (SoC)</span>
                <span className="font-semibold text-white">{telemetry.batterySoc}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={telemetry.batterySoc} 
                onChange={(e) => handleSliderChange('batterySoc', e.target.value)}
                className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
            </div>
          </div>
        </PremiumCard>

        {/* Hydrogen Card */}
        <PremiumCard 
          glowType={telemetry.hydrogenReserves < 15 ? "amber" : "teal"}
          title="Hydrogen Fuel Cells"
          subtitle="Catalytic Gas Reserve"
          action={<Droplet className="w-5 h-5 text-amber-500" />}
        >
          <div className="mt-2 space-y-4">
            <div>
              <div className="text-3xl font-extrabold text-white">
                {telemetry.hydrogenReserves} <span className="text-sm font-medium text-gray-500">kg</span>
                <span className="text-xs font-semibold text-gray-500 ml-2">
                  ({Math.round(telemetry.hydrogenReserves * 33.3)} kWh eq)
                </span>
              </div>
              <div className="text-xs text-gray-400 mt-1">Capacity: {telemetry.hydrogenCapacity} kg</div>
            </div>
            {/* Simulation Slider */}
            <div>
              <div className="flex justify-between text-[11px] text-gray-400 mb-1.5">
                <span>Hydrogen Reserves</span>
                <span className="font-semibold text-white">{telemetry.hydrogenReserves} kg</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={telemetry.hydrogenReserves} 
                onChange={(e) => handleSliderChange('hydrogenReserves', e.target.value)}
                className="w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
          </div>
        </PremiumCard>
      </div>

      {/* Main Grid: Outage Controls + AI recommendations + Power Balance Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Col 1: Simulation Controls */}
        <div className="md:col-span-1 space-y-6">
          <PremiumCard 
            title="Simulator Toggles" 
            subtitle="Microgrid parameters setup"
          >
            <div className="space-y-4">
              {/* Grid Outage Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div>
                  <h4 className="text-xs font-bold text-white">Grid Utility</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">Toggle blackout test</p>
                </div>
                <button 
                  onClick={handleGridToggle}
                  className="transition-all active:scale-95"
                >
                  {telemetry.gridOnline ? (
                    <ToggleRight className="w-9 h-9 text-emerald-400 cursor-pointer" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-gray-600 cursor-pointer" />
                  )}
                </button>
              </div>

              {/* Weather Selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 flex items-center gap-1.5">
                  <CloudSun className="w-3.5 h-3.5" /> Meteorological Profile
                </label>
                <select
                  value={telemetry.weather}
                  onChange={handleWeatherChange}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#0e1017] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-cyan-500 transition-all cursor-pointer"
                >
                  <option value="sunny">☀️ Sunny & Clear</option>
                  <option value="partly_cloudy">⛅ Partly Cloudy</option>
                  <option value="overcast">☁️ Overcast Grid</option>
                  <option value="stormy">⛈️ Severe Tempest</option>
                  <option value="calm_night">🌙 Calm Night</option>
                </select>
              </div>

              {/* Emergency Disaster Button */}
              <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/5 space-y-2">
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Disaster Simulation</h4>
                <p className="text-[9px] text-gray-500 leading-normal">
                  Reduces solar (-50%), wind (-30%), disconnects grid, and increases load (+40%).
                </p>
                <button
                  onClick={triggerDisasterMode}
                  disabled={telemetry.disasterMode}
                  className={`w-full py-2 rounded-lg text-[10px] font-bold transition-all ${
                    telemetry.disasterMode 
                      ? 'bg-rose-950/20 text-rose-500/50 border border-rose-500/10 cursor-not-allowed' 
                      : 'bg-rose-600 hover:bg-rose-500 text-black hover:scale-[1.01]'
                  }`}
                >
                  {telemetry.disasterMode ? "Scenario Active" : "Trigger disaster"}
                </button>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Col 2: AI Recommendations (New Panel) */}
        <div className="md:col-span-1">
          <PremiumCard 
            title="AI Recommendations" 
            subtitle="Autonomous priority advices"
            glowType="cyan"
          >
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {metrics.aiRecommendations && metrics.aiRecommendations.length > 0 ? (
                metrics.aiRecommendations.map((rec, i) => {
                  const getSeverityStyle = (sev) => {
                    switch (sev) {
                      case 'danger':
                        return 'border-rose-500/20 bg-rose-500/5 text-rose-300';
                      case 'warning':
                        return 'border-amber-500/20 bg-amber-500/5 text-amber-300';
                      case 'success':
                        return 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400';
                      case 'info':
                      default:
                        return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300';
                    }
                  };
                  return (
                    <div 
                      key={i} 
                      className={`p-3 rounded-xl border text-[11px] font-medium leading-relaxed ${getSeverityStyle(rec.severity)}`}
                    >
                      {rec.text}
                    </div>
                  );
                })
              ) : (
                <p className="text-[11px] text-gray-500 py-4 text-center">Calculating load suggestions...</p>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Cols 3-4: Grid Balance sheet */}
        <div className="md:col-span-2">
          <PremiumCard 
            title="Grid Balance Sheet" 
            subtitle="Macro-telemetry comparison ratios"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Total Generation */}
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">RENEWABLE SUPPLY</span>
                <div className="my-2">
                  <div className="text-2xl font-extrabold text-white">{metrics.totalRenewableGen} kW</div>
                  <p className="text-[10px] text-gray-500 mt-0.5">Solar ({metrics.solarGen} kW) + Wind ({metrics.windGen} kW)</p>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-1">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-teal-400 h-1 rounded-full" 
                    style={{ width: `${Math.min(100, (metrics.totalRenewableGen / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Total Demand */}
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">SYSTEM DEMAND</span>
                <div className="my-2">
                  <div className="text-2xl font-extrabold text-white">{metrics.totalRequestedPower} kW</div>
                  {telemetry.disasterMode ? (
                    <p className="text-[10px] text-rose-400 mt-0.5 font-bold">+40% Disaster inflated</p>
                  ) : (
                    <p className="text-[10px] text-gray-500 mt-0.5">Dynamic consumer requested loads</p>
                  )}
                </div>
                <div className="w-full bg-gray-900 rounded-full h-1">
                  <div 
                    className="bg-amber-500 h-1 rounded-full" 
                    style={{ width: `${Math.min(100, (metrics.totalRequestedPower / 300) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Deficit */}
              <div className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">GRID SUPPLY / DEFICIT</span>
                <div className="my-2">
                  {telemetry.gridOnline ? (
                    <>
                      <div className="text-2xl font-extrabold text-emerald-400">{metrics.gridDraw} kW</div>
                      <p className="text-[10px] text-gray-500 mt-0.5">Covered by national grid</p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-extrabold text-rose-500">
                        {metrics.powerShortfall > 0 ? `${metrics.powerShortfall} kW` : "0.0 kW"}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {metrics.powerShortfall > 0 ? "SHEDDING: Low-tier offline" : "Stable on local storage"}
                      </p>
                    </>
                  )}
                </div>
                <div className="w-full bg-gray-900 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${telemetry.gridOnline ? 'bg-emerald-400' : metrics.powerShortfall > 0 ? 'bg-rose-500' : 'bg-teal-400'}`}
                    style={{ 
                      width: `${Math.min(100, (
                        telemetry.gridOnline ? (metrics.gridDraw / 300) * 100 : (metrics.powerShortfall / 300) * 100
                      ))}%` 
                  }}
                  />
                </div>
              </div>
            </div>

            {/* Visual shedding indicators (Priority 3) */}
            <div className="mt-5 p-4 rounded-xl bg-black/30 border border-white/[0.04]">
              <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                <span className="font-semibold text-white">Visual Power Shedding Status</span>
                <span>{metrics.statusSummary}</span>
              </div>
              
              <div className="flex gap-2 h-4 w-full bg-gray-950 p-0.5 rounded-lg border border-white/[0.02]">
                {metrics.allocationMatrix && metrics.allocationMatrix.length > 0 ? (
                  metrics.allocationMatrix.map((item) => {
                    const statusColors = {
                      "Fully Powered": "bg-emerald-500/80 hover:bg-emerald-400 shadow-glowTeal/5",
                      "Partially Powered": "bg-amber-500/80 hover:bg-amber-400 shadow-glowAmber/5",
                      "Shedded": "bg-rose-500/20 border border-rose-500/30 hover:bg-rose-500/50"
                    };
                    return (
                      <div 
                        key={item.id}
                        className={`h-full rounded flex-1 transition-all text-[8px] flex items-center justify-center font-bold tracking-tighter ${statusColors[item.status] || 'bg-gray-700'}`}
                        title={`${item.name} (${item.tierKey.toUpperCase()}): ${item.allocatedPower}/${item.requestedPower} kW [${item.status}]`}
                      >
                        {item.status === 'Shedded' ? 'OFF' : item.status === 'Partially Powered' ? 'PART' : 'FULL'}
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full w-full rounded bg-gray-800" />
                )}
              </div>
              <div className="flex justify-between text-[9px] text-gray-500 mt-2 font-semibold">
                <span>TIER 1 (ICU/ER: FULLY PROTECTED)</span>
                <span>TIER 5 (ADMIN: SHEDDED ON DEFICIT)</span>
              </div>
            </div>
          </PremiumCard>
        </div>

      </div>
    </div>
  );
}
