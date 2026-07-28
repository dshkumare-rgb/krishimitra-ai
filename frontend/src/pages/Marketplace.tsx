import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { FiPlus, FiTag, FiPhone, FiCheck, FiMapPin, FiShoppingCart, FiInbox } from 'react-icons/fi';
import axios from 'axios';

interface Listing {
  _id: string;
  farmerName: string;
  phone: string;
  cropName: string;
  quantity: number;
  unit: string;
  askingPrice: number;
  locationState: string;
  locationDistrict: string;
  description?: string;
  status: 'active' | 'sold' | 'expired';
}

export const Marketplace: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'sell' | 'buy'>('sell');
  const [listings, setListings] = useState<Listing[]>([]);
  const [myListings, setMyListings] = useState<Listing[]>([]);
  
  // Form States
  const [cropName, setCropName] = useState('Wheat');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Quintals');
  const [askingPrice, setAskingPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  
  const [contactedListing, setContactedListing] = useState<Listing | null>(null);

  const userId = localStorage.getItem('userId') || 'default-farmer';
  const locStr = localStorage.getItem('userLocation');
  const userLoc = locStr ? JSON.parse(locStr) : { state: 'Madhya Pradesh', district: 'Indore' };

  const cropOptions = ['Wheat', 'Paddy (Rice)', 'Soybean', 'Cotton', 'Onion', 'Potato', 'Mustard', 'Sugarcane', 'Barley'];

  useEffect(() => {
    fetchListings();
  }, [activeTab]);

  const fetchListings = async () => {
    try {
      if (activeTab === 'buy') {
        // Fetch buy listings matching user district
        const response = await axios.get(`/api/marketplace/listings?district=${userLoc.district}&status=active`);
        // Filter out user's own listings
        const otherListings = response.data.filter((l: Listing) => l.userFirebaseId !== userId);
        setListings(otherListings);
      } else {
        // Fetch user's own listings
        const response = await axios.get(`/api/marketplace/listings?userId=${userId}`);
        setMyListings(response.data);
      }
    } catch (err) {
      console.error('Failed to retrieve listings:', err);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        userId,
        farmerName: sellerName || 'Farmer Partner',
        phone: sellerPhone || '+91 99999 99999',
        cropName,
        quantity: parseFloat(quantity),
        unit,
        askingPrice: parseFloat(askingPrice),
        state: userLoc.state,
        district: userLoc.district,
        description: desc
      };

      await axios.post('/api/marketplace/listings', payload);
      setQuantity('');
      setAskingPrice('');
      setDesc('');
      fetchListings();
    } catch (err) {
      console.error('Failed to create produce listing:', err);
    }
  };

  const handleMarkAsSold = async (id: string) => {
    try {
      await axios.patch(`/api/marketplace/listings/${id}/sold`);
      fetchListings();
    } catch (err) {
      console.error('Failed to update listing status:', err);
    }
  };

  return (
    <div className="space-y-8 p-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-gray-100 flex items-center gap-2">
            🌾 {language === 'hi' ? 'कृषि मंडी व्यापार' : 'KrishiMitra Marketplace'}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'hi'
              ? 'फसल की उपज सीधे खरीदारों और व्यापारियों को बेचें।'
              : 'Directly connect produce listings to buyers in your district.'}
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-50 dark:bg-gray-850 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('sell')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'sell'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <FiTag /> {t('sellTab')}
          </button>
          <button
            onClick={() => setActiveTab('buy')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeTab === 'buy'
                ? 'bg-white dark:bg-gray-900 text-primary-600 dark:text-primary-400 shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'
            }`}
          >
            <FiShoppingCart /> {t('buyRequestsTab')}
          </button>
        </div>
      </div>

      {activeTab === 'sell' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Create Listing Form */}
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider flex items-center gap-2">
              <FiPlus className="text-primary-600" />
              {language === 'hi' ? 'नई उपज सूची' : 'List Produce'}
            </h3>
            
            <form onSubmit={handleCreate} className="space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'hi' ? 'अपना नाम' : 'Farmer Name'}
                </label>
                <input 
                  type="text" 
                  required
                  value={sellerName}
                  onChange={e => setSellerName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  placeholder="e.g. Ram Singh"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">
                  {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
                </label>
                <input 
                  type="tel" 
                  required
                  value={sellerPhone}
                  onChange={e => setSellerPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-850" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('cropType')}</label>
                  <select 
                    value={cropName}
                    onChange={e => setCropName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  >
                    {cropOptions.map(crop => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('unit')}</label>
                  <select 
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  >
                    <option value="Quintals">Quintals</option>
                    <option value="Kilograms">Kilograms (kg)</option>
                    <option value="Tonnes">Tonnes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('quantity')}</label>
                  <input 
                    type="number" 
                    required
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                    placeholder="e.g. 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('askingPrice')}</label>
                  <input 
                    type="number" 
                    required
                    value={askingPrice}
                    onChange={e => setAskingPrice(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                    placeholder="₹ / unit"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('pickupLocation')}</label>
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-850 px-4 py-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-xs font-semibold text-gray-500">
                  <FiMapPin className="text-primary-600" />
                  <span>{userLoc.district}, {userLoc.state}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-1">{t('description')}</label>
                <textarea 
                  rows={2}
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-850 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-gray-100"
                  placeholder="Details about quality, variety, or packaging..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 transition-all text-sm"
              >
                {t('createListing')}
              </button>
            </form>
          </div>

          {/* User's listings list */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-250 text-sm uppercase tracking-wider">
              {t('myListings')}
            </h3>

            {myListings.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-12 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-2">
                <FiInbox className="w-12 h-12 text-gray-300" />
                <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                  {language === 'hi' ? 'कोई लिस्टिंग नहीं बनाई गई है' : 'No produce listed yet'}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {language === 'hi' ? 'अपनी उपज बेचने के लिए बाईं ओर फ़ॉर्म का उपयोग करें।' : 'Use the form on the left to upload crop logs.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {myListings.map(item => (
                  <div 
                    key={item._id}
                    className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-xs text-primary-600 dark:text-primary-400 font-black uppercase tracking-wider">
                          {item.cropName}
                        </span>
                        
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          item.status === 'active'
                            ? 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400'
                            : item.status === 'sold'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-gray-800 dark:text-gray-100 mt-2">
                        {item.quantity} {item.unit}
                      </h4>
                      <p className="text-xs text-gray-500 font-bold">
                        ₹ {item.askingPrice} / {item.unit.slice(0, -1)}
                      </p>
                      
                      {item.description && (
                        <p className="text-xs text-gray-400 italic mt-2 line-clamp-2">
                          "{item.description}"
                        </p>
                      )}
                    </div>

                    {item.status === 'active' && (
                      <button
                        onClick={() => handleMarkAsSold(item._id)}
                        className="mt-4 w-full py-2 bg-primary-50 hover:bg-primary-100 dark:bg-primary-950/20 dark:hover:bg-primary-950/45 text-primary-600 dark:text-primary-450 border border-primary-100 dark:border-primary-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <FiCheck /> {t('markAsSold')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Buy requests / browsing tab */
        <div className="space-y-4">
          <div className="flex items-center gap-2 bg-primary-50/40 dark:bg-primary-950/10 p-4 rounded-2xl border border-primary-100 dark:border-primary-900/50">
            <span className="text-xs font-bold text-primary-700 dark:text-primary-400">
              📌 {language === 'hi' ? `वर्तमान स्थान: ${userLoc.district} जिला` : `Showing produce available in ${userLoc.district} district`}
            </span>
          </div>

          {listings.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-16 rounded-3xl shadow-sm text-center flex flex-col items-center justify-center gap-2">
              <span className="text-4xl">🛒</span>
              <h4 className="font-bold text-sm text-gray-700 dark:text-gray-300">
                {language === 'hi' ? 'आसपास कोई सक्रिय बिक्री सूची नहीं है' : 'No listings in your district'}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'hi' ? 'इस जिले में अभी किसी किसान ने लिस्टिंग नहीं बनाई है।' : 'Check back later for active crop listings in your region.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map(item => (
                <div 
                  key={item._id}
                  className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-primary-600 dark:text-primary-400 font-black uppercase tracking-wider">
                        {item.cropName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <FiMapPin /> {item.locationDistrict}
                      </span>
                    </div>

                    <h4 className="text-lg font-black text-gray-850 dark:text-gray-100">
                      {item.quantity} {item.unit}
                    </h4>
                    <p className="text-xs text-gray-500 font-bold">
                      ₹ {item.askingPrice} / {item.unit.slice(0, -1)}
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-850 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800 text-[10px] space-y-1">
                      <p className="text-gray-500">
                        Farmer: <span className="font-bold text-gray-700 dark:text-gray-300">{item.farmerName}</span>
                      </p>
                      {item.description && (
                        <p className="text-gray-450 italic line-clamp-2">"{item.description}"</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setContactedListing(item)}
                    className="mt-4 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-primary-500/10"
                  >
                    <FiPhone /> {t('contactSeller')}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Seller Modal Overlay */}
      {contactedListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl p-6 space-y-4">
            <h4 className="font-bold text-base text-gray-800 dark:text-gray-100">
              {language === 'hi' ? 'विक्रेता विवरण' : 'Seller Contact Details'}
            </h4>
            
            <div className="bg-primary-50/50 dark:bg-primary-950/10 p-4 rounded-2xl space-y-2 border border-primary-100 dark:border-primary-900">
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'किसान का नाम:' : 'Farmer Name:'}
                <span className="block font-black text-sm text-gray-800 dark:text-gray-100">{contactedListing.farmerName}</span>
              </p>
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'फ़ोन नंबर:' : 'Phone Number:'}
                <a 
                  href={`tel:${contactedListing.phone}`}
                  className="block font-black text-lg text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                >
                  📞 {contactedListing.phone}
                </a>
              </p>
            </div>

            <p className="text-[10px] text-gray-400 text-center">
              {language === 'hi'
                ? 'मूल्य और परिवहन विवरण के लिए किसान से सीधे संपर्क करें।'
                : 'Contact the farmer directly to negotiate details and arrange pickup.'}
            </p>

            <button
              onClick={() => setContactedListing(null)}
              className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl text-xs"
            >
              {language === 'hi' ? 'बंद करें' : 'Close'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Marketplace;
