import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiSliders, FiBattery, FiCompass, FiAlertCircle, FiSettings, FiActivity, FiRefreshCw, FiZap } from 'react-icons/fi';
import VideoGuidesSection from '../components/VideoGuidesSection';


interface Machinery {
  id: string;
  name: string;
  type: string;
  icon: string;
  fuelType: 'Fuel' | 'Battery';
  fuelLevel: number;
  lat: number;
  lon: number;
  task: string;
  health: 'NORMAL' | 'MAINTENANCE NEEDED';
  rpm: number;
  temp: number;
}

export const MachineryTrackerPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [machineryList, setMachineryList] = useState<Machinery[]>([
    {
      id: 'm-1',
      name: 'John Deere 8R Tractor',
      type: 'Tractor',
      icon: '🚜',
      fuelType: 'Fuel',
      fuelLevel: 78,
      lat: 30.9015,
      lon: 75.8523,
      task: 'Ploughing - Sector B (ਵਾਹੀ)',
      health: 'NORMAL',
      rpm: 1850,
      temp: 84
    },
    {
      id: 'm-2',
      name: 'Case IH Axial Harvester',
      type: 'Harvester',
      icon: '🌾',
      fuelType: 'Fuel',
      fuelLevel: 42,
      lat: 30.9082,
      lon: 75.8611,
      task: 'Harvesting - Sector A (ਵਾਢੀ)',
      health: 'NORMAL',
      rpm: 2100,
      temp: 88
    },
    {
      id: 'm-3',
      name: 'Mahindra Novo Tractor',
      type: 'Tractor',
      icon: '🚜',
      fuelType: 'Fuel',
      fuelLevel: 15,
      lat: 30.8954,
      lon: 75.8449,
      task: 'Seeding - Sector C (ਬੀਜਾਈ)',
      health: 'MAINTENANCE NEEDED',
      rpm: 1400,
      temp: 95
    },
    {
      id: 'm-4',
      name: 'DJI Agras T40 Drone',
      type: 'Sprayer Drone',
      icon: '🛸',
      fuelType: 'Battery',
      fuelLevel: 65,
      lat: 30.9102,
      lon: 75.8492,
      task: 'Pesticide Spraying - Sector D',
      health: 'NORMAL',
      rpm: 4800,
      temp: 42
    }
  ]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Telemetry fluctuation simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setMachineryList((prev) =>
        prev.map((m) => {
          // Fuel drop slowly
          const nextFuel = Math.max(0, m.fuelLevel - 0.05);
          // Minor gps coordinates fluctuation
          const nextLat = m.lat + (Math.random() - 0.5) * 0.0001;
          const nextLon = m.lon + (Math.random() - 0.5) * 0.0001;
          // RPM fluctuation
          const nextRpm = m.rpm + Math.floor((Math.random() - 0.5) * 50);

          return {
            ...m,
            fuelLevel: parseFloat(nextFuel.toFixed(2)),
            lat: parseFloat(nextLat.toFixed(5)),
            lon: parseFloat(nextLon.toFixed(5)),
            rpm: nextRpm
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const handleHalt = (name: string) => {
    alert(`🚨 ALERT: Emergency Halt command dispatched to ${name}. Engine shutdown initiated.`);
  };

  const getFuelColor = (level: number) => {
    if (level < 20) return 'bg-red-500';
    if (level < 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🚜 IoT Machinery Fleet Monitor
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Real-time tracking of active tractors, harvesters, and sprayers via connected GPS modules.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          className="py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-primary-500/10 transition"
        >
          <FiRefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh Telemetry
        </button>
      </div>

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {machineryList.map((m) => {
          const isExpanded = expandedId === m.id;
          return (
            <div 
              key={m.id}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm p-6 space-y-4 hover:border-primary-350 dark:hover:border-primary-800 transition-all duration-300"
            >
              {/* Card Header Info */}
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center">
                  <span className="text-3xl p-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl">
                    {m.icon}
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-800 dark:text-gray-100">{m.name}</h3>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase">{m.type}</span>
                  </div>
                </div>

                {/* Health Badge */}
                <span className={`px-2.5 py-1 text-[9px] font-black rounded-full uppercase ${
                  m.health === 'NORMAL' 
                    ? 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900' 
                    : 'bg-amber-50 text-amber-700 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 animate-pulse'
                }`}>
                  {m.health === 'NORMAL' ? '🟢 Normal' : '⚠️ Service Req.'}
                </span>
              </div>

              {/* Fuel & Tasks list */}
              <div className="space-y-3.5 text-xs font-semibold text-gray-600 dark:text-gray-400">
                
                {/* Fuel Level Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="flex items-center gap-1"><FiZap className="w-3.5 h-3.5" /> {m.fuelType} Level</span>
                    <span className="font-bold">{m.fuelLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getFuelColor(m.fuelLevel)}`}
                      style={{ width: `${m.fuelLevel}%` }}
                    />
                  </div>
                </div>

                {/* Task Details */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Task:</span>
                  <span className="text-gray-850 dark:text-gray-250 font-bold">{m.task}</span>
                </div>

                {/* Live GPS coords */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400 flex items-center gap-1"><FiCompass className="w-4 h-4" /> Coordinates:</span>
                  <span className="text-primary-650 dark:text-primary-400 font-bold">{m.lat.toFixed(5)}N, {m.lon.toFixed(5)}E</span>
                </div>

              </div>

              {/* Collapsible telemetry analytics */}
              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-850 pt-4 grid grid-cols-2 gap-4 text-xs font-bold bg-gray-50/50 dark:bg-gray-950/20 p-3 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-gray-400 block">Engine Output (RPM)</span>
                    <span className="text-gray-700 dark:text-gray-300 font-extrabold">{m.rpm} RPM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block">Core Temperature</span>
                    <span className="text-gray-700 dark:text-gray-300 font-extrabold">{m.temp}°C</span>
                  </div>
                </div>
              )}

              {/* Action Buttons footer */}
              <div className="grid grid-cols-3 gap-2.5 pt-2 text-xs font-bold">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : m.id)}
                  className="py-2.5 px-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-xl transition flex items-center justify-center gap-1 text-gray-700 dark:text-gray-300"
                >
                  <FiSettings className="w-3.5 h-3.5" /> {isExpanded ? 'Hide Info' : 'Diagnostic Details'}
                </button>
                <button
                  onClick={() => alert(`Ping dispatched. Coordinates updated for ${m.name}.`)}
                  className="py-2.5 px-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-xl transition flex items-center justify-center gap-1 text-gray-700 dark:text-gray-300"
                >
                  <FiCompass className="w-3.5 h-3.5" /> Locate
                </button>
                <button
                  onClick={() => handleHalt(m.name)}
                  className="py-2.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 rounded-xl transition flex items-center justify-center gap-1"
                >
                  <FiAlertCircle className="w-3.5 h-3.5" /> Engine Halt
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Video Guides Section */}
      <div className="pt-8 border-t border-gray-150 dark:border-gray-800">
        <VideoGuidesSection context="machinery" />
      </div>

    </div>
  );
};

export default MachineryTrackerPage;
