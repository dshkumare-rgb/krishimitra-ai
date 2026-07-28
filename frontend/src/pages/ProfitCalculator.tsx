import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiDollarSign, FiPercent, FiTrendingUp, FiCreditCard, FiArrowUpRight } from 'react-icons/fi';

export const ProfitCalculator: React.FC = () => {
  const { t, language } = useLanguage();

  const [crop, setCrop] = useState('Wheat');
  const [acres, setAcres] = useState(2);
  const [seedCost, setSeedCost] = useState(2500);
  const [fertilizerCost, setFertilizerCost] = useState(3800);
  const [irrigationCost, setIrrigationCost] = useState(1500);
  const [laborCost, setLaborCost] = useState(4000);
  const [otherCost, setOtherCost] = useState(1200);

  const [yieldPerAcre, setYieldPerAcre] = useState(18); // quintals
  const [sellingPrice, setSellingPrice] = useState(2275); // ₹ per quintal

  const [totalCost, setTotalCost] = useState(0);
  const [grossRevenue, setGrossRevenue] = useState(0);
  const [netProfit, setNetProfit] = useState(0);
  const [roi, setRoi] = useState(0);

  // Recalculate financial outcomes
  useEffect(() => {
    const costPerAcre = seedCost + fertilizerCost + irrigationCost + laborCost + otherCost;
    const totalExpenses = costPerAcre * acres;
    const totalYield = yieldPerAcre * acres;
    const totalRevenue = totalYield * sellingPrice;
    const profit = totalRevenue - totalExpenses;
    const returnOnInvestment = totalExpenses > 0 ? (profit / totalExpenses) * 100 : 0;

    setTotalCost(totalExpenses);
    setGrossRevenue(totalRevenue);
    setNetProfit(profit);
    setRoi(Math.round(returnOnInvestment));
  }, [crop, acres, seedCost, fertilizerCost, irrigationCost, laborCost, otherCost, yieldPerAcre, sellingPrice]);

  // Adjust defaults based on crop selection
  const handleCropChange = (cropName: string) => {
    setCrop(cropName);
    if (cropName === 'Wheat') {
      setSeedCost(2500); setFertilizerCost(3800); setIrrigationCost(1500); setYieldPerAcre(18); setSellingPrice(2275);
    } else if (cropName === 'Paddy (Rice)') {
      setSeedCost(3000); setFertilizerCost(4500); setIrrigationCost(3500); setYieldPerAcre(22); setSellingPrice(2183);
    } else if (cropName === 'Cotton') {
      setSeedCost(5000); setFertilizerCost(6000); setIrrigationCost(2000); setYieldPerAcre(12); setSellingPrice(7100);
    } else if (cropName === 'Onion') {
      setSeedCost(8000); setFertilizerCost(5000); setIrrigationCost(2500); setYieldPerAcre(80); setSellingPrice(2800);
    }
  };

  const expenseBreakdown = [
    { label: 'Seeds / Planting', value: seedCost * acres, percentage: totalCost > 0 ? Math.round((seedCost * acres / totalCost) * 100) : 0, color: 'bg-emerald-500' },
    { label: 'Fertilizers / Pesticides', value: fertilizerCost * acres, percentage: totalCost > 0 ? Math.round((fertilizerCost * acres / totalCost) * 100) : 0, color: 'bg-blue-500' },
    { label: 'Water / Irrigation', value: irrigationCost * acres, percentage: totalCost > 0 ? Math.round((irrigationCost * acres / totalCost) * 100) : 0, color: 'bg-teal-500' },
    { label: 'Labor / Tractor Hire', value: laborCost * acres, percentage: totalCost > 0 ? Math.round((laborCost * acres / totalCost) * 100) : 0, color: 'bg-amber-500' },
    { label: 'Others (Transportation)', value: otherCost * acres, percentage: totalCost > 0 ? Math.round((otherCost * acres / totalCost) * 100) : 0, color: 'bg-purple-500' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          💰 {t('predictedProfit')}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {language === 'hi' 
            ? 'अपनी फसल की लागत और उत्पादन दर्ज करें। अनुमानित लाभ और निवेश पर लाभ (ROI) की गणना करें।' 
            : 'Evaluate seed, fertilizer, irrigation, and labor expenditures to project net harvest returns.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Form: Inputs */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Select Crop</label>
              <select 
                value={crop}
                onChange={(e) => handleCropChange(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200"
              >
                <option value="Wheat">Wheat (गेंहू)</option>
                <option value="Paddy (Rice)">Paddy / Rice (धान)</option>
                <option value="Cotton">Cotton (कपास)</option>
                <option value="Onion">Onion (प्याज)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Land Area (Acres)</label>
              <input 
                type="number"
                value={acres}
                onChange={(e) => setAcres(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-800 dark:text-gray-200 font-bold"
              />
            </div>
          </div>

          <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider border-t border-gray-100 dark:border-gray-850 pt-4">Operational Expenditures (₹ per Acre)</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Seed cost</label>
              <input 
                type="number" 
                value={seedCost} 
                onChange={(e) => setSeedCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fertilizer/Chemicals</label>
              <input 
                type="number" 
                value={fertilizerCost} 
                onChange={(e) => setFertilizerCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Irrigation/Fuel</label>
              <input 
                type="number" 
                value={irrigationCost} 
                onChange={(e) => setIrrigationCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Labor/Plowing</label>
              <input 
                type="number" 
                value={laborCost} 
                onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Transportation/Other</label>
              <input 
                type="number" 
                value={otherCost} 
                onChange={(e) => setOtherCost(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-xs font-bold text-gray-700"
              />
            </div>
          </div>

          <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider border-t border-gray-100 dark:border-gray-850 pt-4">Market Yield Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Expected Yield (Quintals/Acre)</label>
              <input 
                type="number" 
                value={yieldPerAcre} 
                onChange={(e) => setYieldPerAcre(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-850 dark:text-gray-100 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Market Price (₹ per Quintal)</label>
              <input 
                type="number" 
                value={sellingPrice} 
                onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 rounded-xl outline-none text-sm text-gray-850 dark:text-gray-100 font-bold"
              />
            </div>
          </div>
        </div>

        {/* Right Pane: Results and breakdown */}
        <div className="space-y-6">
          
          {/* Output Card */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl -mr-10 -mt-10" />
            
            <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-full">Financial Projections</span>
            
            <div className="mt-6 space-y-4">
              <div>
                <span className="text-[11px] text-gray-400 block font-semibold">Total Expenses</span>
                <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 flex items-center"><FiCreditCard className="w-5 h-5 text-gray-450 mr-1.5" /> ₹{totalCost.toLocaleString()}</span>
              </div>

              <div>
                <span className="text-[11px] text-gray-400 block font-semibold">Gross Revenue</span>
                <span className="text-2xl font-extrabold text-gray-800 dark:text-gray-200 flex items-center"><FiArrowUpRight className="w-5 h-5 text-gray-450 mr-1.5" /> ₹{grossRevenue.toLocaleString()}</span>
              </div>

              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-bold">Estimated Net Profit</span>
                <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center mt-1"><FiTrendingUp className="w-6 h-6 mr-1.5" /> ₹{netProfit.toLocaleString()}</span>
                
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-800 dark:text-emerald-300 font-bold">
                  <FiPercent className="w-4 h-4" />
                  <span>Return on Investment (ROI): {roi}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Expenses progress bars */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider">Expense Distribution</h3>
            
            <div className="space-y-3">
              {expenseBreakdown.map((exp) => (
                <div key={exp.label} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-650 dark:text-gray-300">
                    <span>{exp.label}</span>
                    <span>₹{exp.value.toLocaleString()} ({exp.percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-950 h-2 rounded-full overflow-hidden">
                    <div className={`${exp.color} h-full`} style={{ width: `${exp.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ProfitCalculator;
