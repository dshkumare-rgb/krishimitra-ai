import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiBattery, FiRadio, FiCompass, FiShield, FiSliders, FiActivity } from 'react-icons/fi';

export const DronePatrol: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [showAiBoxes, setShowAiBoxes] = useState(true);
  const [thermalFilter, setThermalFilter] = useState(false);
  const [altitude, setAltitude] = useState(45);
  const [speed, setSpeed] = useState(12.4);
  const [battery, setBattery] = useState(84);
  
  // Drone coordinate simulators
  const [lat, setLat] = useState(30.9015);
  const [lon, setLon] = useState(75.8523);
  
  // Bounding box jitter simulation
  const [boxOffset, setBoxOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      // Simulate minor flight movements
      setLat((prev) => parseFloat((prev + (Math.random() - 0.5) * 0.0001).toFixed(6)));
      setLon((prev) => parseFloat((prev + (Math.random() - 0.5) * 0.0001).toFixed(6)));
      
      // Simulate small wind adjustments
      setAltitude((prev) => Math.min(60, Math.max(30, parseFloat((prev + (Math.random() - 0.5) * 0.4).toFixed(1)))));
      setSpeed((prev) => Math.min(20, Math.max(5, parseFloat((prev + (Math.random() - 0.5) * 0.2).toFixed(1)))));

      // Jitter bounding boxes to simulate AI tracking
      setBoxOffset({
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8
      });

      // Slow battery discharge
      setBattery((prev) => (prev > 5 ? prev - 0.02 : 100));

    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 shadow-sm p-6 space-y-4">
      
      {/* Header */}
      <div className="flex justify-between items-center pb-2">
        <div>
          <h4 className="text-sm font-black text-gray-850 dark:text-gray-150 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" /> Drone Patrol: Live Feed
          </h4>
          <p className="text-[10px] text-gray-450">Autonomous flight monitoring station</p>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex gap-2 text-[10px] font-bold">
          <button 
            onClick={() => setShowAiBoxes(!showAiBoxes)}
            className={`px-3 py-1.5 rounded-xl border transition ${
              showAiBoxes 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400' 
                : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-950 dark:border-gray-800'
            }`}
          >
            AI Overlay
          </button>
          <button 
            onClick={() => setThermalFilter(!thermalFilter)}
            className={`px-3 py-1.5 rounded-xl border transition ${
              thermalFilter 
                ? 'bg-amber-50 text-amber-800 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400' 
                : 'bg-gray-50 border-gray-200 text-gray-500 dark:bg-gray-950 dark:border-gray-800'
            }`}
          >
            Thermal Camera
          </button>
        </div>
      </div>

      {/* Main Video Viewport wrapper */}
      <div className="relative w-full h-[280px] rounded-2xl overflow-hidden bg-gray-950 shadow-inner select-none border border-gray-800">
        
        {/* Mock Top-Down Crop Fields Background (simulated using custom CSS gradients + scrolling effect!) */}
        <div 
          className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
            thermalFilter ? 'filter invert hue-rotate-180 contrast-125 saturate-150' : 'filter brightness-90'
          }`}
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80')`,
            animation: isPlaying ? 'scrolling-flight 30s linear infinite' : 'none',
            transform: 'scale(1.2)'
          }}
        />

        {/* HUD Elements Overlay */}
        <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 font-mono text-[10px] text-white">
          
          {/* Top Row: REC indicator + Battery */}
          <div className="flex justify-between items-center bg-black/35 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 font-bold text-red-500">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              <span>LIVE REC</span>
            </div>
            <div className="flex items-center gap-1.5 font-bold">
              <FiBattery className="w-4 h-4 text-emerald-400" />
              <span>{Math.floor(battery)}%</span>
            </div>
          </div>

          {/* Center: AI Bounding Boxes (Pulsing crop diagnostics) */}
          {showAiBoxes && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              
              {/* Box 1: Healthy Crop */}
              <div 
                className="absolute border-2 border-emerald-500 bg-emerald-500/10 p-1.5 rounded-lg flex flex-col justify-between"
                style={{
                  width: '120px',
                  height: '80px',
                  top: `calc(25% + ${boxOffset.y}px)`,
                  left: `calc(15% + ${boxOffset.x}px)`,
                  transition: 'top 0.5s ease, left 0.5s ease'
                }}
              >
                <span className="bg-emerald-500 text-white font-extrabold text-[8px] px-1 rounded-sm w-fit uppercase">
                  Paddy (96%)
                </span>
                <span className="text-[8px] font-bold text-emerald-400">HEALTHY</span>
              </div>

              {/* Box 2: Stress Alert Zone */}
              <div 
                className="absolute border-2 border-red-500 bg-red-500/15 p-1.5 rounded-lg flex flex-col justify-between animate-pulse"
                style={{
                  width: '100px',
                  height: '110px',
                  bottom: `calc(15% - ${boxOffset.y}px)`,
                  right: `calc(20% - ${boxOffset.x}px)`,
                  transition: 'bottom 0.5s ease, right 0.5s ease'
                }}
              >
                <span className="bg-red-500 text-white font-extrabold text-[8px] px-1 rounded-sm w-fit uppercase">
                  Alert: Heat Stress
                </span>
                <span className="text-[8px] font-bold text-red-400">WATER DEFICIT</span>
              </div>

            </div>
          )}

          {/* Bottom Row: Telemetry Indicators */}
          <div className="flex justify-between items-center bg-black/40 backdrop-blur-sm p-2 rounded-xl border border-white/10">
            <div>
              <p className="opacity-80">ALTITUDE</p>
              <p className="font-bold text-xs text-primary-400">{altitude}m</p>
            </div>
            <div>
              <p className="opacity-80">SPEED</p>
              <p className="font-bold text-xs text-primary-400">{speed} m/s</p>
            </div>
            <div className="text-right">
              <p className="opacity-80">GPS COORDINATES</p>
              <p className="font-bold text-xs text-primary-400">
                {lat.toFixed(4)}N {lon.toFixed(4)}E
              </p>
            </div>
          </div>

        </div>

        {/* Video Player Play/Pause Overlay Button */}
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 hover:bg-black/40 transition-all duration-300 z-20 text-white"
        >
          {isPlaying ? <FiPause className="w-10 h-10" /> : <FiPlay className="w-10 h-10" />}
        </button>

      </div>

      {/* Control Buttons Footer */}
      <div className="grid grid-cols-3 gap-2.5 text-xs font-bold pt-1.5">
        <button 
          onClick={() => {
            setAltitude(45);
            setSpeed(12.4);
            setBattery(84);
          }}
          className="py-2.5 px-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 dark:bg-gray-950 dark:border-gray-800 dark:hover:bg-gray-850 rounded-xl transition flex items-center justify-center gap-1.5 text-gray-700 dark:text-gray-300"
        >
          <FiRadio className="w-4 h-4 text-primary-650" /> Re-Calibrate
        </button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className={`py-2.5 px-3 rounded-xl border transition flex items-center justify-center gap-1.5 ${
            isPlaying 
              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400' 
              : 'bg-emerald-50 text-emerald-800 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400'
          }`}
        >
          {isPlaying ? (
            <>
              <FiPause className="w-4 h-4" /> Pause Patrol
            </>
          ) : (
            <>
              <FiPlay className="w-4 h-4" /> Resume Feed
            </>
          )}
        </button>
        <button 
          onClick={() => {
            setLat(30.9015);
            setLon(75.8523);
            alert('Drone returning to launch station (RTL)...');
          }}
          className="py-2.5 px-3 bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900 rounded-xl transition flex items-center justify-center gap-1.5"
        >
          <FiCompass className="w-4 h-4" /> Return Home (RTL)
        </button>
      </div>

    </div>
  );
};

export default DronePatrol;
