import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { LocationProvider } from './context/LocationContext';
import { Layout } from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CropRecommendation from './pages/CropRecommendation';
import DiseaseDetection from './pages/DiseaseDetection';
import WeatherDashboard from './pages/WeatherDashboard';
import MandiIntelligence from './pages/MandiIntelligence';
import IrrigationPlanner from './pages/IrrigationPlanner';
import FertilizerRecommendation from './pages/FertilizerRecommendation';
import SoilHealthCard from './pages/SoilHealthCard';
import ProfitCalculator from './pages/ProfitCalculator';
import SchemeFinder from './pages/SchemeFinder';
import PestAlerts from './pages/PestAlerts';
import AdminPanel from './pages/AdminPanel';
import SatelliteMap from './pages/SatelliteMap';
import YieldPredictorPage from './pages/YieldPredictorPage';
import MachineryTrackerPage from './pages/MachineryTrackerPage';
import ResourceOptimizerPage from './pages/ResourceOptimizerPage';
import CropCalendar from './pages/CropCalendar';
import Marketplace from './pages/Marketplace';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🌱</span>
          <span className="text-sm font-bold text-gray-500 animate-pulse">KrishiMitra Loading...</span>
        </div>
      </div>
    );
  }

  // Render Login if not authenticated
  if (!user) {
    return <Login onToggleAuth={() => {}} />;
  }

  return (
    <Layout activePage={activePage} setActivePage={setActivePage}>
      {activePage === 'dashboard' && <Dashboard setActivePage={setActivePage} />}
      {activePage === 'crop' && <CropRecommendation />}
      {activePage === 'yield-predictor' && <YieldPredictorPage />}
      {activePage === 'disease' && <DiseaseDetection />}
      {activePage === 'weather' && <WeatherDashboard />}
      {activePage === 'satellite-map' && <SatelliteMap />}
      {activePage === 'machinery' && <MachineryTrackerPage />}
      {activePage === 'mandi' && <MandiIntelligence />}
      {activePage === 'irrigation' && <IrrigationPlanner />}
      {activePage === 'resource-opt' && <ResourceOptimizerPage />}
      {activePage === 'fertilizer' && <FertilizerRecommendation />}
      {activePage === 'soil-card' && <SoilHealthCard />}
      {activePage === 'profit' && <ProfitCalculator />}
      {activePage === 'schemes' && <SchemeFinder />}
      {activePage === 'pests' && <PestAlerts />}
      {activePage === 'calendar' && <CropCalendar />}
      {activePage === 'marketplace' && <Marketplace />}
      {activePage === 'settings' && <Settings />}
      {activePage === 'admin' && user.role === 'admin' && <AdminPanel />}
    </Layout>
  );
};


export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <LocationProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </LocationProvider>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
