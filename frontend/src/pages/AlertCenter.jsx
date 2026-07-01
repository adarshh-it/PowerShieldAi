import React from 'react';
import { ShieldAlert, CheckSquare, MessageSquareCode } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import PremiumCard from '../components/PremiumCard';
import AlertItem from '../components/AlertItem';

export default function AlertCenter() {
  const { alerts, refresh } = useEnergy();

  const activeAlerts = alerts.filter(a => !a.acknowledged);
  const acknowledgedAlerts = alerts.filter(a => a.acknowledged);

  const dangerCount = activeAlerts.filter(a => a.type === 'danger').length;
  const warningCount = activeAlerts.filter(a => a.type === 'warning').length;
  const infoCount = activeAlerts.filter(a => a.type === 'info').length;

  return (
    <div className="space-y-6">
      
      {/* Risk Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Total Active Warnings */}
        <PremiumCard 
          glowType={activeAlerts.length > 0 ? "amber" : "teal"}
          title="Active Diagnostics" 
          subtitle="Awaiting technician review"
        >
          <div className="py-2">
            <div className="text-4xl font-extrabold text-white font-mono">{activeAlerts.length}</div>
            <p className="text-xs text-gray-500 mt-2">Requires immediate grid supervision</p>
          </div>
        </PremiumCard>

        {/* Danger count */}
        <div className="p-5 rounded-2xl glass-panel-glow-danger flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-rose-400">Critical Alarms</h4>
            <span className="text-[10px] text-gray-500 font-medium">Tier 1 load shed risk</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-rose-500 font-mono">{dangerCount}</div>
            <p className="text-[10px] text-rose-400/70 mt-1 font-semibold">
              {dangerCount > 0 ? "⚠️ IMMEDIATE ACTION REQUIRED" : "Systems secure"}
            </p>
          </div>
        </div>

        {/* Warning count */}
        <div className="p-5 rounded-2xl glass-panel-glow-amber flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-amber-500">System Warnings</h4>
            <span className="text-[10px] text-gray-500 font-medium">Shedding warnings & reserve limits</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-500 font-mono">{warningCount}</div>
            <p className="text-[10px] text-gray-400 mt-1">Standby buffer active</p>
          </div>
        </div>

        {/* Info count */}
        <div className="p-5 rounded-2xl glass-panel-glow-cyan flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-semibold text-cyan-400">Grid Telemetry Status</h4>
            <span className="text-[10px] text-gray-500 font-medium">Standard operations log</span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-cyan-400 font-mono">{infoCount}</div>
            <p className="text-[10px] text-gray-400 mt-1">Normal connection pulses</p>
          </div>
        </div>
      </div>

      {/* Main Alert Log Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Active Alarms Column (2/3 width) */}
        <div className="md:col-span-2 space-y-6">
          <PremiumCard 
            title="Active Alarm Log" 
            subtitle="Real-time emergency events requiring acknowledgement"
            action={
              <button 
                onClick={() => refresh(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg glass-button text-xs text-gray-400 hover:text-white"
              >
                Sync Logs
              </button>
            }
          >
            <div className="space-y-3.5 mt-2 max-h-[500px] overflow-y-auto pr-1">
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))
              ) : (
                <div className="py-12 flex flex-col items-center justify-center text-center border border-dashed border-white/[0.05] rounded-xl bg-white/[0.005]">
                  <CheckSquare className="w-8 h-8 text-emerald-500 mb-3" />
                  <h4 className="text-sm font-semibold text-white">All Clear</h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                    No active energy grid hazards. Microgrid telemetry operating under green values.
                  </p>
                </div>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Acknowledged History Column (1/3 width) */}
        <div className="md:col-span-1">
          <PremiumCard 
            title="Resolved Archive" 
            subtitle="Recently acknowledged event logs"
          >
            <div className="space-y-3 mt-2 max-h-[500px] overflow-y-auto pr-1">
              {acknowledgedAlerts.length > 0 ? (
                acknowledgedAlerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className="p-3.5 rounded-xl bg-white/[0.01] border border-white/[0.03] text-xs space-y-1 text-gray-500"
                  >
                    <div className="flex justify-between items-center font-mono">
                      <span>{alert.source}</span>
                      <span>{new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-gray-400 font-medium">{alert.message}</p>
                    <span className="inline-block text-[9px] text-emerald-500/80 font-bold bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                      Acknowledged
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-500 border border-dashed border-white/[0.04] rounded-xl font-medium">
                  No resolved history in current session.
                </div>
              )}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
