import React, { useState } from 'react';
import { Sliders, RefreshCw, Zap, ShieldAlert, Cpu } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import PremiumCard from '../components/PremiumCard';

export default function ResourceAllocation() {
  const { 
    demands, 
    metrics, 
    telemetry, 
    updateDemands, 
    resetSimulation 
  } = useEnergy();

  // --- NEW SIMULATION ENGINE STATE IMPLEMENTATION FOR ROUND 2 ---
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [simulationTimeline, setSimulationTimeline] = useState([]);
  const [currentHourIndex, setCurrentHourIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const toggleDisasterSimulation = async () => {
    if (isDisasterMode) {
      setIsDisasterMode(false);
      setSimulationTimeline([]);
      setCurrentHourIndex(0);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/simulation/run');
      const resData = await response.json();
      if (resData.success) {
        setSimulationTimeline(resData.timeline);
        setIsDisasterMode(true);
        setCurrentHourIndex(0);
      }
    } catch (err) {
      console.error("Simulation engine failed to respond:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch lookups between simulation values and Context defaults seamlessly
  const currentMetrics = isDisasterMode && simulationTimeline[currentHourIndex]
    ? simulationTimeline[currentHourIndex]
    : null;

  const liveSolar = currentMetrics ? currentMetrics.solarKw : metrics.solarGen;
  const liveWind = currentMetrics ? currentMetrics.windKw : metrics.windGen;
  const liveSoc = currentMetrics ? currentMetrics.batterySoC : telemetry.batterySoc;
  const liveH2 = currentMetrics ? currentMetrics.hydrogenKg : telemetry.hydrogenReserves;
  const isGridOnline = currentMetrics ? false : telemetry.gridOnline;

  const handleDemandChange = (key, val) => {
    if (isDisasterMode) return; // Freeze individual adjustments during direct blackouts
    updateDemands({ [key]: parseFloat(val) });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Fully Powered':
      case 'ONLINE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Partially Powered':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
      case 'Shedded':
      case 'SHEDDED':
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  const slidersList = [
    { key: 'tier1_icu', label: 'ICU Department Load', subtitle: 'Critical Life Support (Tier 1)', min: 0, max: 120, accent: 'accent-cyan-400' },
    { key: 'tier1_er', label: 'Emergency Room Load', subtitle: 'Clinical Monitoring (Tier 1)', min: 0, max: 100, accent: 'accent-cyan-400' },
    { key: 'tier3_watertreatment', label: 'Water Sanitation Load', subtitle: 'Treatment Facility (Tier 3)', min: 0, max: 150, accent: 'accent-amber-500' },
    { key: 'tier4_communication', label: 'Emergency Telecom Load', subtitle: 'Radio & Satcom Units (Tier 4)', min: 0, max: 80, accent: 'accent-amber-500' },
    { key: 'tier5_admin', label: 'Administrative Operations', subtitle: 'Billing & Records (Tier 5)', min: 0, max: 60, accent: 'accent-rose-500' }
  ];

  const isBatteryDischarging = currentMetrics ? (currentMetrics.supplyKw < currentMetrics.demandKw && currentMetrics.batterySoC > 15) : (metrics.storageState === 'discharging');
  const isBatteryCharging = currentMetrics ? (currentMetrics.supplyKw > currentMetrics.demandKw) : (metrics.storageState === 'charging');
  const isHydrogenActive = currentMetrics ? (currentMetrics.batterySoC <= 15.5 && currentMetrics.hydrogenKg > 0) : (telemetry.batterySoc <= 50 && !telemetry.gridOnline);

  const getTierFlowColor = (tierKey) => {
    if (currentMetrics) {
      const map = { tier1: 'ONLINE', tier2: currentMetrics.sheddingState.t2, tier3: currentMetrics.sheddingState.t3, tier4: currentMetrics.sheddingState.t4, tier5: currentMetrics.sheddingState.t5 };
      const status = map[tierKey];
      if (status === 'FULLY POWERED' || status === 'ONLINE') return '#10b981';
      return '#f43f5e';
    }
    if (!metrics.allocationMatrix) return '#52525b';
    const c = metrics.allocationMatrix.find(item => item.tierKey === tierKey);
    if (!c) return '#52525b';
    return c.status === 'Fully Powered' ? '#10b981' : c.status === 'Partially Powered' ? '#f59e0b' : '#f43f5e';
  };

  const isTierFlowActive = (tierKey) => {
    if (currentMetrics) {
      const map = { tier1: 'ONLINE', tier2: currentMetrics.sheddingState.t2, tier3: currentMetrics.sheddingState.t3, tier4: currentMetrics.sheddingState.t4, tier5: currentMetrics.sheddingState.t5 };
      return map[tierKey] !== 'SHEDDED';
    }
    if (!metrics.allocationMatrix) return false;
    const c = metrics.allocationMatrix.find(item => item.tierKey === tierKey);
    return c && c.status !== 'Shedded';
  };

  return (
    <div className="space-y-6">
      {/* Topology Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AI Resource Allocation Console</h2>
          <p className="text-xs text-gray-400 mt-1">
            Real-time priority distribution. Drag sliders to adjust tier demand and watch the engine reallocate resources.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={toggleDisasterSimulation}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              isDisasterMode 
                ? 'bg-amber-600 border-amber-500 text-white animate-pulse' 
                : 'bg-rose-950/40 text-rose-400 border-rose-900 hover:bg-rose-900 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isLoading ? 'Running Engine...' : isDisasterMode ? 'Reset Simulation State' : 'Activate Disaster Mode'}
          </button>
          
          <button 
            onClick={resetSimulation}
            disabled={isDisasterMode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-button text-xs text-gray-400 hover:text-white disabled:opacity-30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Demand State
          </button>
        </div>
      </div>

      {/* Sleek Scrubber Control Panel Overlay */}
      {isDisasterMode && (
        <div className="bg-[#0f131a] border border-cyan-500/20 p-4 rounded-xl">
          <div className="flex justify-between text-xs text-cyan-400 mb-2 font-mono">
            <span className="flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> 168-HOUR SIMULATED TIMELINE CONSOLE</span>
            <span className="font-bold">Day {Math.floor(currentHourIndex / 24) + 1} (Hour {currentMetrics?.hour}/168)</span>
          </div>
          <input 
            type="range" min="0" max="167" value={currentHourIndex} 
            onChange={(e) => setCurrentHourIndex(parseInt(e.target.value))}
            className="w-full accent-cyan-400 h-2 bg-gray-900 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-mono">
            <span>🚨 BLACKOUT HOUR 1</span>
            <span>BATTERY BUFFER RUNNING</span>
            <span>HYDROGEN STORAGE ENGAGED</span>
            <span>🏆 7-DAY RESILIENCE VERIFIED</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Slulators Console - Left Col */}
        <div className="md:col-span-5 space-y-6">
          <PremiumCard title="Dynamic Demand Regulators" subtitle="Tweak load thresholds in real-time" glowType="cyan">
            <div className="space-y-6">
              {slidersList.map((slider) => {
                let currentVal = demands[slider.key] || 0;
                if (currentMetrics) {
                  const keyMap = { tier1_icu: 123, tier1_er: 0, tier3_watertreatment: 60, tier4_communication: 30, tier5_admin: 25 };
                  currentVal = keyMap[slider.key];
                }
                return (
                  <div key={slider.key} className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-semibold text-white leading-none">{slider.label}</h4>
                        <span className="text-[10px] text-gray-500 font-medium">{slider.subtitle}</span>
                      </div>
                      <span className="text-sm font-extrabold text-white">
                        {currentVal} <span className="text-[10px] text-gray-500 font-medium">kW</span>
                      </span>
                    </div>
                    <input 
                      type="range" min={slider.min} max={slider.max} value={currentVal} 
                      disabled={isDisasterMode}
                      onChange={(e) => handleDemandChange(slider.key, e.target.value)}
                      className={`w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer ${slider.accent} disabled:opacity-50`}
                    />
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-start gap-3">
            <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 leading-relaxed">
              <span className="font-semibold text-white block mb-0.5">Priority shedding logic:</span>
              If available power drops below demand, the AI shuts off <span className="text-rose-400">Tier 5 (Administrative Systems)</span> first, followed by <span className="text-amber-400">Tier 4</span>, then <span className="text-amber-400">Tier 3</span>, then <span className="text-amber-400">Tier 2</span>. <span className="text-cyan-400 font-semibold">Tier 1 (ICU & Life Support)</span> is preserved as long as power remains.
            </div>
          </div>
        </div>

        {/* Schematic Flow Matrix - Right Col */}
        <div className="md:col-span-7 space-y-6">
          <PremiumCard title="Energy Flow Schematic" subtitle="Real-time distribution pathways">
            <div className="relative py-2 flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/[0.04]">
              <svg className="w-full h-[280px]" viewBox="0 0 540 280" fill="none">
                <defs>
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                  <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                  <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4" result="blur" /><feComposite in="SourceGraphic" in2="blur" operator="over" /></filter>
                </defs>

                <path d="M 90 60 C 130 60, 130 90, 170 90" stroke={liveSolar > 0 ? "#06b6d4" : "#3f3f46"} strokeWidth="1.5" className={liveSolar > 0 ? "animated-flow-line" : ""} style={{ filter: liveSolar > 0 ? "url(#glow-cyan)" : "" }} />
                <path d="M 90 220 C 130 220, 130 90, 170 90" stroke={liveWind > 0 ? "#06b6d4" : "#3f3f46"} strokeWidth="1.5" className={liveWind > 0 ? "animated-flow-line" : ""} style={{ filter: liveWind > 0 ? "url(#glow-cyan)" : "" }} />
                <path d="M 215 115 L 215 165" stroke={isBatteryCharging && liveSoc >= 99 ? "#14b8a6" : isHydrogenActive ? "#f59e0b" : "#3f3f46"} strokeWidth="1.5" className={isBatteryCharging && liveSoc >= 99 ? "animated-flow-line" : isHydrogenActive ? "animated-flow-line-reverse" : ""} />
                <path d="M 260 90 C 295 90, 295 140, 330 140" stroke={isBatteryDischarging && liveSoc > 0 ? "#14b8a6" : (isBatteryCharging ? "#14b8a6" : "#3f3f46")} strokeWidth="1.5" className={isBatteryDischarging && liveSoc > 0 ? "animated-flow-line" : ""} style={{ filter: isBatteryDischarging && liveSoc > 0 ? "url(#glow-teal)" : "" }} />
                <path d="M 260 190 C 295 190, 295 140, 330 140" stroke={isHydrogenActive ? "#f59e0b" : "#3f3f46"} strokeWidth="1.5" className={isHydrogenActive ? "animated-flow-line" : ""} style={{ filter: isHydrogenActive ? "url(#glow-amber)" : "" }} />

                <path d="M 390 140 C 410 140, 420 40, 440 40" stroke={getTierFlowColor('tier1')} strokeWidth="1.5" className={isTierFlowActive('tier1') ? "animated-flow-line" : ""} />
                <path d="M 390 140 C 410 140, 420 90, 440 90" stroke={getTierFlowColor('tier2')} strokeWidth="1.5" className={isTierFlowActive('tier2') ? "animated-flow-line" : ""} />
                <path d="M 390 140 L 440 140" stroke={getTierFlowColor('tier3')} strokeWidth="1.5" className={isTierFlowActive('tier3') ? "animated-flow-line" : ""} />
                <path d="M 390 140 C 410 140, 420 190, 440 190" stroke={getTierFlowColor('tier4')} strokeWidth="1.5" className={isTierFlowActive('tier4') ? "animated-flow-line" : ""} />
                <path d="M 390 140 C 410 140, 420 240, 440 240" stroke={getTierFlowColor('tier5')} strokeWidth="1.5" className={isTierFlowActive('tier5') ? "animated-flow-line" : ""} />

                <g transform="translate(10, 35)">
                  <rect width="80" height="50" rx="8" fill="#0d0f18" stroke="#06b6d4" strokeWidth="1.2" />
                  <text x="40" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Solar Array</text>
                  <text x="40" y="38" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">{liveSolar} kW</text>
                </g>
                <g transform="translate(10, 195)">
                  <rect width="80" height="50" rx="8" fill="#0d0f18" stroke="#06b6d4" strokeWidth="1.2" />
                  <text x="40" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Wind Inflow</text>
                  <text x="40" y="38" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">{liveWind} kW</text>
                </g>
                <g transform="translate(170, 65)">
                  <rect width="90" height="50" rx="8" fill="#0d0f18" stroke="#14b8a6" strokeWidth="1.2" />
                  <text x="45" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Lithium Batt</text>
                  <text x="45" y="38" fill="#14b8a6" fontSize="10" fontWeight="bold" textAnchor="middle">{liveSoc}%</text>
                </g>
                <g transform="translate(170, 165)">
                  <rect width="90" height="50" rx="8" fill="#0d0f18" stroke="#f59e0b" strokeWidth="1.2" />
                  <text x="45" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Hydrogen H₂</text>
                  <text x="45" y="38" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">{liveH2} kg</text>
                </g>
                <g transform="translate(330, 115)">
                  <rect width="60" height="50" rx="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="animate-pulse" />
                  <text x="30" y="29" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">AI Engine</text>
                </g>

                <g transform="translate(440, 20)">
                  <rect width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier1')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 1: ICU / Life</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier1')} fontSize="8" fontWeight="bold" textAnchor="middle">{currentMetrics ? 'ONLINE' : 'SECURED'}</text>
                </g>
                <g transform="translate(440, 72)">
                  <rect width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier2')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 2: Theatres</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier2')} fontSize="8" fontWeight="bold" textAnchor="middle">{currentMetrics ? currentMetrics.sheddingState.t2 : 'SECURED'}</text>
                </g>
                <g transform="translate(440, 124)">
                  <rect width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier3')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 3: Sanitation</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier3')} fontSize="8" fontWeight="bold" textAnchor="middle">{currentMetrics ? currentMetrics.sheddingState.t3 : 'SECURED'}</text>
                </g>
                <g transform="translate(440, 176)">
                  <rect width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier4')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 4: Satcom</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier4')} fontSize="8" fontWeight="bold" textAnchor="middle">{currentMetrics ? currentMetrics.sheddingState.t4 : 'SECURED'}</text>
                </g>
                <g transform="translate(440, 228)">
                  <rect width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier5')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 5: Admin Sys</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier5')} fontSize="8" fontWeight="bold" textAnchor="middle">{currentMetrics ? currentMetrics.sheddingState.t5 : 'SECURED'}</text>
                </g>
              </svg>

              <div className="text-[10px] text-gray-500 mt-2 font-mono">
                {!isGridOnline ? (
                  <span className="text-rose-400 font-semibold animate-pulse">⚠️ DISASTER SIMULATION ACTIVE: MAIN POWER GRID FAILURE</span>
                ) : (
                  <span>GRID ONLINE: FLOW LINES SECURED BY METROPOLITAN LINE</span>
                )}
              </div>
            </div>
          </PremiumCard>

          {/* Dynamic Allocation Table Display Matrix */}
          <PremiumCard title="Real-Time Allocation Matrix" subtitle="Tier breakdown computed dynamically">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="text-xs uppercase bg-white/[0.02] border-y border-white/[0.04] text-gray-500">
                  <tr>
                    <th className="py-3 px-4">Tier / Consumer</th>
                    <th className="py-3 px-4 text-center">Priority</th>
                    <th className="py-3 px-4 text-right">Requested</th>
                    <th className="py-3 px-4 text-right">Allocated</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {currentMetrics ? (
                    [
                      { id: 1, name: 'ICU Departments', tierName: 'Critical Life Support', importance: 1, req: 123, alloc: 123, status: 'ONLINE' },
                      { id: 2, name: 'Operating Theatres', tierName: 'Clinical Operations', importance: 2, req: 45, alloc: currentMetrics.sheddingState.t2 === 'SHEDDED' ? 0 : 45, status: currentMetrics.sheddingState.t2 },
                      { id: 3, name: 'Water Sanitation', tierName: 'Treatment Facility', importance: 3, req: 60, alloc: currentMetrics.sheddingState.t3 === 'SHEDDED' ? 0 : 60, status: currentMetrics.sheddingState.t3 },
                      { id: 4, name: 'Emergency Telecom', tierName: 'Radio & Satcom Units', importance: 4, req: 30, alloc: currentMetrics.sheddingState.t4 === 'SHEDDED' ? 0 : 30, status: currentMetrics.sheddingState.t4 },
                      { id: 5, name: 'Admin Operations', tierName: 'Billing & Records', importance: 5, req: 25, alloc: currentMetrics.sheddingState.t5 === 'SHEDDED' ? 0 : 25, status: currentMetrics.sheddingState.t5 }
                    ].map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{item.tierName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-black/40 text-gray-400 border border-white/[0.05]">T{item.importance}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-gray-400">{item.req} kW</td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-white">{item.alloc} kW</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusBadge(item.status)}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : metrics.allocationMatrix && metrics.allocationMatrix.length > 0 ? (
                    metrics.allocationMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{item.tierName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-black/40 text-gray-400 border border-white/[0.05]">T{item.importance}</span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-gray-400">{item.requestedPower} kW</td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-white">{item.allocatedPower} kW</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusBadge(item.status)}`}>{item.status}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-gray-500 font-medium">No allocation data. Start the simulator server.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </PremiumCard>
        </div>
        
      </div>
    </div>
  );
}