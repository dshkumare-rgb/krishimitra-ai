import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useLocation } from '../context/LocationContext';
import { jsPDF } from 'jspdf';
import { FiDownload, FiCheck, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const SoilHealthCard: React.FC = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { stateName, districtName } = useLocation();

  const [farmerName, setFarmerName] = useState(user?.displayName || 'Ramesh Kumar');
  const [state, setState] = useState(stateName);
  const [district, setDistrict] = useState(districtName);

  useEffect(() => {
    setState(stateName);
    setDistrict(districtName);
  }, [stateName, districtName]);

  const [nVal, setNVal] = useState('140');
  const [pVal, setPVal] = useState('18');
  const [kVal, setKVal] = useState('90');
  const [phVal, setPhVal] = useState('6.8');
  const [ocVal, setOcVal] = useState('0.62');

  const [nStatus, setNStatus] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [pStatus, setPStatus] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [kStatus, setKStatus] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [ocStatus, setOcStatus] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [phStatus, setPhStatus] = useState<'ACIDIC' | 'NEUTRAL' | 'ALKALINE'>('NEUTRAL');

  // Recalculate nutrient classes dynamically
  useEffect(() => {
    const n = parseFloat(nVal) || 0;
    const p = parseFloat(pVal) || 0;
    const k = parseFloat(kVal) || 0;
    const ph = parseFloat(phVal) || 7.0;
    const oc = parseFloat(ocVal) || 0.5;

    // Nitrogen
    if (n < 110) setNStatus('LOW');
    else if (n <= 220) setNStatus('MEDIUM');
    else setNStatus('HIGH');

    // Phosphorus
    if (p < 9) setPStatus('LOW');
    else if (p <= 22) setPStatus('MEDIUM');
    else setPStatus('HIGH');

    // Potassium
    if (k < 55) setKStatus('LOW');
    else if (k <= 125) setKStatus('MEDIUM');
    else setKStatus('HIGH');

    // OC
    if (oc < 0.5) setOcStatus('LOW');
    else if (oc <= 0.75) setOcStatus('MEDIUM');
    else setOcStatus('HIGH');

    // pH
    if (ph < 6.5) setPhStatus('ACIDIC');
    else if (ph <= 7.5) setPhStatus('NEUTRAL');
    else setPhStatus('ALKALINE');

  }, [nVal, pVal, kVal, phVal, ocVal]);

  const getStatusColor = (status: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (status === 'LOW') return 'text-red-500 bg-red-50 dark:bg-red-950/20 border-red-200';
    if (status === 'MEDIUM') return 'text-amber-500 bg-amber-50 dark:bg-amber-950/20 border-amber-200';
    return 'text-green-500 bg-green-50 dark:bg-green-950/20 border-green-200';
  };

  const getStatusLabel = (status: 'LOW' | 'MEDIUM' | 'HIGH') => {
    if (language === 'hi') {
      return status === 'LOW' ? 'निम्न (कम)' : status === 'MEDIUM' ? 'मध्यम' : 'उच्च (अधिक)';
    }
    if (language === 'pa') {
      return status === 'LOW' ? 'ਘੱਟ' : status === 'MEDIUM' ? 'ਦਰਮਿਆਨਾ' : 'ਉੱਚਾ';
    }
    return status;
  };

  const downloadCardPDF = () => {
    const doc = new jsPDF();

    // Gov style border
    doc.setDrawColor(22, 163, 74);
    doc.setLineWidth(1.5);
    doc.rect(5, 5, 200, 287);
    
    // Header Banner
    doc.setFillColor(22, 163, 74);
    doc.rect(5, 5, 200, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(language === 'hi' ? 'मृदा स्वास्थ्य कार्ड - कृषिमित्र' : language === 'pa' ? 'ਮਿੱਟੀ ਦੀ ਸਿਹਤ ਕਾਰਡ - ਕ੍ਰਿਸ਼ੀਮਿੱਤਰ' : 'Soil Health Card - KrishiMitra', 15, 22);
    
    doc.setFontSize(10);
    doc.text(`Farmer Profile: ${farmerName}  |  Location: ${district}, ${state}`, 15, 32);

    // Profile Details
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(14);
    doc.text('Soil Sample Analysis Metrics:', 15, 55);

    // Dynamic grid drawing
    doc.setFillColor(248, 250, 252);
    doc.rect(15, 62, 180, 80, 'F');
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Nutrient / Parameter', 20, 72);
    doc.text('Value Tested', 80, 72);
    doc.text('Status Rating', 140, 72);
    doc.line(15, 76, 195, 76);

    doc.setFont('Helvetica', 'normal');
    doc.text('Nitrogen (N)', 20, 85);
    doc.text(`${nVal} kg/acre`, 80, 85);
    doc.text(nStatus, 140, 85);

    doc.text('Phosphorus (P)', 20, 95);
    doc.text(`${pVal} kg/acre`, 80, 95);
    doc.text(pStatus, 140, 95);

    doc.text('Potassium (K)', 20, 105);
    doc.text(`${kVal} kg/acre`, 80, 105);
    doc.text(kStatus, 140, 105);

    doc.text('Soil Reaction (pH)', 20, 115);
    doc.text(`${phVal} (pH)`, 80, 115);
    doc.text(phStatus, 140, 115);

    doc.text('Organic Carbon (OC)', 20, 125);
    doc.text(`${ocVal} %`, 80, 125);
    doc.text(ocStatus, 140, 125);

    // Reclamation Tips Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Soil Quality Improvement Advisory:', 15, 160);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10.5);

    let tips: string[] = [];
    if (phStatus === 'ACIDIC') {
      tips.push('• Apply agricultural lime (calcium carbonate) or dolomite to raise soil pH.');
      tips.push('• Use nitrate-based nitrogen fertilizers instead of ammonium sulfate.');
    } else if (phStatus === 'ALKALINE') {
      tips.push('• Incorporate gypsum (calcium sulfate) or elemental sulfur to lower pH levels.');
      tips.push('• Add high amounts of organic compost and acidic farm manures.');
    } else {
      tips.push('• pH is in the optimal neutral range. Maintain organic carbon rotation.');
    }

    if (nStatus === 'LOW') {
      tips.push('• Sowing of leguminous crops (pulses, beans, peas) is recommended to fix nitrogen.');
      tips.push('• Apply split doses of Urea/Nitrogen fertilizers instead of single broad application.');
    }
    if (pStatus === 'LOW') {
      tips.push('• Apply DAP (Diammonium Phosphate) or Single Super Phosphate (SSP) directly in seed lines.');
    }
    if (ocStatus === 'LOW') {
      tips.push('• Incorporate green manuring crops (Daincha, Sunnhemp) or bio-compost post harvest.');
    }

    let yOffset = 170;
    tips.forEach(tip => {
      const splitTip = doc.splitTextToSize(tip, 175);
      doc.text(splitTip, 15, yOffset);
      yOffset += (splitTip.length * 6);
    });

    // Signatures
    doc.setFont('Helvetica', 'bold');
    doc.text('KrishiMitra AI Laboratory Coordinator', 15, 270);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('Generated via digital diagnostic portal. Advisory guidelines only.', 15, 280);

    doc.save(`Soil_Health_Card_${farmerName}.pdf`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🌱 {t('soilHealthCard')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi' 
              ? 'अपनी मिट्टी के टेस्ट वैल्यू दर्ज करें और एक सरकारी मॉडल पर आधारित डिजिटल हेल्थ कार्ड और सुधार युक्तियाँ प्राप्त करें।' 
              : 'Enter N-P-K, pH, and Organic Carbon values to print a standardized digital Soil Health Card.'}
          </p>
        </div>

        <button 
          onClick={downloadCardPDF}
          className="py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-sm shadow-primary-500/10 transition"
        >
          <FiDownload className="w-4 h-4" /> Download Digital Card
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4 h-fit">
          <h3 className="font-bold text-gray-850 dark:text-gray-150 text-xs uppercase tracking-wider">Enter Soil Test Metrics</h3>
          
          <div className="space-y-3.5 text-xs font-semibold">
            <div>
              <label className="block text-gray-500 mb-1">Farmer Owner Name</label>
              <input 
                type="text" 
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 dark:bg-gray-950 dark:border-gray-850 rounded-xl outline-none" 
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">State</label>
                <input 
                  type="text" 
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-250 dark:bg-gray-955 rounded-xl" 
                />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">District</label>
                <input 
                  type="text" 
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-255 rounded-xl" 
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 border-t border-gray-100 dark:border-gray-850 pt-4">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase">Nitrogen (N)</label>
                <input 
                  type="number" 
                  value={nVal}
                  onChange={(e) => setNVal(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-950 rounded-xl outline-none" 
                />
                <span className="text-[9px] text-gray-400 mt-1 block">kg/acre</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase">Phosphorus (P)</label>
                <input 
                  type="number" 
                  value={pVal}
                  onChange={(e) => setPVal(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 dark:bg-gray-955 rounded-xl outline-none" 
                />
                <span className="text-[9px] text-gray-400 mt-1 block">kg/acre</span>
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase">Potassium (K)</label>
                <input 
                  type="number" 
                  value={kVal}
                  onChange={(e) => setKVal(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-255 rounded-xl outline-none" 
                />
                <span className="text-[9px] text-gray-400 mt-1 block">kg/acre</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-gray-500 uppercase">Soil Reaction (pH)</label>
                <input 
                  type="number" 
                  step="0.1"
                  value={phVal}
                  onChange={(e) => setPhVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 dark:bg-gray-955 rounded-xl outline-none" 
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 uppercase">Organic Carbon (OC)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={ocVal}
                  onChange={(e) => setOcVal(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-255 rounded-xl outline-none" 
                />
                <span className="text-[9px] text-gray-400 mt-1 block">percentage (%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Right Digital Soil Health Card (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Card Layout wrapper */}
          <div className="bg-emerald-50/20 border-2 border-primary-600 dark:bg-gray-900 rounded-3xl p-6 shadow-md relative overflow-hidden">
            
            {/* Government Emblem Seal Background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-[180px]">🌾</span>
            </div>

            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b border-primary-350">
              <div>
                <span className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 bg-primary-600 text-white rounded-full">
                  HEALTH CARD
                </span>
                <h4 className="text-lg font-black text-gray-850 dark:text-gray-150 mt-1.5">{t('soilHealthCard')}</h4>
                <p className="text-[10px] text-gray-450 mt-0.5">KrishiMitra Agricultural Diagnostics Lab</p>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-gray-700 dark:text-gray-300">{farmerName}</p>
                <span className="text-[10px] text-gray-400 block">{district}, {state}</span>
              </div>
            </div>

            {/* Nutrient rating displays */}
            <div className="my-6 space-y-4">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t('nutrientStatus')}</h5>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                
                {/* N */}
                <div className={`p-3.5 border rounded-2xl text-center ${getStatusColor(nStatus)}`}>
                  <span className="text-[10px] font-extrabold block">Nitrogen (N)</span>
                  <span className="text-lg font-black block mt-1">{nVal}</span>
                  <span className="text-[9px] font-bold block opacity-85 mt-0.5">{getStatusLabel(nStatus)}</span>
                </div>

                {/* P */}
                <div className={`p-3.5 border rounded-2xl text-center ${getStatusColor(pStatus)}`}>
                  <span className="text-[10px] font-extrabold block">Phosphorus (P)</span>
                  <span className="text-lg font-black block mt-1">{pVal}</span>
                  <span className="text-[9px] font-bold block opacity-85 mt-0.5">{getStatusLabel(pStatus)}</span>
                </div>

                {/* K */}
                <div className={`p-3.5 border rounded-2xl text-center ${getStatusColor(kStatus)}`}>
                  <span className="text-[10px] font-extrabold block">Potassium (K)</span>
                  <span className="text-lg font-black block mt-1">{kVal}</span>
                  <span className="text-[9px] font-bold block opacity-85 mt-0.5">{getStatusLabel(kStatus)}</span>
                </div>

                {/* OC */}
                <div className={`p-3.5 border rounded-2xl text-center ${getStatusColor(ocStatus)}`}>
                  <span className="text-[10px] font-extrabold block">Org Carbon (OC)</span>
                  <span className="text-lg font-black block mt-1">{ocVal}%</span>
                  <span className="text-[9px] font-bold block opacity-85 mt-0.5">{getStatusLabel(ocStatus)}</span>
                </div>

              </div>

              {/* pH display banner */}
              <div className={`p-4 border rounded-2xl flex items-center justify-between ${
                phStatus === 'NEUTRAL' 
                  ? 'bg-green-50 border-green-200 dark:bg-green-950/20' 
                  : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20'
              }`}>
                <div className="space-y-0.5">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">{t('soilPH')}</span>
                  <span className="text-sm font-extrabold text-gray-800 dark:text-gray-150">Tested Level: {phVal} pH</span>
                </div>
                <span className="px-3 py-1 bg-white/70 dark:bg-gray-900 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300">
                  {phStatus === 'ACIDIC' ? '🔴 Acidic Soil' : phStatus === 'ALKALINE' ? '🟡 Alkaline Soil' : '🟢 Neutral / Optimal'}
                </span>
              </div>

            </div>

            {/* Reclamation Advices */}
            <div className="pt-4 border-t border-gray-150 dark:border-gray-800">
              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-450 mb-3 flex items-center gap-1.5">
                <FiAlertTriangle className="text-amber-500 w-4 h-4" /> {t('reclamationTips')}
              </h5>

              <div className="space-y-2 text-xs font-semibold text-gray-650 dark:text-gray-350">
                {phStatus === 'ACIDIC' && (
                  <p className="border-l-2 border-red-500 pl-2.5">
                    🏥 **Acidic Reclamation**: Mix 1.5 - 2 tons of limestone (lime) per acre during winter plowing to raise pH.
                  </p>
                )}
                {phStatus === 'ALKALINE' && (
                  <p className="border-l-2 border-amber-500 pl-2.5">
                    🏥 **Alkaline Reclamation**: Apply 2 - 3 tons of agricultural gypsum per acre before sowing to lower pH.
                  </p>
                )}
                {phStatus === 'NEUTRAL' && (
                  <p className="border-l-2 border-green-500 pl-2.5">
                    🏥 **pH Balance**: Soil pH is optimal. Avoid over-application of acidic nitrogen fertilizers.
                  </p>
                )}

                {nStatus === 'LOW' && (
                  <p className="border-l-2 border-red-500 pl-2.5">
                    🧪 **Nitrogen Enrichment**: Sow legumes or pulses. Inject biofertilizers containing Azotobacter.
                  </p>
                )}
                {pStatus === 'LOW' && (
                  <p className="border-l-2 border-red-500 pl-2.5">
                    🧪 **Phosphorus Fix**: Apply Phosphate Solubilizing Bacteria (PSB) to dissolve locked minerals.
                  </p>
                )}
                {ocStatus === 'LOW' && (
                  <p className="border-l-2 border-red-500 pl-2.5">
                    🍂 **Organic Matter**: Apply 5 tons of farmyard manure or vermicompost to enrich carbon ratios.
                  </p>
                )}

                {(nStatus === 'HIGH' || pStatus === 'HIGH' || kStatus === 'HIGH') && (
                  <p className="border-l-2 border-green-500 pl-2.5">
                    🌱 **Nutrient Abundance**: Some nutrients are in excess. You can reduce commercial fertilizer budget by 15-20% this season.
                  </p>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default SoilHealthCard;
