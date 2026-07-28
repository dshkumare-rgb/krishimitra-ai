import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

export interface MapMarkerItem {
  id: string;
  latitude: number;
  longitude: number;
  label: string;
  info: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface MapContainerProps {
  items: MapMarkerItem[];
  center?: { lat: number; lon: number };
  zoom?: number;
}

export const MapContainer: React.FC<MapContainerProps> = ({ 
  items, 
  center = { lat: 22.719, lon: 75.857 }, // Central India default
  zoom = 6 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize map if it doesn't exist
    if (!mapRef.current) {
      mapRef.current = L.map(mapContainerRef.current).setView([center.lat, center.lon], zoom);

      // Add OpenStreetMap tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    } else {
      mapRef.current.setView([center.lat, center.lon], zoom);
    }

    const map = mapRef.current;

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add new markers
    items.forEach(item => {
      const pinColor = item.severity === 'HIGH' ? '#ef4444' : item.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';
      
      // Custom HTML Marker Icon (avoids missing asset icons in bundlers)
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            width: 20px; 
            height: 20px; 
            background-color: ${pinColor}; 
            border: 2px solid white; 
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });

      const marker = L.marker([item.latitude, item.longitude], { icon: customIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 4px;">
            <h4 style="margin: 0 0 4px 0; font-weight: bold; font-size: 14px; color: #1e293b;">${item.label}</h4>
            <p style="margin: 0; font-size: 12px; color: #64748b;">${item.info}</p>
          </div>
        `);

      markersRef.current.push(marker);
    });

    // Auto zoom to fit markers if they exist
    if (items.length > 0 && map) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }

    return () => {
      // Cleanup happens if component is fully destroyed
    };
  }, [items, center, zoom]);

  // Clean map instance on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[350px] border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-inner">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapContainer;
