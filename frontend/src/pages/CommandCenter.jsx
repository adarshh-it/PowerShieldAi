import React from 'react';
import { 
  ShieldAlert, 
  Activity, 
  AlertOctagon, 
  CheckCircle, 
  AlertTriangle, 
  Zap, 
  Shield, 
  Clock, 
  Flame, 
  HeartPulse, 
  Info,
  Server
} from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import PremiumCard from '../components/PremiumCard';

export default function CommandCenter() {
  const { telemetry, metrics, alerts, triggerDisasterMode, resetSimulation } = useEnergy();

  // Find active threats
  const activeThreats = [];
  if (!telemetry.gridOnline) {
    activeThreats.push({
      title: "Utility Grid Blackout",
      desc: "Grid transmission offline. Local microgrid isolated.",
      severity: "danger"
    });
  }
  if (telemetry.disasterMode) {
    activeThreats.push({
      title: "Emergency Disaster Mode Active",
      desc: "Meteorological damage & capacity limit drops triggered.",
      severity: "danger"
    });
  }
  if (telemetry.batterySoc < 25) {
    activeThreats.push({
      title: "Critically Low Lithium Battery Reserves",
      desc: "Lithium storage capacity depleted below warning line.",
      severity: "danger"
    });
  }
  if (telemetry.hydrogenReserves < 20) {
    activeThreats.push({
      title: "Low Hydrogen Fuel Cell Reserves",
      desc: "Hydrogen reserve pressure dropping below standby limits.",
      severity: "warning"
    });
  }
  if (telemetry.weather === 'stormy') {
    activeThreats.push({
      title: "Severe Weather Incident Warning",
      desc: "Meteorological wind limits reached; solar output blocked.",
      severity: "warning"
    });
  }

  // Get color for Resilience Score
  const getResilienceColor = (score) => {
    if (score >= 90) return { stroke: "stroke-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
    if (score >= 70) return { stroke: "stroke-teal-500", text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" };
    if (score >= 50) return { stroke: "stroke-amber-500", text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" };
    if (score >= 30) return { stroke: "stroke-orange-500", text: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" };
    return { stroke: "stroke-rose-600", text: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" };
  };

  const colors = getResilienceColor(metrics.resilienceScore);

  // Status mapping
  const getResilienceLabel = (score) => {
    if (score >= 90) return "Excellent Resilience";
    if (score >= 70) return "Stable Resilience";
    if (score >= 50) return "Warning Level";
    return "Critical Threshold";
  };

  // Generate simulated history logs based on current status
  const eventLogs = [
    { time: "05 mins ago", msg: "PowerShield AI allocation algorithm recalculation completed.", icon: Shield },
    { time: "18 mins ago", msg: "Solar inverter system synced parameters with microgrid nodes.", icon: Info }
  ];

  if (!telemetry.gridOnline) {
    eventLogs.unshift({ time: "Just now", msg: "Utility Grid connection offline. Auto-isolated.", icon: AlertOctagon, type: "danger" });
    eventLogs.unshift({ time: "Just now", msg: "Emergency backup fuel cell circuit armed successfully.", icon: Zap, type: "warning" });
  }
  if (telemetry.disasterMode) {
    eventLogs.unshift({ time: "Just now", msg: "DISASTER MODE: Shedding non-critical admin operations immediately.", icon: Flame, type: "danger" });
  }

  return (
    <div className="space-y-6">
      
      {/* Top Banner and War Room Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/[0.04] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span className="text-xs uppercase font-extrabold tracking-widest text-red-500">Live Crisis Operations Center</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Grid Emergency Command Center</h2>
          <p className="text-xs text-gray-400 mt-1">Autonomous microgrid defense network. Preserving life-support capacity.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={resetSimulation}
            className="px-4 py-2 rounded-xl glass-button text-xs text-gray-400 hover:text-white font-semibold flex items-center gap-1.5"
          >
            Reset Command State
          </button>
          
          <button
            onClick={triggerDisasterMode}
            disabled={telemetry.disasterMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              telemetry.disasterMode 
                ? 'bg-rose-950/20 text-rose-500/50 border border-rose-500/10 cursor-not-allowed' 
                : 'bg-red-600 text-black hover:bg-red-500 hover:scale-[1.01] shadow-glowRed/10'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            {telemetry.disasterMode ? "Protocol Active" : "Trigger Emergency Protocol"}
          </button>
        </div>
      </div>

      {/* Main War Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Left Column: Resilience dial + active threats (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          
          {/* Radial Resilience Score Tracker */}
          <PremiumCard 
            title="Global Resilience Index" 
            subtitle="Microgrid capacity security rating"
            glowType={metrics.resilienceScore < 30 ? "danger" : metrics.resilienceScore < 70 ? "amber" : "teal"}
          >
            <div className="flex flex-col items-center justify-center py-6">
              
              {/* Radial dial circle */}
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Base background circle */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="rgba(255, 255, 255, 0.02)" 
                    strokeWidth="8" 
                    fill="transparent" 
                  />
                  {/* Glowing resilience track */}
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="rgba(0, 0, 0, 0.3)" 
                    strokeWidth="8.5"
                    fill="transparent"
                  />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    className={`${colors.stroke} transition-all duration-1000`} 
                    strokeWidth="8" 
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - metrics.resilienceScore / 100)}`}
                    strokeLinecap="round"
                    fill="transparent" 
                  />
                </svg>
                {/* Dial Center text */}
                <div className="absolute text-center">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{metrics.resilienceScore}</span>
                  <span className="text-xs text-gray-500 font-semibold block mt-0.5">/ 100</span>
                </div>
              </div>

              {/* Status indicator badges */}
              <div className="mt-6 text-center">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                  {getResilienceLabel(metrics.resilienceScore)}
                </span>
                <p className="text-xs text-gray-400 mt-3.5 max-w-[280px] mx-auto leading-relaxed">
                  Rating depends on utility grid connections, remaining battery percentage, and active consumption.
                </p>
              </div>

            </div>
          </PremiumCard>

          {/* Active Threats Log */}
          <PremiumCard title="Grid Threat Diagnostic" subtitle="Real-time transmission risks">
            <div className="space-y-3">
              {activeThreats.length > 0 ? (
                activeThreats.map((threat, i) => (
                  <div 
                    key={i} 
                    className={`p-3.5 rounded-xl border flex gap-3 items-start ${
                      threat.severity === 'danger' 
                        ? 'bg-rose-500/5 border-rose-500/20 text-rose-300' 
                        : 'bg-amber-500/5 border-amber-500/20 text-amber-300'
                    }`}
                  >
                    <AlertOctagon className={`w-5 h-5 shrink-0 mt-0.5 ${threat.severity === 'danger' ? 'text-rose-500' : 'text-amber-500'}`} />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">{threat.title}</h4>
                      <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{threat.desc}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-emerald-400 font-medium bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                  <span>Threat diagnostic clear. Grid operating securely.</span>
                </div>
              )}
            </div>
          </PremiumCard>

        </div>

        {/* Right Column: Infrastructure matrices + AI stream + Logs (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          
          {/* Critical Infrastructure Matrix */}
          <PremiumCard 
            title="Infrastructure Protection Matrix" 
            subtitle="Secure loads status tracker"
          >
            <div className="grid grid-cols-1 gap-3.5">
              {metrics.allocationMatrix && metrics.allocationMatrix.length > 0 ? (
                metrics.allocationMatrix.map((item) => {
                  const percent = Math.round((item.allocatedPower / (item.requestedPower || 1)) * 100);
                  const isShed = item.status === 'Shedded';
                  const isPartial = item.status === 'Partially Powered';
                  
                  let colorClass = "bg-emerald-500";
                  let borderClass = "border-emerald-500/20";
                  let textClass = "text-emerald-400";
                  let bgClass = "bg-emerald-500/5";

                  if (isShed) {
                    colorClass = "bg-rose-600";
                    borderClass = "border-rose-500/20";
                    textClass = "text-rose-400";
                    bgClass = "bg-rose-500/5";
                  } else if (isPartial) {
                    colorClass = "bg-amber-500";
                    borderClass = "border-amber-500/20";
                    textClass = "text-amber-400";
                    bgClass = "bg-amber-500/5";
                  }

                  return (
                    <div 
                      key={item.id} 
                      className={`p-3.5 rounded-xl border ${borderClass} ${bgClass} flex items-center justify-between gap-4`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg bg-black/40 border border-white/[0.04] text-gray-400`}>
                          <Server className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white leading-none">{item.name}</h4>
                            <span className="text-[9px] uppercase bg-black/30 border border-white/[0.04] px-1.5 py-0.5 rounded text-gray-400 font-bold">{item.tierKey}</span>
                          </div>
                          <span className="text-[10px] text-gray-500 mt-1 block">Requested: {item.requestedPower} kW | Allocated: {item.allocatedPower} kW</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-bold font-mono ${textClass}`}>{percent}% Online</span>
                        {/* small bar */}
                        <div className="w-24 bg-gray-900 h-1.5 rounded-full mt-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${colorClass}`} 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 py-4 text-center">Loading matrix status...</p>
              )}
            </div>
          </PremiumCard>

          {/* AI Decision Recommendations list */}
          <PremiumCard title="AI Recommendations Stream" subtitle="Autonomous logic directives" glowType="cyan">
            <div className="space-y-3">
              {metrics.aiRecommendations && metrics.aiRecommendations.length > 0 ? (
                metrics.aiRecommendations.map((rec, i) => {
                  const mapSeverity = (sev) => {
                    switch (sev) {
                      case 'danger':
                        return 'text-rose-400 bg-rose-500/5 border-rose-500/10';
                      case 'warning':
                        return 'text-amber-400 bg-amber-500/5 border-amber-500/10';
                      case 'success':
                        return 'text-emerald-400 bg-emerald-500/5 border-emerald-500/10';
                      case 'info':
                      default:
                        return 'text-cyan-400 bg-cyan-500/5 border-cyan-500/10';
                    }
                  };
                  return (
                    <div 
                      key={i} 
                      className={`p-3.5 rounded-xl border text-xs font-medium flex items-center justify-between gap-4 ${mapSeverity(rec.severity)}`}
                    >
                      <p className="leading-relaxed">{rec.text}</p>
                      <span className="text-[8px] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.03] text-gray-500 font-bold shrink-0">
                        {rec.category}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-500 py-4 text-center">Calculating recommendation streams...</p>
              )}
            </div>
          </PremiumCard>

          {/* War Room Timeline Logs */}
          <PremiumCard title="Incident Event Timeline" subtitle="Grid logs chronologically logged">
            <div className="space-y-4">
              {eventLogs.map((log, i) => {
                const LogIcon = log.icon;
                return (
                  <div key={i} className="flex gap-4 relative">
                    {/* Line connection logic */}
                    {i !== eventLogs.length - 1 && (
                      <div className="absolute top-7 left-3 w-[1px] h-9 bg-white/[0.04]" />
                    )}
                    <div className={`p-1.5 rounded-full bg-black/40 border border-white/[0.05] text-gray-400 flex items-center justify-center shrink-0 w-7.5 h-7.5`}>
                      <LogIcon className={`w-4 h-4 ${log.type === 'danger' ? 'text-rose-500' : log.type === 'warning' ? 'text-amber-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 font-bold tracking-wider">{log.time}</span>
                        {log.type && (
                          <span className={`text-[8px] uppercase px-1.5 py-0.2 rounded font-extrabold ${log.type === 'danger' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'}`}>
                            {log.type}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 font-medium mt-1 leading-relaxed">{log.msg}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumCard>

        </div>

      </div>

    </div>
  );
}
