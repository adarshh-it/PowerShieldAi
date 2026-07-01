import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { BarChart3, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useEnergy } from '../context/EnergyContext';
import PremiumCard from '../components/PremiumCard';

export default function Analytics() {
  const { metrics, telemetry } = useEnergy();

  // Parse chart data for forecasted hours
  const chartData = [];
  if (metrics.forecast && metrics.forecast.demandForecast) {
    const dem = metrics.forecast.demandForecast;
    const gen = metrics.forecast.generationForecast;
    for (let i = 0; i < dem.length; i++) {
      chartData.push({
        time: dem[i].time,
        Demand: dem[i].value,
        Generation: gen[i] ? gen[i].value : 0
      });
    }
  }

  // Fallback data if list empty
  const defaultChartData = [
    { time: '12:00', Demand: 140, Generation: 160 },
    { time: '13:00', Demand: 160, Generation: 155 },
    { time: '14:00', Demand: 180, Generation: 130 },
    { time: '15:00', Demand: 210, Generation: 95 },
    { time: '16:00', Demand: 230, Generation: 60 },
    { time: '17:00', Demand: 190, Generation: 40 },
  ];

  const activeData = chartData.length > 0 ? chartData : defaultChartData;

  // Format backup duration display text
  const getRemainingTimeText = () => {
    if (telemetry.gridOnline) return "Continuous (Grid Online)";
    if (metrics.remainingHours >= 72) return "Grid Stabilized (72h+)";
    if (metrics.remainingHours <= 0) return "Depleted";
    
    const hrs = Math.floor(metrics.remainingHours);
    const mins = Math.round((metrics.remainingHours - hrs) * 60);
    return `${hrs}h ${mins}m remaining`;
  };

  const getRemainingTimeColor = () => {
    if (telemetry.gridOnline) return "text-emerald-400";
    if (metrics.remainingHours < 4) return "text-rose-500 animate-pulse";
    if (metrics.remainingHours < 12) return "text-amber-400";
    return "text-cyan-400";
  };

  // Custom tooltips for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0b0c10] border border-white/[0.08] p-3 rounded-lg text-xs space-y-1.5 shadow-xl">
          <p className="font-semibold text-gray-400 font-mono">Time: {label}</p>
          {payload.map((p, index) => (
            <p key={index} className="font-bold" style={{ color: p.color }}>
              {p.name}: {p.value} kW
            </p>
          ))}
        </div>
      );
    };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Telemetry Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Backup Life Clock Card */}
        <PremiumCard 
          glowType={telemetry.gridOnline ? "teal" : metrics.remainingHours < 6 ? "danger" : "amber"}
          title="Backup Duration Estimate"
          subtitle="Remaining storage lifespan projection"
          action={<Clock className="w-5 h-5 text-gray-400" />}
        >
          <div className="py-4">
            <div className={`text-3xl font-extrabold ${getRemainingTimeColor()} tracking-tight font-mono`}>
              {getRemainingTimeText()}
            </div>
            
            {!telemetry.gridOnline ? (
              <p className="text-xs text-rose-400 mt-2.5 flex items-center gap-1.5 font-medium leading-relaxed">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                Critical warning: Local microgrid operating under full storage discharge.
              </p>
            ) : (
              <p className="text-xs text-gray-500 mt-2.5 leading-relaxed">
                Main electrical grid is stable. Storage is currently trickle-charging or sitting on standby buffers.
              </p>
            )}
          </div>
        </PremiumCard>

        {/* Battery deplete stats */}
        <PremiumCard
          title="Battery Depletion Speed"
          subtitle="Direct load depletion timeline"
          action={<BarChart3 className="w-5 h-5 text-teal-400" />}
        >
          <div className="py-4">
            <div className="text-2xl font-bold text-white font-mono">
              {telemetry.gridOnline ? "Standby" : metrics.batteryDepletionHours >= 999 ? "No Drain" : `${metrics.batteryDepletionHours} Hours`}
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5 mt-3.5">
              <div 
                className="bg-teal-400 h-1.5 rounded-full" 
                style={{ width: `${Math.max(5, Math.min(100, telemetry.batterySoc))}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Lithium Reserves: {telemetry.batterySoc}% SOC</p>
          </div>
        </PremiumCard>

        {/* Hydrogen deplete stats */}
        <PremiumCard
          title="Fuel Cell Depletion Speed"
          subtitle="Hydrogen depletion timeline"
          action={<Clock className="w-5 h-5 text-amber-500" />}
        >
          <div className="py-4">
            <div className="text-2xl font-bold text-white font-mono">
              {telemetry.gridOnline ? "Standby" : metrics.hydrogenDepletionHours >= 999 ? "No Drain" : `${metrics.hydrogenDepletionHours} Hours`}
            </div>
            <div className="w-full bg-gray-900 rounded-full h-1.5 mt-3.5">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${Math.max(5, Math.min(100, (telemetry.hydrogenReserves / telemetry.hydrogenCapacity) * 100))}%` }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-2 font-medium">Hydrogen Reserves: {telemetry.hydrogenReserves} kg</p>
          </div>
        </PremiumCard>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Area Chart - Supply vs Demand */}
        <PremiumCard 
          title="Demand & Generation Forecast" 
          subtitle="6-Hour predictive power levels (kW)"
          glowType="cyan"
        >
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={activeData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorDemand" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Generation" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorGen)" 
                  name="Renewable Gen (kW)"
                />
                <Area 
                  type="monotone" 
                  dataKey="Demand" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorDemand)" 
                  name="Total Demand (kW)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>

        {/* Storage Volume Comparison */}
        <PremiumCard 
          title="Backup Reserves Distribution" 
          subtitle="Instantaneous capacity ratio equivalents"
        >
          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  {
                    name: 'Lithium Battery',
                    Current: Math.round((telemetry.batterySoc/100) * telemetry.batteryCapacity),
                    Capacity: telemetry.batteryCapacity,
                  },
                  {
                    name: 'Hydrogen Reserves',
                    Current: Math.round(telemetry.hydrogenReserves * 33.3),
                    Capacity: Math.round(telemetry.hydrogenCapacity * 33.3),
                  }
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                barSize={32}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#52525b" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  formatter={(value) => [`${value} kWh`, '']}
                  contentStyle={{ backgroundColor: '#0b0c10', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  wrapperStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="Capacity" fill="rgba(255,255,255,0.05)" name="Max Capacity (kWh eq)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Current" fill="#14b8a6" name="Available Energy (kWh eq)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>
    </div>
  );
}
