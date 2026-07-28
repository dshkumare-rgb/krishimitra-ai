import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiCpu, FiDroplet, FiSettings, FiCheckCircle, FiActivity } from 'react-icons/fi';

export const ResourceOptimizerPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [moisture, setMoisture] = useState(65);
  const [nitrogen, setNitrogen] = useState(45);
  const [phosphorus, setPhosphorus] = useState(60);
  const [potassium, setPotassium] = useState(78);

  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationLog, setOptimizationLog] = useState<string[]>([]);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);

  // SVG Ring Circle calculation helpers
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const getStrokeOffset = (percentage: number) => {
    return circumference - (percentage / 100) * circumference;
  };

  const triggerOptimization = () => {
    setIsOptimizing(true);
    setOptimizedResult(null);
    setOptimizationLog([]);

    const steps = [
      'Reading moisture capacitance sensors...',
      'Mapping Nitrogen (N) deficiency markers...',
      'Calibrating drip irrigation flow levels...',
      'Synthesizing dosage recommendation payload...'
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setOptimizationLog((prev) => [...prev, `⚙️ ${step}`]);
        if (index === steps.length - 1) {
          setTimeout(() => {
            // Apply simulated changes
            setMoisture(80);
            setNitrogen(85);
            setPhosphorus(80);
            setPotassium(90);
            setOptimizedResult(
              'Optimization Complete!\n• Drip Valve 2 flow increased to 2.4L/hr (Soil hydration normalized).\n• Custom Dosage: Inject Urea 12kg/acre, Potassium Chloride 8kg/acre into liquid feed.'
            );
            setIsOptimizing(false);
          }, 800);
        }
      }, (index + 1) * 800);
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          💧 Smart Resource Optimization
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Automated soil nutrient balancing, drip irrigation regulators, and customized fertilizer dosage recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Circular Gauges (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-6 flex flex-col justify-between">
          
          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-xs uppercase tracking-wider">Soil Telemetry Ratios</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6">
            
            {/* Soil Moisture */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="dark:stroke-gray-850" />
                  <circle cx="48" cy="48" r={radius} stroke="#3b82f6" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(moisture)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-gray-850 dark:text-gray-100">
                  <span className="text-base">{moisture}%</span>
                  <span className="text-[8px] text-gray-400 uppercase">Moisture</span>
                </div>
              </div>
            </div>

            {/* Nitrogen (N) */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="dark:stroke-gray-850" />
                  <circle cx="48" cy="48" r={radius} stroke="#22c55e" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(nitrogen)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-gray-850 dark:text-gray-100">
                  <span className="text-base">{nitrogen}%</span>
                  <span className="text-[8px] text-gray-400 uppercase">Nitrogen</span>
                </div>
              </div>
            </div>

            {/* Phosphorus (P) */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="dark:stroke-gray-850" />
                  <circle cx="48" cy="48" r={radius} stroke="#f59e0b" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(phosphorus)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-gray-850 dark:text-gray-100">
                  <span className="text-base">{phosphorus}%</span>
                  <span className="text-[8px] text-gray-400 uppercase">Phosphorus</span>
                </div>
              </div>
            </div>

            {/* Potassium (K) */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="48" cy="48" r={radius} stroke="#e2e8f0" strokeWidth="8" fill="transparent" className="dark:stroke-gray-850" />
                  <circle cx="48" cy="48" r={radius} stroke="#a855f7" strokeWidth="8" fill="transparent" 
                    strokeDasharray={circumference}
                    strokeDashoffset={getStrokeOffset(potassium)}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-black text-gray-850 dark:text-gray-100">
                  <span className="text-base">{potassium}%</span>
                  <span className="text-[8px] text-gray-400 uppercase">Potassium</span>
                </div>
              </div>
            </div>

          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl text-xs font-semibold text-gray-600 dark:text-gray-400">
            📊 Current status indicates moderate soil Nitrogen deficits. Optimize system below to balance ratios.
          </div>

        </div>

        {/* Right Side: Optimization controls (1 col) */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col justify-between space-y-6">
          
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FiCpu className="w-4 h-4 text-primary-650" /> Optimizer Suite
            </h3>

            {/* Logs view */}
            <div className="h-[180px] bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl p-4 font-mono text-[10px] text-gray-500 overflow-y-auto space-y-1.5 leading-relaxed">
              {optimizationLog.map((log, idx) => (
                <div key={idx} className="fade-in">{log}</div>
              ))}
              {isOptimizing && <div className="text-primary-600 dark:text-primary-400 animate-pulse">Running resource sweep...</div>}
              {!isOptimizing && !optimizedResult && <div className="text-gray-400">Click Optimize to begin balancing.</div>}
              
              {optimizedResult && (
                <div className="text-emerald-600 dark:text-emerald-400 mt-2 font-bold whitespace-pre-line leading-normal border-t border-gray-200 dark:border-gray-850 pt-2">
                  {optimizedResult}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={triggerOptimization}
            disabled={isOptimizing}
            className="w-full py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold shadow-md shadow-primary-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <FiSettings className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} /> Auto-Optimize System
          </button>

        </div>

      </div>

    </div>
  );
};

export default ResourceOptimizerPage;
