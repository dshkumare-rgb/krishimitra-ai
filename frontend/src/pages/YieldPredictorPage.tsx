import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { FiTrendingUp, FiDollarSign, FiPercent, FiCpu, FiMapPin } from 'react-icons/fi';

export const YieldPredictorPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [crop, setCrop] = useState<'Wheat' | 'Paddy' | 'Cotton' | 'Maize' | 'Mustard' | 'Sugarcane'>('Wheat');
  const [landSize, setLandSize] = useState(5);
  
  // Crop parameters config
  const cropConfigs = {
    Wheat: {
      yieldPerAcre: 45,
      confidence: 92,
      mandiPrice: 2275,
      costPerAcre: 18000,
      historical: [38, 40, 42, 41, 44],
      projected: [45, 47]
    },
    Paddy: {
      yieldPerAcre: 52,
      confidence: 88,
      mandiPrice: 2183,
      costPerAcre: 22000,
      historical: [45, 48, 46, 50, 49],
      projected: [52, 54]
    },
    Cotton: {
      yieldPerAcre: 28,
      confidence: 85,
      mandiPrice: 6620,
      costPerAcre: 26000,
      historical: [22, 24, 23, 26, 25],
      projected: [28, 29]
    },
    Maize: {
      yieldPerAcre: 38,
      confidence: 90,
      mandiPrice: 1960,
      costPerAcre: 16000,
      historical: [31, 33, 35, 34, 36],
      projected: [38, 40]
    },
    Mustard: {
      yieldPerAcre: 22,
      confidence: 89,
      mandiPrice: 5650,
      costPerAcre: 12000,
      historical: [18, 19, 20, 19, 21],
      projected: [22, 23]
    },
    Sugarcane: {
      yieldPerAcre: 350,
      confidence: 91,
      mandiPrice: 340,
      costPerAcre: 45000,
      historical: [310, 320, 335, 330, 345],
      projected: [350, 360]
    }
  };

  const config = cropConfigs[crop];

  // Calculated Metrics
  const totalYield = config.yieldPerAcre * landSize;
  const estimatedRevenue = totalYield * config.mandiPrice;
  const estimatedCost = config.costPerAcre * landSize;
  const netEarnings = estimatedRevenue - estimatedCost;

  // Chart Setup: Historical + AI projections
  const chartLabels = ['2021', '2022', '2023', '2024', '2025', '2026 (AI)', '2027 (AI)'];
  
  // Combine historical and projected data for continuous line
  const historicalData = [...config.historical, null, null];
  const projectionData = [
    ...Array(4).fill(null), 
    config.historical[4], // connect last historical point
    ...config.projected
  ];

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: 'Historical Harvest (Quintals/Acre)',
        data: historicalData,
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
        pointBackgroundColor: '#22c55e'
      },
      {
        label: 'AI Projected Yield (Quintals/Acre)',
        data: projectionData,
        borderColor: '#3b82f6',
        borderDash: [6, 6],
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.3,
        spanGaps: true,
        pointRadius: 4,
        pointBackgroundColor: '#3b82f6'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? '#cbd5e1' : '#475569',
          font: { family: 'Outfit, sans-serif', size: 11 }
        }
      },
      tooltip: {
        padding: 10,
        cornerRadius: 8,
        titleFont: { family: 'Outfit, sans-serif' },
        bodyFont: { family: 'Outfit, sans-serif' }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748b', font: { family: 'Outfit, sans-serif' } }
      },
      y: {
        grid: { color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
        ticks: { color: '#64748b', font: { family: 'Outfit, sans-serif' } }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          📊 AI Harvest & Yield Predictor
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Predict seasonal outputs and crop profit margins using machine learning algorithms integrated with local market Mandi indexes.
        </p>
      </div>

      {/* Inputs Selector Card */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Crop Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {(['Wheat', 'Paddy', 'Cotton', 'Maize', 'Mustard', 'Sugarcane'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                className={`py-3 px-2 rounded-2xl text-xs font-bold border transition ${
                  crop === c 
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-500/10' 
                    : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-855 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
                }`}
              >
                {c === 'Wheat' ? '🌾 Wheat' : c === 'Paddy' ? '🌾 Paddy' : c === 'Cotton' ? '☁️ Cotton' : c === 'Maize' ? '🌽 Maize' : c === 'Mustard' ? '🟡 Mustard' : '🎋 Sugarcane'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Land Area Size</label>
            <span className="text-xs font-extrabold text-primary-650">{landSize} Acres</span>
          </div>
          <input 
            type="range"
            min="1"
            max="50"
            value={landSize}
            onChange={(e) => setLandSize(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-primary-600" 
          />
          <div className="flex justify-between text-[10px] text-gray-400 font-semibold mt-1">
            <span>1 Acre</span>
            <span>50 Acres</span>
          </div>
        </div>
      </div>

      {/* Main Widgets Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Predictions & Historical Graph (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-6 flex flex-col justify-between">
          
          {/* Header Stats */}
          <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-850 pb-4">
            
            {/* Yield Indicator */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">Predicted Yield</span>
                <h4 className="text-lg font-black text-gray-800 dark:text-gray-150">{config.yieldPerAcre} Qtl/Acre</h4>
                <span className="text-[10px] text-gray-450 font-semibold">Total: {totalYield} Quintals</span>
              </div>
            </div>

            {/* Confidence indicator */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl">
                <FiPercent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 block font-bold uppercase tracking-wider">AI Confidence</span>
                <h4 className="text-lg font-black text-gray-800 dark:text-gray-150">{config.confidence}%</h4>
                <span className="text-[10px] text-green-500 font-extrabold flex items-center gap-0.5">High Reliability</span>
              </div>
            </div>

          </div>

          {/* Graph Section */}
          <div className="flex-1 h-[280px] pt-4">
            <Line data={chartData} options={chartOptions as any} />
          </div>

        </div>

        {/* Right Side: Mini Profitability Analyzer Card (1 col) */}
        <div className="bg-gradient-to-br from-primary-650 to-primary-800 dark:from-gray-900 dark:to-gray-950 text-white p-6 rounded-3xl shadow-lg border border-primary-500/20 flex flex-col justify-between relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
          
          <div className="space-y-4">
            <span className="text-[9px] font-black uppercase bg-white/15 px-2.5 py-0.5 rounded-full tracking-wider w-fit block">
              💵 Profitability Analyzer
            </span>
            
            <div>
              <span className="text-[10px] opacity-75 block font-bold">NET ESTIMATED EARNINGS</span>
              <h3 className="text-3xl font-black block mt-1 tracking-tight">₹{netEarnings.toLocaleString('en-IN')}</h3>
              <span className="text-[10px] bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 font-extrabold px-2 py-0.5 rounded-full inline-block mt-2">
                Estimated Net Margin
              </span>
            </div>

            {/* Financial ledger breakdown */}
            <div className="border-t border-white/10 pt-4 space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center opacity-85">
                <span>Estimated Harvest</span>
                <span>{totalYield} Quintals</span>
              </div>
              <div className="flex justify-between items-center opacity-85">
                <span>Mandi Rate ({crop})</span>
                <span>₹{config.mandiPrice} / Qtl</span>
              </div>
              <div className="flex justify-between items-center text-emerald-300">
                <span>Gross Revenue</span>
                <span>₹{estimatedRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-red-300 border-b border-white/5 pb-2">
                <span>Operational Costs</span>
                <span>- ₹{estimatedCost.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span>Net Profit</span>
                <span className="font-extrabold text-sm text-emerald-400">₹{netEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-2.5 text-[10px] font-bold leading-normal">
              <FiCpu className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <span>Yield based on optimal NPK soil composition and local irrigation models.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default YieldPredictorPage;
