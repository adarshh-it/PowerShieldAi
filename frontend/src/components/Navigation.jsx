import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  Sliders, 
  BarChart3, 
  AlertTriangle, 
  RefreshCw, 
  Flame, 
  Activity, 
  Globe,
  Shield
} from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';

export default function Navigation() {
  const location = useLocation();
  const { telemetry, resetSimulation, triggerDisasterMode } = useEnergy();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Command Center', path: '/command-center', icon: Shield },
    { name: 'Resource Allocation', path: '/allocation', icon: Sliders },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Alert Center', path: '/alerts', icon: AlertTriangle },
  ];

  return (
    <aside className="w-80 h-screen fixed top-0 left-0 bg-darkBg border-r border-borderBg flex flex-col justify-between p-6 z-40">
      <div className="flex flex-col gap-8">
        {/* Brand logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-500 text-black shadow-glowCyan group-hover:scale-105 transition-all">
            <ShieldAlert className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-none">PowerShield <span className="text-cyan-400 font-medium">AI</span></h1>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Renewable Microgrid</span>
          </div>
        </Link>

        {/* Global Live Indicators */}
        <div className="p-4 rounded-xl bg-cardBg border border-borderBg flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Grid Status</span>
            {telemetry.gridOnline ? (
              <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full text-[10px]">
                ● Online
              </span>
            ) : (
              <span className="flex items-center gap-1 text-rose-500 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                ● Outage
              </span>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5" /> Microgrid System</span>
            {telemetry.disasterMode ? (
              <span className="flex items-center gap-1 text-red-500 font-semibold bg-red-500/10 px-2 py-0.5 rounded-full text-[10px] animate-pulse">
                ⚠️ Disaster Mode
              </span>
            ) : (
              <span className="flex items-center gap-1 text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full text-[10px]">
                Active
              </span>
            )}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group text-sm ${
                  active 
                    ? 'bg-gradient-to-r from-cyan-500/10 to-teal-500/5 text-cyan-400 border border-cyan-500/20 font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02] border border-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-105 ${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer controls */}
      <div className="flex flex-col gap-2">
        <button
          onClick={triggerDisasterMode}
          disabled={telemetry.disasterMode}
          className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border text-sm font-semibold transition-all ${
            telemetry.disasterMode 
              ? 'bg-red-500/10 border-red-500/20 text-red-500/60 cursor-not-allowed' 
              : 'bg-red-950/20 border-red-900/30 hover:border-red-500/50 text-red-400 hover:bg-red-500/10 shadow-glowRed/5'
          }`}
        >
          <Flame className="w-4 h-4" />
          Activate Disaster Mode
        </button>

        <button
          onClick={resetSimulation}
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl glass-button text-xs text-gray-400 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset Simulation State
        </button>
      </div>
    </aside>
  );
}
