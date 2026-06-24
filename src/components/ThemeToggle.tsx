import { Sun, Moon } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { motion } from 'motion/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  const isLight = theme === 'light';

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center w-[72px] h-9 rounded-full p-1 transition-all duration-500 cursor-pointer group active:scale-95"
      style={{
        background: isLight
          ? 'linear-gradient(135deg, #e0e7ff 0%, #bae6fd 100%)'
          : 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
        border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.15)'}`,
        boxShadow: isLight
          ? '0 2px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.5)'
          : '0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
      title={isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-label={isLight ? 'Switch to dark mode' : 'Switch to light mode'}
    >
      {/* Background icons (static, fade in/out) */}
      <div className="absolute inset-0 flex items-center justify-between px-2.5 pointer-events-none">
        <Sun
          className="w-4 h-4 transition-all duration-500"
          style={{
            color: isLight ? '#f59e0b' : '#475569',
            opacity: isLight ? 0.4 : 0.2,
          }}
        />
        <Moon
          className="w-4 h-4 transition-all duration-500"
          style={{
            color: isLight ? '#94a3b8' : '#818cf8',
            opacity: isLight ? 0.2 : 0.4,
          }}
        />
      </div>

      {/* Sliding thumb */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="relative z-10 w-7 h-7 rounded-full flex items-center justify-center"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
          boxShadow: isLight
            ? '0 2px 8px rgba(245,158,11,0.5), 0 0 16px rgba(251,191,36,0.3)'
            : '0 2px 8px rgba(99,102,241,0.5), 0 0 16px rgba(129,140,248,0.3)',
          marginLeft: isLight ? '0px' : 'auto',
        }}
      >
        {isLight ? (
          <Sun className="w-4 h-4 text-white" strokeWidth={2.5} />
        ) : (
          <Moon className="w-4 h-4 text-white" strokeWidth={2.5} />
        )}
      </motion.div>
    </button>
  );
}
