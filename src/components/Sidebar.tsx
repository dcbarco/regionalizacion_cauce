import { useAppStore } from '../store/appStore';
import { ChevronRight, ChevronLeft, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { data, activeMunicipality, setActiveMunicipality, isSidebarOpen, setSidebarOpen, theme } = useAppStore();
  const isLight = theme === 'light';

  const mpios = data.municipalities;

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={cn(
          "absolute top-6 z-20 glass p-3 rounded-r-xl border-l-0 shadow-2xl transition-all duration-500",
          isSidebarOpen ? "left-[320px]" : "left-0"
        )}
        style={{ color: isLight ? '#1a1a2e' : '#fff' }}
      >
        {isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 left-0 h-full w-[320px] glass border-r flex flex-col z-10 shadow-2xl"
            style={{ borderColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)' }}
          >
            <div className="p-6 shrink-0" style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}` }}>
              <img
                src="/logo/logo cauce naranja completo.png"
                alt="CAUCE Logo"
                className="h-36 w-auto mb-2 object-contain"
              />
              <p
                className="font-serif text-2xl tracking-wide drop-shadow-md uppercase"
                style={{ color: isLight ? '#ea580c' : '#67e8f9' }}
              >
                Regionalización U. Caldas
              </p>
            </div>

            <div className="px-6 py-2 shrink-0">
              <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: isLight ? '#8888aa' : '#6b7280' }}>
                {mpios.length} municipios
              </p>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-1 touch-pan-y scroll-smooth pointer-events-auto">
              <AnimatePresence>
                {mpios.map((m) => {
                  const isActive = activeMunicipality?.name === m.name;
                  return (
                    <motion.button
                      key={m.name}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onClick={() => {
                        setActiveMunicipality(m);
                        setSidebarOpen(false);
                      }}
                      className={cn(
                        "w-full text-left py-2 px-3 rounded-lg flex items-center justify-between group transition-all duration-300 active:scale-95 touch-manipulation",
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
                      <div>
                        <h3
                          className="font-serif text-xl transition-colors"
                          style={{ color: isActive ? (isLight ? '#ea580c' : '#67e8f9') : (isLight ? '#1a1a2e' : '#fff') }}
                        >
                          {m.name}
                        </h3>
                        <div className="font-mono text-[9px] mt-0.5 uppercase tracking-wider flex gap-2" style={{ color: isLight ? '#8888aa' : '#9ca3af' }}>
                          <span>{m.zona}</span>
                          <span style={{ color: isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.3)' }}>•</span>
                          <span>{m.institutions.length} I.E.</span>
                        </div>
                      </div>
                      <ChevronRight
                        className="w-4 h-4 transition-transform"
                        style={{
                          color: isActive
                            ? (isLight ? '#ea580c' : '#22d3ee')
                            : (isLight ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.2)'),
                          transform: isActive ? 'translateX(4px)' : undefined,
                        }}
                      />
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
