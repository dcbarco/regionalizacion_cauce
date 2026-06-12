import { useMemo, useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Building, ArrowLeft, Droplets, ChevronLeft, ChevronRight } from 'lucide-react';
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
  } = useAppStore();

  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    setIsCollapsed(false);
  }, [activeMunicipality?.name]);

  const chartData = useMemo<ChartResult>(() => {
    if (!activeMunicipality) return { data: [], keys: [] };

    const countMap: Record<string, number> = {};
    activeMunicipality.institutions.forEach(inst => {
      const g = inst.estrategia || 'OTROS';
      countMap[g] = (countMap[g] || 0) + inst.total;
    });

    const keys = Object.keys(countMap);
    return {
      data: [{ name: 'Estrategias', ...countMap }],
      keys,
    };
  }, [activeMunicipality]);

  if (!activeMunicipality) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="local-panel"
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: isCollapsed ? 450 : 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-[450px] glass border-l border-white/10 z-20 flex flex-col pointer-events-auto"
      >
        {/* Collapse/Expand Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -left-12 -translate-y-1/2 glass p-3 rounded-l-xl border border-white/10 border-r-0 text-white shadow-2xl transition-all active:scale-95 flex items-center justify-center hover:bg-white/5"
          title={isCollapsed ? "Ver datos de municipio" : "Ocultar panel"}
        >
          {isCollapsed ? <ChevronLeft className="w-5 h-5 text-cyan-400 animate-pulse" /> : <ChevronRight className="w-5 h-5 text-cyan-400" />}
        </button>
        {/* Header */}
        <div className="p-8 border-b border-white/10 shrink-0">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h2 className="font-serif text-4xl leading-tight text-white break-words pr-4">
                {activeMunicipality.name}
              </h2>
              <div className="font-mono text-xs text-cyan-400 mt-1 uppercase tracking-widest flex items-center gap-2">
                <Droplets className="w-3 h-3" />
                Sede Central / Zona {activeMunicipality.zona}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 glass rounded-xl">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest opacity-50">Estudiantes</p>
              </div>
              <div className="font-mono text-2xl font-bold text-white mt-1">
                {activeMunicipality.totalStudents.toLocaleString('es-CO')}
              </div>
            </div>
            <div className="p-4 glass rounded-xl">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <p className="font-mono text-[10px] text-gray-400 uppercase tracking-widest opacity-50">Inst. Educativas</p>
              </div>
              <div className="font-mono text-2xl font-bold text-white mt-1">
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
              <h3 className="font-mono text-[10px] uppercase opacity-50 tracking-widest text-white">Impacto por Estrategia</h3>
              <div className="w-full glass rounded-xl p-4 flex flex-col justify-center">
                <ResponsiveContainer width="100%" height={24}>
                  <BarChart data={chartData.data} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" hide />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.0)' }}
                      contentStyle={{
                        backgroundColor: '#0f1115',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                      }}
                      itemStyle={{ color: '#00E5FF' }}
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
                    <div key={key} className="flex items-center gap-2 font-mono text-[10px] text-gray-300">
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
            <h3 className="font-mono text-[10px] uppercase opacity-50 tracking-widest text-white">
              Instituciones ({activeMunicipality.institutions.length})
            </h3>
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
                        ? "glass border-transparent border-l-4 border-l-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                        : "hover:bg-white/5 border border-transparent transition-colors"
                    )}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <h4 className={cn("font-serif text-xl leading-tight", isActive ? "text-cyan-300" : "text-white")}>
                        {inst.name}
                      </h4>
                      <span className="font-mono text-sm text-cyan-400 font-bold shrink-0">{inst.total}</span>
                    </div>
                    <div className="font-mono text-[10px] text-gray-500 mt-2 flex flex-col gap-1">
                      <span className="text-gray-400">{inst.estrategia}</span>
                      <span className="truncate">{inst.programa}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 shrink-0 text-center">
          <button
            onClick={() => {
              setActiveMunicipality(null);
              setActiveInstitutionId(null);
              setSidebarOpen(true);
            }}
            className="w-full py-4 glass rounded-xl font-mono text-xs uppercase tracking-[0.2em] hover:bg-white/5 transition-all text-white flex items-center justify-center gap-3 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 opacity-50" />
            Cerrar Municipio
          </button>
          <p className="mt-6 font-serif italic opacity-40 text-sm text-white">"El agua como camino de conocimiento"</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
