import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Building, ArrowLeft, Droplets, ChevronLeft, ChevronRight, Info, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const STRATEGY_COLORS = ['#00E5FF', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'];

interface ChartResult {
  data: Record<string, string | number>[];
  keys: string[];
}

export default function MunicipalityPanel() {
  const {
    activeMunicipality,
    setActiveMunicipality,
    activeInstitutionId,
    setActiveInstitutionId,
    setSidebarOpen,
    theme,
  } = useAppStore();

  const isLight = theme === 'light';
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(false);
  }, [activeMunicipality?.name]);

  const activeInstitution = useMemo(() => {
    if (!activeMunicipality || !activeInstitutionId) return null;
    return activeMunicipality.institutions.find(i => i.id === activeInstitutionId);
  }, [activeMunicipality, activeInstitutionId]);

  const chartData = useMemo<ChartResult>(() => {
    if (!activeMunicipality) return { data: [], keys: [] };

    const countMap: Record<string, number> = {};
    activeMunicipality.institutions.forEach(inst => {
      inst.programas.forEach(p => {
        const g = p.estrategia || 'OTROS';
        countMap[g] = (countMap[g] || 0) + p.total;
      });
    });

    const keys = Object.keys(countMap);
    return {
      data: [{ name: 'Estrategias', ...countMap }],
      keys,
    };
  }, [activeMunicipality]);

  if (!activeMunicipality) return null;

  return (
    <>
      {/* Floating Tooltip for Active Institution */}
      <AnimatePresence>
        {activeInstitution && (
          <motion.div
            key="tooltip-inst"
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
            exit={{ opacity: 0, scale: 0.9, y: "-50%", x: "-50%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-[calc(50%-225px)] z-50 w-[380px] p-6 rounded-3xl flex flex-col pointer-events-auto backdrop-blur-2xl border"
            style={{
              backgroundColor: isLight
                ? 'rgba(255, 255, 255, 0.35)' // Frosted white glass in light mode
                : 'rgba(20, 20, 25, 0.5)',   // Frosted dark glass in dark mode
              borderColor: isLight
                ? 'rgba(255, 255, 255, 0.5)'
                : 'rgba(255, 255, 255, 0.15)',
              boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.15)',
            }}
          >
            <div className="flex items-start gap-3 mb-4 relative pb-4" style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)'}` }}>
              <div
                className="p-3.5 rounded-2xl shrink-0 flex items-center justify-center border"
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: 'rgba(255, 255, 255, 0.9)',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.08)',
                }}
              >
                <Info className="w-6 h-6" style={{ color: '#ea580c' }} />
              </div>
              <div className="pr-12">
                <h4
                  className="font-sans font-bold text-xl leading-tight text-slate-800 dark:text-white"
                >
                  {activeInstitution.name}
                </h4>
                <p className="font-sans text-[11px] font-semibold mt-0.5 tracking-wider uppercase text-slate-600 dark:text-white">
                  {activeInstitution.zona}
                </p>
              </div>
              <button 
                onClick={() => setActiveInstitutionId(null)}
                className="absolute top-0 right-0 p-2 rounded-full border flex items-center justify-center shadow-lg transition-all duration-300 active:scale-90 hover:scale-105"
                style={{
                  color: '#ea580c',
                  backgroundColor: isLight ? 'rgba(255, 255, 255, 0.8)' : 'rgba(30, 41, 59, 0.8)',
                  borderColor: isLight ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 14px rgba(234, 88, 12, 0.3)',
                }}
                title="Cerrar detalle"
              >
                <X className="w-4 h-4" strokeWidth={2.5} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[50vh] space-y-3 pr-2 custom-scrollbar">
              <h5
                className="font-sans text-[11px] font-bold uppercase tracking-wider mb-2 text-orange-600 dark:text-orange-400"
              >
                Programas Ofertados ({activeInstitution.programas.length})
              </h5>
              {activeInstitution.programas.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-2xl border transition-all"
                  style={{
                    backgroundColor: isLight ? 'rgba(255, 255, 255, 0.35)' : 'rgba(30, 41, 59, 0.4)',
                    borderColor: isLight ? 'rgba(255, 255, 255, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div className="flex flex-col gap-1 flex-1 pr-4">
                    <span className="font-sans font-bold text-[11px] tracking-wider uppercase text-slate-800 dark:text-slate-200">{p.estrategia}</span>
                    <span className="text-xs leading-relaxed font-sans text-slate-600 dark:text-white">{p.programa}</span>
                  </div>
                  <span
                    className="font-mono text-sm font-bold px-3 py-1.5 rounded-xl text-white flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: '#f97316',
                      boxShadow: '0 4px 12px rgba(249, 115, 22, 0.4)',
                    }}
                  >
                    {p.total}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        <motion.div
        key="local-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: isCollapsed ? 450 : 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-[450px] glass border-l z-20 flex flex-col pointer-events-auto"
        style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)' }}
      >
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -left-12 -translate-y-1/2 glass p-3 rounded-l-xl border-r-0 shadow-2xl transition-all active:scale-95 flex items-center justify-center"
          style={{ color: isLight ? '#ea580c' : '#22d3ee' }}
          title={isCollapsed ? "Ver datos de municipio" : "Ocultar panel"}
        >
          {isCollapsed ? <ChevronLeft className="w-5 h-5 animate-pulse" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        {/* Header */}
        <div className="p-8 shrink-0" style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}` }}>
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="font-serif text-4xl leading-tight break-words pr-4" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>
                {activeMunicipality.name}
              </h2>
              <div className="font-mono text-xs mt-1 uppercase tracking-widest flex items-center gap-2" style={{ color: isLight ? '#ea580c' : '#22d3ee' }}>
                <Droplets className="w-3 h-3" />
                Sede Central / Zona {activeMunicipality.zona}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" style={{ color: isLight ? '#ea580c' : '#22d3ee' }} />
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-50" style={{ color: isLight ? '#4a4a6a' : '#9ca3af' }}>Estudiantes</p>
              </div>
              <div className="font-mono text-2xl font-bold mt-1" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>
                {activeMunicipality.totalStudents.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="p-4 glass rounded-xl">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4" style={{ color: isLight ? '#7c3aed' : '#a78bfa' }} />
                <p className="font-mono text-[10px] uppercase tracking-widest opacity-50" style={{ color: isLight ? '#4a4a6a' : '#9ca3af' }}>Inst. Educativas</p>
              </div>
              <div className="font-mono text-2xl font-bold mt-1" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>
                {activeMunicipality.institutions.length}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 touch-pan-y">
          {/* Stacked bar chart by strategy */}
          {chartData.keys.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-mono text-[10px] uppercase opacity-50 tracking-widest" style={{ color: isLight ? '#4a4a6a' : '#fff' }}>Impacto por Estrategia</h3>
              <div className="w-full glass rounded-xl p-4 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={24}>
                  <BarChart data={chartData.data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.0)' }}
                      contentStyle={{
                        backgroundColor: isLight ? '#fff' : '#0f1115',
                        border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}`,
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        color: isLight ? '#1a1a2e' : '#fff',
                      }}
                      itemStyle={{ color: isLight ? '#ea580c' : '#00E5FF' }}
                    />
                    {chartData.keys.map((key, index) => (
                      <Bar
                        key={key}
                        dataKey={key}
                        stackId="a"
                        fill={STRATEGY_COLORS[index % STRATEGY_COLORS.length]}
                        radius={
                          chartData.keys.length === 1
                            ? [4, 4, 4, 4]
                            : index === 0
                              ? [4, 0, 0, 4]
                              : index === chartData.keys.length - 1
                                ? [0, 4, 4, 0]
                                : [0, 0, 0, 0]
                        }
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>

                {/* Custom legend */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {chartData.keys.map((key, i) => (
                    <div key={key} className="flex items-center gap-2 font-mono text-[10px]" style={{ color: isLight ? '#374151' : '#d1d5db' }}>
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: STRATEGY_COLORS[i % STRATEGY_COLORS.length] }}
                      />
                      <span>{key}: {chartData.data[0]?.[key] ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Institutions list */}
          <div className="space-y-4">
            <div className="flex justify-between items-center px-4">
              <h3 className="font-mono text-[10px] uppercase opacity-50 tracking-widest" style={{ color: isLight ? '#4a4a6a' : '#fff' }}>
                Instituciones ({activeMunicipality.institutions.length})
              </h3>
              <div className="flex items-center gap-1 opacity-50" style={{ color: isLight ? '#4a4a6a' : '#fff' }} title="Estudiantes">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="space-y-3">
              {activeMunicipality.institutions.map(inst => {
                const isActive = activeInstitutionId === inst.id;
                return (
                  <button
                    key={inst.id}
                    onClick={() => setActiveInstitutionId(isActive ? null : inst.id)}
                    className={cn(
                      "w-full text-left p-4 rounded-lg transition-all duration-300 active:scale-95 group",
                      isActive
                        ? "glass border-transparent border-l-4 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                        : "border border-transparent transition-colors"
                    )}
                    style={{
                      borderLeftColor: isActive ? (isLight ? '#ea580c' : '#22d3ee') : undefined,
                      backgroundColor: isActive
                        ? (isLight ? 'rgba(234,88,12,0.08)' : 'rgba(34,211,238,0.1)')
                        : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = isLight ? 'rgba(0,0,0,0.03)' : 'rgba(255,255,255,0.05)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.backgroundColor = '';
                      }
                    }}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h4
                        className="font-serif text-xl leading-tight"
                        style={{ color: isActive ? (isLight ? '#ea580c' : '#67e8f9') : (isLight ? '#1a1a2e' : '#fff') }}
                      >
                        {inst.name}
                      </h4>
                      <span
                        className="font-mono text-sm font-bold shrink-0 px-2 py-1 rounded-md"
                        style={{
                          color: isLight ? '#ea580c' : '#22d3ee',
                          backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                        }}
                      >
                        {inst.total}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 shrink-0 text-center" style={{ borderTop: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}` }}>
          <button
            onClick={() => {
              setActiveMunicipality(null);
              setActiveInstitutionId(null);
              setSidebarOpen(true);
            }}
            className="w-full py-4 glass rounded-xl font-mono text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95"
            style={{ color: isLight ? '#1a1a2e' : '#fff' }}
          >
            <ArrowLeft className="w-4 h-4 opacity-50" />
            Cerrar Municipio
          </button>
          <p className="mt-6 font-serif italic opacity-40 text-sm" style={{ color: isLight ? '#4a4a6a' : '#fff' }}>"El agua como camino de conocimiento"</p>
        </div>
      </motion.div>
    </AnimatePresence>
    </>
  );
}
