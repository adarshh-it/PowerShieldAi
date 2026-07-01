import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  Zap, 
  Cpu, 
  Activity, 
  BarChart3, 
  Globe, 
  ArrowRight,
  Sun,
  Wind,
  Battery,
  Flame,
  CheckCircle,
  Clock
} from 'lucide-react';

export default function LandingPage() {
  const steps = [
    {
      num: "01",
      title: "Telemetry Stream",
      desc: "Sensors poll solar arrays, wind turbines, battery SOC, and hydrogen reserve levels in real time."
    },
    {
      num: "02",
      title: "Threat Evaluation",
      desc: "The AI checks meteorological storm conditions and grid stability thresholds to forecast outage risks."
    },
    {
      num: "03",
      title: "Shedding Action",
      desc: "During blackouts, the allocation engine sheds lower-tier loads (admin, offices) to conserve reserves."
    },
    {
      num: "04",
      title: "ICU Protection",
      desc: "Power is locked to Tier 1 devices, keeping ventilators and clinical monitors running indefinitely."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#06070a] overflow-hidden text-gray-200 font-sans">
      
      {/* Decorative Glow Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[20%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[90px] pointer-events-none" />

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.003)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.003)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      {/* Navigation Header */}
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-black shadow-glowCyan">
            <ShieldAlert className="w-5.5 h-5.5 stroke-[2.5]" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">PowerShield <span className="text-cyan-400 font-medium font-mono">AI</span></span>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-cyan-500/30 text-sm font-semibold text-white transition-all hover:bg-white/[0.05]"
          >
            Launch Console <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-16 pb-20 relative z-10 flex flex-col items-center text-center">
        
        {/* Hacker-style micro badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs font-semibold text-cyan-400 mb-8 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 fill-cyan-400/20" />
          AI-POWERED MICROGRID SYSTEM RESILIENCE
        </div>

        {/* Hero Title */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.1] mb-6">
          PowerShield <span className="text-cyan-400">AI</span>
        </h1>
        
        <p className="text-xl md:text-2xl font-bold text-gray-300 max-w-3xl mb-4 leading-normal">
          AI-Powered Renewable Energy Resilience Platform
        </p>

        {/* Hero Description */}
        <p className="text-base md:text-lg text-gray-400 max-w-2xl font-light leading-relaxed mb-12">
          Protecting Hospitals and Critical Infrastructure During Energy Emergencies. Autonomously balancing solar, wind, battery, and hydrogen fuel cells to keep ICU units online when the main utility fails.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-20">
          <Link
            to="/dashboard"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-black font-semibold text-base shadow-glowCyan hover:shadow-cyan-500/30 hover:scale-[1.01] transition-all flex items-center gap-2"
          >
            Launch Energy Console
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#how-it-works"
            className="px-8 py-4 rounded-xl glass-button text-base font-semibold text-gray-300 hover:text-white"
          >
            See How It Works
          </a>
        </div>

        {/* Statistics Section (KPI widgets) */}
        <div className="w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 mb-24 text-left">
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-lg">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">CRITICAL UPTIME</span>
            <div className="text-2xl font-extrabold text-white mt-1.5">99.999%</div>
            <p className="text-xs text-gray-400 mt-1 leading-normal">Zero power drops in critical emergency zones.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-lg">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">AUTONOMOUS SWITCH</span>
            <div className="text-2xl font-extrabold text-teal-400 mt-1.5">&lt; 4.0s</div>
            <p className="text-xs text-gray-400 mt-1 leading-normal">Instant isolation from grid failure threats.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-lg">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">DEMAND CAPACITY</span>
            <div className="text-2xl font-extrabold text-white mt-1.5">120 kW</div>
            <p className="text-xs text-gray-400 mt-1 leading-normal">Simulated maximum emergency hospitals load.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/[0.01] border border-white/[0.05] shadow-lg">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">RENEWABLES IN USE</span>
            <div className="text-2xl font-extrabold text-cyan-400 mt-1.5">4 Sources</div>
            <p className="text-xs text-gray-400 mt-1 leading-normal">Solar, Wind, Battery and Hydrogen fuel cells.</p>
          </div>
        </div>

        {/* Live System Mock Preview Frame */}
        <div className="w-full max-w-5xl rounded-2xl border border-white/[0.06] p-2 bg-[#0d0e14]/50 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative mb-24">
          <div className="absolute -inset-0 rounded-2xl bg-gradient-to-tr from-cyan-500/10 to-teal-500/10 opacity-30 blur-lg pointer-events-none" />
          
          <div className="rounded-xl overflow-hidden bg-[#07080c] border border-white/[0.04]">
            {/* Window chrome */}
            <div className="bg-black/40 px-4 py-3 border-b border-white/[0.04] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                <span className="text-[10px] text-gray-600 font-mono ml-4">powershield-console.hospital-grid.int</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[8px] font-extrabold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase tracking-widest">Outage Test Mode</span>
            </div>
            
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {/* Box 1 */}
              <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">RESILIENCE RATING</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">92/100</span>
                </div>
                <div className="text-2xl font-extrabold text-white mt-3">92% Secure</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">● Normal green standby</div>
              </div>
              
              {/* Box 2 */}
              <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">CRITICAL LIFE LINE</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">TIER 1</span>
                </div>
                <div className="text-2xl font-extrabold text-white mt-3">120.0 kW</div>
                <div className="text-[10px] text-cyan-400 flex items-center gap-1 mt-1 font-medium">● 100% Fully Powered</div>
              </div>
              
              {/* Box 3 */}
              <div className="p-5 rounded-xl bg-white/[0.01] border border-white/[0.04]">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider">DISASTER RESPONSE</span>
                  <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">SHEDDING ARMED</span>
                </div>
                <div className="text-2xl font-extrabold text-white mt-3">Autonomous</div>
                <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-medium">● Auto-sheds lower priorities</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-16 border-t border-white/[0.03] text-left">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-white">How PowerShield AI Operates</h2>
            <p className="text-gray-400 text-sm max-w-xl mx-auto mt-2 font-light">
              Deep-priority safety algorithms designed to secure clinical operations during sudden blackout crises.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/[0.01] border border-white/[0.04] relative">
                <span className="text-4xl font-extrabold font-mono text-cyan-500/10 absolute top-4 right-6">{step.num}</span>
                <h3 className="text-base font-bold text-white mb-2.5 mt-3">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture Showcase Diagram Section */}
        <section className="w-full py-16 border-t border-white/[0.03] text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <h2 className="text-3xl font-extrabold text-white tracking-tight">Microgrid System Architecture</h2>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                PowerShield AI connects multiple generation elements, physical batteries, and chemical hydrogen storage cells. The AI Priority Engine continuously evaluates total load demands and implements load-shedding directives instantly when grid connections fail.
              </p>
              
              <div className="space-y-3.5">
                <div className="flex gap-3 items-center">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Sun className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs text-gray-300 font-semibold">Photovoltaic tracking weather controllers</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Wind className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs text-gray-300 font-semibold">Aerodynamic turbine kinematics monitors</span>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 shrink-0">
                    <Battery className="w-4.5 h-4.5" />
                  </div>
                  <span className="text-xs text-gray-300 font-semibold">Lithium battery charge state optimization</span>
                </div>
              </div>
            </div>

            {/* Architecture Preview Vector Canvas */}
            <div className="p-6 rounded-2xl bg-[#090b10] border border-white/[0.04] shadow-xl flex items-center justify-center">
              <svg className="w-full max-w-[360px] h-[220px]" viewBox="0 0 320 200" fill="none">
                {/* Generation Block */}
                <rect x="10" y="20" width="70" height="40" rx="6" fill="#0d0f18" stroke="#06b6d4" strokeWidth="1" />
                <text x="45" y="44" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">Renewables</text>

                {/* Storage Block */}
                <rect x="10" y="140" width="70" height="40" rx="6" fill="#0d0f18" stroke="#14b8a6" strokeWidth="1" />
                <text x="45" y="164" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">Storage</text>

                {/* AI Center */}
                <circle cx="160" cy="100" r="30" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" className="animate-pulse" />
                <text x="160" y="103" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">AI Engine</text>

                {/* Hospital Demand Block */}
                <rect x="240" y="80" width="70" height="40" rx="6" fill="#0d0f18" stroke="#ef4444" strokeWidth="1" />
                <text x="275" y="104" fill="#fff" fontSize="9" fontWeight="bold" textAnchor="middle">Critical Hospital</text>

                {/* Arrow lines */}
                <path d="M 80 40 L 130 80" stroke="#06b6d4" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 80 160 L 130 120" stroke="#14b8a6" strokeWidth="1" strokeDasharray="3 3" />
                <path d="M 190 100 L 240 100" stroke="#6366f1" strokeWidth="1" />
              </svg>
            </div>

          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 text-center text-xs text-gray-600 border-t border-white/[0.03] relative z-10">
        <p>© 2026 PowerShield AI. Developed for hackathon microgrid compliance validations.</p>
      </footer>
    </div>
  );
}
