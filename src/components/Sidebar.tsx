import { useAppStore } from '../store/appStore';
import { ChevronRight, ChevronLeft, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export default function Sidebar() {
  const { data, activeMunicipality, setActiveMunicipality, isSidebarOpen, setSidebarOpen } = useAppStore();

  const mpios = data.municipalities;

  return (
    <>
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className={cn(
          "absolute top-6 z-20 glass p-3 rounded-r-xl border border-white/10 border-l-0 text-white shadow-2xl transition-all duration-500",
          isSidebarOpen ? "left-[320px]" : "left-0"
        )}
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
            className="absolute top-0 left-0 h-full w-[320px] glass border-r border-white/10 flex flex-col z-10 shadow-2xl"
          >
            <div className="p-6 border-b border-white/10 shrink-0">
              <img
                src="/logo/logo cauce naranja completo.png"
                alt="CAUCE Logo"
                className="h-36 w-auto mb-2 object-contain"
              />
              <p className="font-serif text-2xl tracking-wide text-cyan-300 drop-shadow-md uppercase">
                Regionalización U. Caldas
              </p>
            </div>

            <div className="px-6 py-2 shrink-0">
              <p className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
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
                          ? "glass border-transparent border-l-4 border-l-cyan-500 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
                          : "hover:bg-white/5 border border-transparent transition-colors"
                      )}
                    >
                      <div>
                        <h3 className={cn("font-serif text-xl transition-colors", isActive ? "text-cyan-300" : "text-white")}>
                          {m.name}
                        </h3>
                        <div className="font-mono text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider flex gap-2">
                          <span>{m.zona}</span>
                          <span className="text-white/30">•</span>
                          <span>{m.institutions.length} I.E.</span>
                        </div>
                      </div>
                      <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "text-cyan-400 translate-x-1" : "text-white/20 group-hover:text-white/60")} />
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
