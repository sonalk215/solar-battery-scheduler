import { useEffect, useState } from 'react';
import { apiClient } from './services/api';
import UnscheduledDrawer from './components/UnscheduledDrawer';
import ScheduleGrid from './components/ScheduleGrid';
import { FiCloudRain, FiCheckCircle } from 'react-icons/fi';

function App() {
  const [jobs, setJobs] = useState([]);
  const [installers, setInstallers] = useState([]);
  const [weatherRisk, setWeatherRisk] = useState(null);
  const [toast, setToast] = useState(null);

  const loadData = async () => {
    try {
      const [jRes, iRes, wRes] = await Promise.all([
        apiClient.getJobs(),
        apiClient.getInstallers(),
        apiClient.getWeatherRisk(),
      ]);

      setJobs(jRes.data);
      setInstallers(iRes.data);
      setWeatherRisk(wRes.data.forecast);
    } catch (err) {
      console.error('Failed to sync dispatcher board:', err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, []);

  const handleDropAssignment = async (payload) => {
    try {
      await apiClient.assignJob(payload);
      setToast('Job assigned / rescheduled!');
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="flex h-screen bg-slate-100 text-slate-800 overflow-hidden font-sans">
      <UnscheduledDrawer jobs={jobs} />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-14 border-b border-slate-200 bg-white px-6 flex items-center justify-between text-xs shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <h1 className="font-bold tracking-wide uppercase text-slate-900 text-sm">
              National Battery Installation Dispatch
            </h1>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-medium">
              Persistent DB + Rules Live
            </span>
          </div>
          <span className="text-slate-500 flex items-center gap-1.5">
            <FiCloudRain className="text-blue-500 text-sm" /> Open-Meteo
            Thresholds (&gt;40km/h wind / &gt;15mm rain)
          </span>
        </header>

        <ScheduleGrid
          installers={installers}
          jobs={jobs}
          weatherRisk={weatherRisk}
          // weatherRisk={mockWeatherRisk} // Use mock data for testing
          onDropJob={handleDropAssignment}
        />
      </main>

      {toast && (
        <div className="fixed bottom-6 right-6 bg-emerald-600 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 z-50">
          <FiCheckCircle className="text-base" /> {toast}
        </div>
      )}
    </div>
  );
}

export default App;
