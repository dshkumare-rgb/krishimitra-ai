import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { FiSliders, FiActivity, FiMapPin, FiCompass } from 'react-icons/fi';
import { motion } from 'framer-motion';

export const SatelliteMap: React.FC = () => {
  const { t, language } = useLanguage();
  const { theme } = useTheme();
  const { getCoordinates, stateName, districtName } = useLocation();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [hudMetrics, setHudMetrics] = useState({
    name: 'Ludhiana North Plot',
    crop: 'Wheat',
    area: '4.2 Acres',
    moisture: '38%',
    temp: '29.4°C',
    ndvi: '0.82',
    healthStatus: 'HEALTHY'
  });

  const fieldsData = [
    {
      id: 'field-1',
      name: `${districtName} North Plot`,
      crop: 'Wheat',
      area: '4.2 Acres',
      moisture: '38%',
      temp: '29.4°C',
      ndvi: '0.82',
      healthStatus: 'HEALTHY',
      color: '#22c55e', // Vibrant green
      coords: [
        [30.912, 75.845],
        [30.916, 75.845],
        [30.916, 75.852],
        [30.912, 75.852]
      ] as [number, number][]
    },
    {
      id: 'field-2',
      name: 'Central Cotton Block',
      crop: 'Cotton',
      area: '3.8 Acres',
      moisture: '21%',
      temp: '32.1°C',
      ndvi: '0.54',
      healthStatus: 'MODERATE',
      color: '#f59e0b', // Orange
      coords: [
        [30.903, 75.860],
        [30.908, 75.860],
        [30.908, 75.868],
        [30.903, 75.868]
      ] as [number, number][]
    },
    {
      id: 'field-3',
      name: 'South Maize Zone',
      crop: 'Maize',
      area: '2.5 Acres',
      moisture: '14%',
      temp: '34.5°C',
      ndvi: '0.31',
      healthStatus: 'STRESSED',
      color: '#ef4444', // Red
      coords: [
        [30.895, 75.848],
        [30.899, 75.848],
        [30.899, 75.855],
        [30.895, 75.855]
      ] as [number, number][]
    }
  ];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const { lat, lon } = getCoordinates();
    const latOffset = lat - 30.908;
    const lonOffset = lon - 75.855;

    // Shift coordinates dynamically centered on active location
    const shiftedFields = fieldsData.map(f => ({
      ...f,
      coords: f.coords.map(c => [c[0] + latOffset, c[1] + lonOffset] as [number, number])
    }));

    const shiftedOutbreak = [30.897 + latOffset, 75.8515 + lonOffset] as [number, number];

    // Initialize Map centered around active state/district coordinates
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false
      });

      // Mount high-resolution ESRI World Satellite Imagery (free & public)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapRef.current);

      layerGroupRef.current = L.layerGroup().addTo(mapRef.current);
    }

    const map = mapRef.current;
    const layerGroup = layerGroupRef.current;
    if (!layerGroup) return;

    // Clear old drawings and center map
    layerGroup.clearLayers();
    map.setView([lat, lon], 13);

    // Plot color-coded field polygons
    shiftedFields.forEach(field => {
      const polygon = L.polygon(field.coords, {
        color: field.color,
        fillColor: field.color,
        fillOpacity: 0.4,
        weight: 2
      }).addTo(layerGroup);

      // Add tooltip/popups
      polygon.bindTooltip(`
        <div style="font-family: sans-serif; font-size: 11px; font-weight: bold; padding: 2px;">
          🌱 ${field.name}<br/>
          Crop: ${field.crop} | NDVI: ${field.ndvi}
        </div>
      `);

      polygon.on('click', () => {
        setSelectedField(field.id);
        setHudMetrics(field);
        map.fitBounds(polygon.getBounds().pad(0.3));
      });
    });

    // Plot custom interactive pulsing pin on the stressed Field 3
    const pulsingIcon = L.divIcon({
      className: 'pulsing-map-marker',
      html: `
        <div style="position: relative; width: 22px; height: 22px;">
          <div style="
            position: absolute; 
            width: 22px; 
            height: 22px; 
            background: rgba(239, 68, 68, 0.4); 
            border-radius: 50%; 
            animation: pulse-ring 1.2s cubic-bezier(0.215, 0.610, 0.355, 1) infinite;
          "></div>
          <div style="
            position: absolute; 
            width: 12px; 
            height: 12px; 
            background: #ef4444; 
            border: 2px solid white; 
            border-radius: 50%;
            top: 5px;
            left: 5px;
            box-shadow: 0 0 10px rgba(0,0,0,0.4);
          "></div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11]
    });

    L.marker(shiftedOutbreak, { icon: pulsingIcon })
      .addTo(layerGroup)
      .bindPopup(`
        <div style="font-family: sans-serif; padding: 4px; max-width: 200px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 13px; color: #ef4444; display: flex; align-items: center; gap: 4px;">
            ⚠️ Pest Alert: Fall Armyworm
          </h4>
          <p style="margin: 0; font-size: 11px; color: #475569; leading-normal;">
            High risk infestation detected inside South Maize Zone. Immediate bio-control spray is advised.
          </p>
        </div>
      `);

    return () => {
      // Clean layers on coordinates change
    };
  }, [stateName, districtName]);

  // Clean map instance on component unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100 flex items-center gap-2">
          🛰️ 3D Satellite Field Monitor
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Interactive GIS tracking overlay. Analyze chlorophyll crop density indexes and pest hotspots using ESRI imagery.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Map view (3 cols) */}
        <div className="lg:col-span-3 bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-150 dark:border-gray-800 flex flex-col gap-3 relative">
          
          <div className="absolute top-6 left-6 z-20 bg-white/95 dark:bg-gray-900/95 p-3 rounded-2xl border border-gray-150 dark:border-gray-800 shadow-lg flex flex-col gap-1.5 text-[10px] font-bold text-gray-600 dark:text-gray-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-green-500 rounded-full" /> Healthy Zone (NDVI &gt; 0.7)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full" /> Moderate Stress (NDVI 0.5-0.7)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" /> High Risk Zone (NDVI &lt; 0.5)</span>
          </div>

          <div ref={mapContainerRef} className="w-full h-[450px] rounded-2xl overflow-hidden shadow-inner z-10" />
        </div>

        {/* Right Side: HUD Controls (1 col) */}
        <div className="space-y-6">
          
          {/* Field Analysis metrics */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-xl -mr-6 -mt-6" />
            
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 px-2.5 py-0.5 rounded-full w-fit">
              <FiCompass className="w-3.5 h-3.5" /> Zone Analytics
            </div>

            <div className="space-y-3.5 pt-2">
              <div>
                <span className="text-[10px] text-gray-400 block font-semibold">Active Sector</span>
                <span className="text-xs font-bold text-gray-750 dark:text-gray-200 block truncate">{hudMetrics.name}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block">Sown Crop</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{hudMetrics.crop}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Area Size</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{hudMetrics.area}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-gray-400 block">Soil Moisture</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{hudMetrics.moisture}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">Root Temp</span>
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{hudMetrics.temp}</span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 rounded-2xl">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-450 font-bold block">NDVI Density Index</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    hudMetrics.healthStatus === 'HEALTHY' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-950' 
                      : hudMetrics.healthStatus === 'MODERATE' 
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950' 
                      : 'bg-red-100 text-red-700 dark:bg-red-950'
                  }`}>
                    {hudMetrics.healthStatus}
                  </span>
                </div>
                <span className="text-2xl font-black text-gray-800 dark:text-gray-100 block mt-1.5">{hudMetrics.ndvi}</span>
              </div>
            </div>
          </div>

          {/* Quick HUD controls */}
          <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4">
            <h3 className="font-bold text-gray-800 dark:text-gray-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FiSliders className="w-4 h-4 text-primary-650" /> Sector Switcher
            </h3>
            <div className="space-y-2">
              {fieldsData.map(field => (
                <button
                  key={field.id}
                  onClick={() => {
                    setSelectedField(field.id);
                    setHudMetrics(field);
                    if (mapRef.current) {
                      const bounds = L.polygon(field.coords).getBounds();
                      mapRef.current.fitBounds(bounds.pad(0.3));
                    }
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold transition flex items-center justify-between ${
                    selectedField === field.id 
                      ? 'bg-primary-50 border-primary-300 text-primary-900 dark:bg-primary-950/20' 
                      : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-855 hover:bg-gray-100'
                  }`}
                >
                  <span className="truncate pr-2">{field.crop} Field</span>
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: field.color }} />
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default SatelliteMap;
