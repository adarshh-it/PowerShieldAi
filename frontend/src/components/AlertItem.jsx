import React from 'react';
import { AlertCircle, AlertTriangle, Info, Check } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';

export default function AlertItem({ alert }) {
  const { acknowledgeAlert } = useEnergy();

  const getAlertConfig = (type) => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-rose-950/20 border-rose-500/20 text-rose-300',
          icon: AlertCircle,
          iconColor: 'text-rose-500',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          glowType: 'danger'
        };
      case 'warning':
        return {
          bg: 'bg-amber-950/20 border-amber-500/20 text-amber-300',
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          glowType: 'amber'
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-950/20 border-cyan-500/20 text-cyan-300',
          icon: Info,
          iconColor: 'text-cyan-400',
          badge: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
          glowType: 'cyan'
        };
    }
  };

  const config = getAlertConfig(alert.type);
  const Icon = config.icon;
  const timeString = new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div 
      className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all duration-300 ${
        alert.acknowledged ? 'bg-white/[0.01] border-white/[0.04] text-gray-400' : config.bg
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div className={`p-2 rounded-lg bg-black/40 border border-white/[0.05] flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${alert.acknowledged ? 'text-gray-600' : config.iconColor}`} />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">{timeString}</span>
            <span className="text-xs font-medium text-gray-400">•</span>
            <span className="text-xs font-semibold tracking-wider uppercase text-gray-400">{alert.source}</span>
            {!alert.acknowledged && (
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 neon-breath" />
            )}
          </div>
          <p className="text-sm font-medium mt-1 leading-relaxed">{alert.message}</p>
        </div>
      </div>
      
      {!alert.acknowledged && (
        <button
          onClick={() => acknowledgeAlert(alert.id)}
          className="p-1.5 rounded-lg bg-black/30 border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/[0.1] text-gray-400 hover:text-white transition-all flex-shrink-0"
          title="Acknowledge Alert"
        >
          <Check className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
