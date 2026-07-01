import React from 'react';
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

  const handleDemandChange = (key, val) => {
    updateDemands({ [key]: parseFloat(val) });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Fully Powered':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'Partially Powered':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse';
      case 'Shedded':
      default:
        return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
    }
  };

  // Define sliders list mapped to db.json demand keys
  const slidersList = [
    {
      key: 'tier1_icu',
      label: 'ICU Department Load',
      subtitle: 'Critical Life Support (Tier 1)',
      min: 0,
      max: 120,
      accent: 'accent-cyan-400'
    },
    {
      key: 'tier1_er',
      label: 'Emergency Room Load',
      subtitle: 'Clinical Monitoring (Tier 1)',
      min: 0,
      max: 100,
      accent: 'accent-cyan-400'
    },
    {
      key: 'tier3_watertreatment',
      label: 'Water Sanitation Load',
      subtitle: 'Treatment Facility (Tier 3)',
      min: 0,
      max: 150,
      accent: 'accent-amber-500'
    },
    {
      key: 'tier4_communication',
      label: 'Emergency Telecom Load',
      subtitle: 'Radio & Satcom Units (Tier 4)',
      min: 0,
      max: 80,
      accent: 'accent-amber-500'
    },
    {
      key: 'tier5_admin',
      label: 'Administrative Operations',
      subtitle: 'Billing & Records (Tier 5)',
      min: 0,
      max: 60,
      accent: 'accent-rose-500'
    }
  ];

  // Helper values to animate SVG flows dynamically
  const isBatteryDischarging = metrics.storageState === 'discharging';
  const isBatteryCharging = metrics.storageState === 'charging';
  const isHydrogenActive = telemetry.batterySoc <= 0.5 && !telemetry.gridOnline;

  const getTierFlowColor = (tierKey) => {
    if (!metrics.allocationMatrix) return '#52525b';
    const c = metrics.allocationMatrix.find(item => item.tierKey === tierKey);
    if (!c) return '#52525b';
    if (c.status === 'Fully Powered') return '#10b981'; // green
    if (c.status === 'Partially Powered') return '#f59e0b'; // amber
    return '#f43f5e'; // rose
  };

  const isTierFlowActive = (tierKey) => {
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
        <button 
          onClick={resetSimulation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass-button text-xs text-gray-400 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Demand State
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Sliders Console - Left Col (5 cols) */}
        <div className="md:col-span-5 space-y-6">
          <PremiumCard 
            title="Dynamic Demand Regulators" 
            subtitle="Tweak load thresholds in real-time"
            glowType="cyan"
          >
            <div className="space-y-6">
              {slidersList.map((slider) => {
                const currentVal = demands[slider.key] || 0;
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
                      type="range" 
                      min={slider.min} 
                      max={slider.max} 
                      value={currentVal} 
                      onChange={(e) => handleDemandChange(slider.key, e.target.value)}
                      className={`w-full h-1.5 bg-gray-900 rounded-lg appearance-none cursor-pointer ${slider.accent}`}
                    />
                  </div>
                );
              })}
            </div>
          </PremiumCard>

          {/* Core Engine status note */}
          <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] flex items-start gap-3">
            <Cpu className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-gray-400 leading-relaxed">
              <span className="font-semibold text-white block mb-0.5">Priority shedding logic:</span>
              If available power drops below demand, the AI shuts off <span className="text-rose-400">Tier 5 (Administrative Systems)</span> first, followed by <span className="text-amber-400">Tier 4</span>, then <span className="text-amber-400">Tier 3</span>, then <span className="text-amber-400">Tier 2</span>. <span className="text-cyan-400 font-semibold">Tier 1 (ICU & Life Support)</span> is preserved as long as power remains.
            </div>
          </div>
        </div>

        {/* Matrix & Flow Diagram - Right Col (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Energy Flow Visualizer */}
          <PremiumCard 
            title="Energy Flow Schematic" 
            subtitle="Real-time distribution pathways"
          >
            <div className="relative py-2 flex flex-col items-center justify-center bg-black/40 rounded-xl border border-white/[0.04]">
              {/* Detailed interactive SVG canvas */}
              <svg className="w-full h-[280px]" viewBox="0 0 540 280" fill="none">
                {/* Glow Filter defs */}
                <defs>
                  <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                  <filter id="glow-amber" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Animated Connection Lines */}
                {/* Solar -> Battery */}
                <path d="M 90 60 C 130 60, 130 90, 170 90" stroke={metrics.solarGen > 0 ? "#06b6d4" : "#3f3f46"} strokeWidth="1.5" className={metrics.solarGen > 0 ? "animated-flow-line" : ""} style={{ filter: metrics.solarGen > 0 ? "url(#glow-cyan)" : "" }} />
                {/* Wind -> Battery */}
                <path d="M 90 220 C 130 220, 130 90, 170 90" stroke={metrics.windGen > 0 ? "#06b6d4" : "#3f3f46"} strokeWidth="1.5" className={metrics.windGen > 0 ? "animated-flow-line" : ""} style={{ filter: metrics.windGen > 0 ? "url(#glow-cyan)" : "" }} />

                {/* Battery <-> Hydrogen (Bidirectional) */}
                <path 
                  d="M 215 115 L 215 165" 
                  stroke={isBatteryCharging && telemetry.batterySoc >= 99 ? "#14b8a6" : isHydrogenActive ? "#f59e0b" : "#3f3f46"} 
                  strokeWidth="1.5" 
                  className={isBatteryCharging && telemetry.batterySoc >= 99 ? "animated-flow-line" : isHydrogenActive ? "animated-flow-line-reverse" : ""} 
                />

                {/* Battery -> AI Engine */}
                <path 
                  d="M 260 90 C 295 90, 295 140, 330 140" 
                  stroke={isBatteryDischarging && telemetry.batterySoc > 0 ? "#14b8a6" : (isBatteryCharging ? "#14b8a6" : "#3f3f46")} 
                  strokeWidth="1.5" 
                  className={isBatteryDischarging && telemetry.batterySoc > 0 ? "animated-flow-line" : ""} 
                  style={{ filter: isBatteryDischarging && telemetry.batterySoc > 0 ? "url(#glow-teal)" : "" }}
                />
                
                {/* Hydrogen -> AI Engine */}
                <path 
                  d="M 260 190 C 295 190, 295 140, 330 140" 
                  stroke={isHydrogenActive ? "#f59e0b" : "#3f3f46"} 
                  strokeWidth="1.5" 
                  className={isHydrogenActive ? "animated-flow-line" : ""} 
                  style={{ filter: isHydrogenActive ? "url(#glow-amber)" : "" }}
                />

                {/* AI Engine -> Facilities Tiers (Dynamic flow & colors) */}
                {/* AI -> Tier 1 */}
                <path d="M 390 140 C 410 140, 420 40, 440 40" stroke={getTierFlowColor('tier1')} strokeWidth="1.5" className={isTierFlowActive('tier1') ? "animated-flow-line" : ""} />
                {/* AI -> Tier 2 */}
                <path d="M 390 140 C 410 140, 420 90, 440 90" stroke={getTierFlowColor('tier2')} strokeWidth="1.5" className={isTierFlowActive('tier2') ? "animated-flow-line" : ""} />
                {/* AI -> Tier 3 */}
                <path d="M 390 140 L 440 140" stroke={getTierFlowColor('tier3')} strokeWidth="1.5" className={isTierFlowActive('tier3') ? "animated-flow-line" : ""} />
                {/* AI -> Tier 4 */}
                <path d="M 390 140 C 410 140, 420 190, 440 190" stroke={getTierFlowColor('tier4')} strokeWidth="1.5" className={isTierFlowActive('tier4') ? "animated-flow-line" : ""} />
                {/* AI -> Tier 5 */}
                <path d="M 390 140 C 410 140, 420 240, 440 240" stroke={getTierFlowColor('tier5')} strokeWidth="1.5" className={isTierFlowActive('tier5') ? "animated-flow-line" : ""} />

                {/* Node Box representations */}
                {/* Solar Node */}
                <g transform="translate(10, 35)">
                  <rect x="0" y="0" width="80" height="50" rx="8" fill="#0d0f18" stroke="#06b6d4" strokeWidth="1.2" />
                  <text x="40" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Solar Array</text>
                  <text x="40" y="38" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">{metrics.solarGen} kW</text>
                </g>

                {/* Wind Node */}
                <g transform="translate(10, 195)">
                  <rect x="0" y="0" width="80" height="50" rx="8" fill="#0d0f18" stroke="#06b6d4" strokeWidth="1.2" />
                  <text x="40" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Wind Inflow</text>
                  <text x="40" y="38" fill="#06b6d4" fontSize="10" fontWeight="bold" textAnchor="middle">{metrics.windGen} kW</text>
                </g>

                {/* Battery Node */}
                <g transform="translate(170, 65)">
                  <rect x="0" y="0" width="90" height="50" rx="8" fill="#0d0f18" stroke="#14b8a6" strokeWidth="1.2" />
                  <text x="45" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Lithium Batt</text>
                  <text x="45" y="38" fill="#14b8a6" fontSize="10" fontWeight="bold" textAnchor="middle">{telemetry.batterySoc}%</text>
                </g>

                {/* Hydrogen Node */}
                <g transform="translate(170, 165)">
                  <rect x="0" y="0" width="90" height="50" rx="8" fill="#0d0f18" stroke="#f59e0b" strokeWidth="1.2" />
                  <text x="45" y="22" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">Hydrogen H₂</text>
                  <text x="45" y="38" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">{telemetry.hydrogenReserves} kg</text>
                </g>

                {/* AI Priority Engine Node */}
                <g transform="translate(330, 115)">
                  <rect x="0" y="0" width="60" height="50" rx="25" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="animate-pulse" />
                  <text x="30" y="29" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">AI Engine</text>
                </g>

                {/* Facilities Tiers Column */}
                {/* T1 */}
                <g transform="translate(440, 20)">
                  <rect x="0" y="0" width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier1')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 1: ICU / Life</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier1')} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {metrics.allocationMatrix ? `${metrics.allocationMatrix.find(item => item.tierKey === 'tier1')?.status}` : ''}
                  </text>
                </g>
                {/* T2 */}
                <g transform="translate(440, 72)">
                  <rect x="0" y="0" width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier2')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 2: Clinical OP</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier2')} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {metrics.allocationMatrix ? `${metrics.allocationMatrix.find(item => item.tierKey === 'tier2')?.status}` : ''}
                  </text>
                </g>
                {/* T3 */}
                <g transform="translate(440, 124)">
                  <rect x="0" y="0" width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier3')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 3: Sanitation</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier3')} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {metrics.allocationMatrix ? `${metrics.allocationMatrix.find(item => item.tierKey === 'tier3')?.status}` : ''}
                  </text>
                </g>
                {/* T4 */}
                <g transform="translate(440, 176)">
                  <rect x="0" y="0" width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier4')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 4: Satcom</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier4')} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {metrics.allocationMatrix ? `${metrics.allocationMatrix.find(item => item.tierKey === 'tier4')?.status}` : ''}
                  </text>
                </g>
                {/* T5 */}
                <g transform="translate(440, 228)">
                  <rect x="0" y="0" width="90" height="32" rx="4" fill="#0c1015" stroke={getTierFlowColor('tier5')} strokeWidth="1" />
                  <text x="45" y="15" fill="#fff" fontSize="9" fontWeight="semibold" textAnchor="middle">Tier 5: Admin Sys</text>
                  <text x="45" y="26" fill={getTierFlowColor('tier5')} fontSize="8" fontWeight="bold" textAnchor="middle">
                    {metrics.allocationMatrix ? `${metrics.allocationMatrix.find(item => item.tierKey === 'tier5')?.status}` : ''}
                  </text>
                </g>
              </svg>

              <div className="text-[10px] text-gray-500 mt-2 font-mono">
                {!telemetry.gridOnline ? (
                  <span className="text-rose-400 font-semibold animate-pulse">⚠️ OFFLINE CRITICAL: GRID SHEDDING IN PROGRESS</span>
                ) : (
                  <span>GRID ONLINE: FLOW LINES SECURED BY METROPOLITAN LINE</span>
                )}
              </div>
            </div>
          </PremiumCard>

          {/* Allocation Matrix Table */}
          <PremiumCard 
            title="Real-Time Allocation Matrix" 
            subtitle="Tier breakdown computed dynamically"
          >
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
                  {metrics.allocationMatrix && metrics.allocationMatrix.length > 0 ? (
                    metrics.allocationMatrix.map((item) => (
                      <tr key={item.id} className="hover:bg-white/[0.01] transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-white">{item.name}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5 font-medium">{item.tierName}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-black/40 text-gray-400 border border-white/[0.05]">
                            T{item.importance}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-gray-400">{item.requestedPower} kW</td>
                        <td className="py-3.5 px-4 text-right font-semibold font-mono text-white">{item.allocatedPower} kW</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold ${getStatusBadge(item.status)}`}>
                            {item.status}
                          </span>
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
