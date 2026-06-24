/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { AppProvider, useAppStore } from './store/appStore';
import AppMap from './components/Map';
import Sidebar from './components/Sidebar';
import MunicipalityPanel from './components/MunicipalityPanel';
import VideoModal from './components/VideoModal';
import ThemeToggle from './components/ThemeToggle';

function AppContent() {
  const { 
    activeMunicipality,
    setActiveMunicipality,
    setActiveInstitutionId,
    setActiveSedeId,
    setVideoModalOpen,
    setSidebarOpen,
    theme,
  } = useAppStore();

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const resetApp = () => {
      setActiveMunicipality(null);
      setActiveInstitutionId(null);
      setActiveSedeId(null);
      setVideoModalOpen(false);
      setSidebarOpen(true);
    };

    const resetTimer = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resetApp, 120000); // 2 minutes of inactivity
    };

    // Initialize timer
    resetTimer();

    // Attach global event listeners
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    window.addEventListener('wheel', resetTimer);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
      window.removeEventListener('wheel', resetTimer);
    };
  }, [
    setActiveMunicipality,
    setActiveInstitutionId,
    setActiveSedeId,
    setVideoModalOpen,
    setSidebarOpen
  ]);

  return (
    <div className={`relative w-full h-screen overflow-hidden selection:bg-cyan-500/30 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
      <AppMap />
      <Sidebar />
      <MunicipalityPanel />
      <VideoModal />

      {/* Theme Toggle — top-right corner, always visible */}
      <div className="absolute top-6 right-6 z-30">
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
