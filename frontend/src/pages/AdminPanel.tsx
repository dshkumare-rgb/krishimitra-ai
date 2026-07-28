import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { FiPlusCircle, FiTrash2, FiActivity, FiLayers, FiDollarSign, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [mandis, setMandis] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Forms
  const [schemeName, setSchemeName] = useState('');
  const [schemeDesc, setSchemeDesc] = useState('');
  const [schemeEligibility, setSchemeEligibility] = useState('');
  const [schemeBenefits, setSchemeBenefits] = useState('');
  const [schemeLink, setSchemeLink] = useState('');
  const [schemeCategory, setSchemeCategory] = useState('Subsidy');
  const [schemeState, setSchemeState] = useState('All');

  const [mandiCrop, setMandiCrop] = useState('Wheat');
  const [mandiState, setMandiState] = useState('Punjab');
  const [mandiDistrict, setMandiDistrict] = useState('Ludhiana');
  const [mandiMarket, setMandiMarket] = useState('New Mandi');
  const [mandiPrice, setMandiPrice] = useState('2200');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const info = await api.get('/api/admin/stats');
      setStats(info);

      const schemeList = await api.get('/api/admin/schemes');
      setSchemes(schemeList);

      const priceList = await api.get('/api/mandi/prices');
      setMandis(priceList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleCreateScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/schemes', {
        name: schemeName,
        description: schemeDesc,
        eligibility: schemeEligibility,
        benefits: schemeBenefits,
        link: schemeLink,
        category: schemeCategory,
        state: schemeState
      });
      // Reset form
      setSchemeName(''); setSchemeDesc(''); setSchemeEligibility(''); setSchemeBenefits(''); setSchemeLink('');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddMandi = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/api/admin/mandi', {
        cropName: mandiCrop,
        state: mandiState,
        district: mandiDistrict,
        market: mandiMarket,
        currentPrice: parseFloat(mandiPrice)
      });
      setMandiMarket(''); setMandiPrice('2200');
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScheme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this government scheme?')) return;
    try {
      const response = await fetch(`/api/admin/schemes/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMandi = async (id: string) => {
    if (!confirm('Are you sure you want to delete this market price?')) return;
    try {
      const response = await fetch(`/api/admin/mandi/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchAdminData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🔑 Admin Control Panel
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Monitor system metrics, seed databases, add mandi current prices, and edit government schemes.
        </p>
      </div>

      {/* Grid: 4 stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-450 uppercase block">Total Farmers</span>
            <h4 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{stats.users}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-450 uppercase block">Government Schemes</span>
            <h4 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{stats.schemes}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800">
            <span className="text-[10px] font-bold text-gray-450 uppercase block">Active Mandi Records</span>
            <h4 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 mt-1">{stats.prices}</h4>
          </div>
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-150 dark:border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-450 uppercase block">Gateway Mode</span>
              <p className="text-xs font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                <FiActivity className="w-4 h-4" /> {stats.dbConnected ? 'Mongoose Server' : 'Local JSON Cache'}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400">
              HEALTHY
            </span>
          </div>
        </div>
      )}

      {/* Grid: Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Create Scheme Form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-1 text-sm">
            <FiAward className="w-5 h-5 text-primary-650" /> Add Government Scheme
          </h3>
          <form onSubmit={handleCreateScheme} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">Scheme Category</label>
                <select value={schemeCategory} onChange={(e) => setSchemeCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl">
                  <option value="Subsidy">Subsidy</option>
                  <option value="Financial Aid">Financial Aid</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Technology">Technology</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">State Target</label>
                <select value={schemeState} onChange={(e) => setSchemeState(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 dark:border-gray-855 rounded-xl">
                  <option value="All">All States</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Scheme Name</label>
              <input type="text" value={schemeName} onChange={(e) => setSchemeName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 rounded-xl outline-none" required />
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Brief Description</label>
              <textarea value={schemeDesc} onChange={(e) => setSchemeDesc(e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl outline-none" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">Eligibility Criteria</label>
                <input type="text" value={schemeEligibility} onChange={(e) => setSchemeEligibility(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" required />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Benefit Allocation</label>
                <input type="text" value={schemeBenefits} onChange={(e) => setSchemeBenefits(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Application URL Link</label>
              <input type="url" value={schemeLink} onChange={(e) => setSchemeLink(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" placeholder="https://" />
            </div>

            <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
              <FiPlusCircle className="w-4 h-4" /> Register Scheme
            </button>
          </form>
        </div>

        {/* Add Mandi price form */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-1 text-sm">
            <FiDollarSign className="w-5 h-5 text-emerald-500" /> Register Mandi Price Metric
          </h3>
          <form onSubmit={handleAddMandi} className="space-y-4 text-xs font-semibold">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">Crop Name</label>
                <select value={mandiCrop} onChange={(e) => setMandiCrop(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-950 rounded-xl">
                  <option value="Wheat">Wheat</option>
                  <option value="Paddy (Rice)">Paddy (Rice)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-500 mb-1">State location</label>
                <input type="text" value={mandiState} onChange={(e) => setMandiState(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" required />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-500 mb-1">District location</label>
                <input type="text" value={mandiDistrict} onChange={(e) => setMandiDistrict(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" required />
              </div>
              <div>
                <label className="block text-gray-500 mb-1">Market (Mandi Name)</label>
                <input type="text" value={mandiMarket} onChange={(e) => setMandiMarket(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl" placeholder="e.g. Lasalgaon Mandi" required />
              </div>
            </div>

            <div>
              <label className="block text-gray-500 mb-1">Current Trading Price (₹ per Quintal)</label>
              <input type="number" value={mandiPrice} onChange={(e) => setMandiPrice(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:bg-gray-955 rounded-xl outline-none" required />
            </div>

            <button type="submit" className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 shadow-sm">
              <FiPlusCircle className="w-4 h-4" /> Add Price Metric
            </button>
          </form>
        </div>

      </div>

      {/* CRUD tables */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Schemes list table */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-xs uppercase tracking-wider">Active Government Schemes List ({schemes.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-850 text-gray-450 font-bold">
                  <th className="py-2.5">Category</th>
                  <th>Scheme Name</th>
                  <th>State Target</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-850 font-medium">
                {schemes.map((s) => (
                  <tr key={s._id} className="text-gray-700 dark:text-gray-300">
                    <td className="py-3 font-bold text-[10px] uppercase text-primary-600">{s.category}</td>
                    <td className="pr-4">{s.name}</td>
                    <td>{s.state}</td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleDeleteScheme(s._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mandis list table */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 text-xs uppercase tracking-wider">Registered Mandi Prices ({mandis.length})</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-855 text-gray-450 font-bold">
                  <th className="py-2.5">Crop</th>
                  <th>Market / Mandi</th>
                  <th>Location</th>
                  <th>Current Price</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-855 font-medium text-gray-750">
                {mandis.map((m) => (
                  <tr key={m._id} className="text-gray-750 dark:text-gray-300">
                    <td className="py-3 font-bold text-primary-600">{m.cropName}</td>
                    <td>{m.market}</td>
                    <td>{m.district}, {m.state}</td>
                    <td className="font-bold">₹{m.currentPrice}</td>
                    <td className="text-right">
                      <button 
                        onClick={() => handleDeleteMandi(m._id)}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminPanel;
