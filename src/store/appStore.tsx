import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { parseData, RegionData, Municipality, Institution } from '../lib/dataParser';

interface AppState {
  data: RegionData;
  activeMunicipality: Municipality | null;
  activeInstitutionId: string | null;
  activeSedeId: string | null;
  isSidebarOpen: boolean;
  setActiveMunicipality: (m: Municipality | null) => void;
  setActiveInstitutionId: (id: string | null) => void;
  setActiveSedeId: (id: string | null) => void;
  setSidebarOpen: (open: boolean) => void;
  isVideoModalOpen: boolean;
  setVideoModalOpen: (open: boolean) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => parseData(), []);
  const [activeMunicipality, setActiveMunicipality] = useState<Municipality | null>(null);
  const [activeInstitutionId, setActiveInstitutionId] = useState<string | null>(null);
  const [activeSedeId, setActiveSedeId] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isVideoModalOpen, setVideoModalOpen] = useState(false);

  return (
    <AppContext.Provider
      value={{
        data,
        activeMunicipality,
        activeInstitutionId,
        activeSedeId,
        isSidebarOpen,
        setActiveMunicipality,
        setActiveInstitutionId,
        setActiveSedeId,
        setSidebarOpen,
        isVideoModalOpen,
        setVideoModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppStore must be used within AppProvider');
  return context;
}
