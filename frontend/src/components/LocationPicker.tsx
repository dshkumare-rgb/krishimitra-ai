import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from '../context/LocationContext';
import { FiMapPin, FiSearch, FiRefreshCw, FiX } from 'react-icons/fi';

export const LocationPicker: React.FC = () => {
  const { stateName, districtName, setLocation, statesList, getDistrictsForState, loading: globalLoading } = useLocation();

  const [query, setQuery] = useState(`${districtName}, ${stateName}`);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Sync with global context changes
  useEffect(() => {
    setQuery(`${districtName}, ${stateName}`);
  }, [stateName, districtName]);

  // Click outside listener
  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setQuery(`${districtName}, ${stateName}`);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [stateName, districtName]);

  // Compile all search items: { district, state }
  const searchItems: { district: string; state: string; label: string }[] = [];
  statesList.forEach(state => {
    const districts = getDistrictsForState(state);
    districts.forEach(district => {
      searchItems.push({
        district,
        state,
        label: `${district}, ${state}`
      });
    });
  });

  // Filter items based on user input
  const filteredItems = query.trim() === '' 
    ? searchItems.slice(0, 10) 
    : searchItems.filter(item => 
        item.label.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 10);

  const handleSelect = (state: string, district: string) => {
    setLoading(true);
    setLocation(state, district);
    setQuery(`${district}, ${state}`);
    setIsOpen(false);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const clearInput = () => {
    setQuery('');
    setIsOpen(true);
  };

  const isLoading = globalLoading || loading;

  return (
    <div ref={containerRef} className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      
      {/* Label and Info */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300">
        <FiMapPin className="w-5 h-5 text-primary-650 animate-bounce" />
        <div>
          <span>Farming Location Selector</span>
          <span className="block text-[10px] text-gray-400 font-semibold uppercase">Search by State or District name</span>
        </div>
      </div>

      {/* Unified Search Input */}
      <div className="relative flex-1 md:max-w-xl">
        <div className="relative">
          <input
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search location (e.g. Sultanpur, Uttar Pradesh)..."
            className="w-full px-4 py-2.5 pl-10 pr-10 bg-gray-50 border border-gray-250 dark:bg-gray-955 rounded-2xl outline-none font-semibold text-xs text-gray-800 dark:text-gray-200 transition focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          />
          
          <FiSearch className="absolute left-3.5 top-3.5 text-gray-400 w-4 h-4" />
          
          {query && (
            <button 
              onClick={clearInput}
              className="absolute right-8 top-3 text-gray-400 hover:text-gray-650"
            >
              <FiX className="w-4 h-4" />
            </button>
          )}

          {isLoading && (
            <div className="absolute right-3.5 top-3.5">
              <FiRefreshCw className="animate-spin text-primary-600 w-3.5 h-3.5" />
            </div>
          )}
        </div>

        {/* Dropdown Options */}
        {isOpen && (
          <div className="absolute left-0 right-0 mt-1.5 max-h-60 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xl z-50 py-1.5 font-semibold text-xs text-gray-750 dark:text-gray-350">
            {filteredItems.map((item) => {
              const isSelected = item.state === stateName && item.district === districtName;
              return (
                <button
                  key={item.label}
                  onClick={() => handleSelect(item.state, item.district)}
                  className={`w-full px-4 py-2.5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-850 flex justify-between items-center ${
                    isSelected ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/20 dark:text-primary-400' : ''
                  }`}
                >
                  <span>{item.district}, <span className="opacity-60">{item.state}</span></span>
                  {isSelected && <span className="text-[10px] bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 px-1.5 py-0.5 rounded-full uppercase font-black">Active</span>}
                </button>
              );
            })}
            {filteredItems.length === 0 && (
              <div className="px-4 py-3 text-gray-400 text-center">No locations found. Try searching another state or district.</div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default LocationPicker;
