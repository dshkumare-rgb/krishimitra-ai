import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  stateName: string;
  districtName: string;
  setLocation: (state: string, district: string) => void;
  statesList: string[];
  getDistrictsForState: (state: string) => string[];
  getCoordinates: () => { lat: number; lon: number };
  loading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stateName, setStateName] = useState(() => localStorage.getItem('km-selected-state') || 'Uttar Pradesh');
  const [districtName, setDistrictName] = useState(() => localStorage.getItem('km-selected-district') || 'Sultanpur');
  const [statesDistricts, setStatesDistricts] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/data/indian_states_districts.json')
      .then((res) => res.json())
      .then((data) => {
        setStatesDistricts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load state-district mapping:', err);
        setLoading(false);
      });
  }, []);

  const setLocation = (state: string, district: string) => {
    setStateName(state);
    setDistrictName(district);
    localStorage.setItem('km-selected-state', state);
    localStorage.setItem('km-selected-district', district);
  };

  const statesList = Object.keys(statesDistricts);

  const getDistrictsForState = (state: string) => {
    return statesDistricts[state] || [];
  };

  const getCoordinates = () => {
    const name = `${districtName.toLowerCase()}, ${stateName.toLowerCase()}`;
    if (name.includes('sultanpur') && name.includes('uttar pradesh')) {
      return { lat: 26.2624, lon: 82.0722 };
    }
    if (name.includes('ludhiana') && name.includes('punjab')) {
      return { lat: 30.9010, lon: 75.8573 };
    }
    if (name.includes('indore') && name.includes('madhya pradesh')) {
      return { lat: 22.7196, lon: 75.8577 };
    }

    let hash = 0;
    const key = `${districtName}, ${stateName}`;
    for (let i = 0; i < key.length; i++) {
      hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const lat = 15.0 + Math.abs((hash % 150) / 10);
    const lon = 73.0 + Math.abs(((hash >> 8) % 120) / 10);
    return { lat, lon };
  };

  return (
    <LocationContext.Provider value={{ stateName, districtName, setLocation, statesList, getDistrictsForState, getCoordinates, loading }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within LocationProvider');
  return context;
};
