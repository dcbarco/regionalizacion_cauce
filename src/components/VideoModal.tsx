import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store/appStore';
import { X, Play } from 'lucide-react';
import { cn } from '../lib/utils';

const VIDEOS = [
  { id: 1, title: 'Maria Andrea Pescador', src: '/1. Maria Andrea Pescador.mp4' },
  { id: 2, title: 'Magda Suly Guapacha', src: '/2. Magda Suly Guapacha.mp4' },
  { id: 3, title: 'Vivian Jaramillo Davila', src: '/3. Vivian Jaramillo Davila.mp4' },
  { id: 4, title: 'Rubert Alexis Suarez', src: '/4. Rubert Alexis Suarez.mp4' },
  { id: 5, title: 'Alex Yepes Rios', src: '/5. Alex Yepes Rios.mp4' },
  { id: 6, title: 'Maria José Alvarez', src: '/6. Maria José Alvarez.mp4' },
];

export default function VideoModal() {
  const { isVideoModalOpen, setVideoModalOpen, theme } = useAppStore();
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);
  const isLight = theme === 'light';

  return (
    <AnimatePresence>
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 backdrop-blur-md"
          style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.8)' }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-[80vh] glass rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            style={{ border: `1px solid ${isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)'}` }}
          >
            <button
              onClick={() => {
                setVideoModalOpen(false);
                // Reset video on close if needed
                setActiveVideo(VIDEOS[0]);
              }}
              className="absolute top-4 right-4 z-20 glass p-3 rounded-full transition-colors active:scale-95"
              style={{ color: isLight ? '#1a1a2e' : '#fff' }}
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="flex-1 relative h-full" style={{ backgroundColor: isLight ? '#0f172a' : 'rgba(0,0,0,0.9)' }}>
              <video
                key={activeVideo.id}
                src={activeVideo.src}
                controls
                autoPlay
                className="w-full h-full object-contain outline-none"
              />
            </div>

            {/* Playlist Sidebar */}
            <div
              className="w-full md:w-[350px] flex flex-col h-full"
              style={{
                backgroundColor: isLight ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.4)',
                borderLeft: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}`,
              }}
            >
              <div className="p-6 shrink-0" style={{ borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}` }}>
                <h3 className="font-serif text-3xl" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>Repositorio</h3>
                <p className="font-mono text-xs mt-1 uppercase tracking-widest" style={{ color: isLight ? '#ea580c' : '#22d3ee' }}>
                  Anécdotas CAUCE
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 touch-pan-y">
                {VIDEOS.map((video) => {
                  const isActive = activeVideo.id === video.id;
                  return (
                    <button
                      key={video.id}
                      onClick={() => setActiveVideo(video)}
                      className={cn(
                        "w-full text-left p-4 rounded-xl flex items-center gap-4 transition-all duration-300 group",
                        isActive
                          ? "glass shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "border border-transparent"
                      )}
                      style={{
                        backgroundColor: isActive
                          ? (isLight ? 'rgba(234,88,12,0.08)' : 'rgba(34,211,238,0.2)')
                          : undefined,
                        borderColor: isActive
                          ? (isLight ? 'rgba(234,88,12,0.3)' : 'rgba(34,211,238,0.5)')
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
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors"
                      )}
                        style={{
                          backgroundColor: isActive
                            ? (isLight ? '#ea580c' : '#22d3ee')
                            : (isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'),
                          color: isActive
                            ? (isLight ? '#fff' : '#000')
                            : (isLight ? '#1a1a2e' : '#fff'),
                        }}
                      >
                        <Play className={cn("w-4 h-4 ml-1", isActive ? "fill-current" : "fill-transparent")} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p
                          className="font-serif text-lg truncate transition-colors"
                          style={{ color: isActive ? (isLight ? '#ea580c' : '#67e8f9') : (isLight ? '#1a1a2e' : '#fff') }}
                        >
                          {video.title}
                        </p>
                        <p className="font-mono text-[10px] uppercase tracking-widest mt-1" style={{ color: isLight ? '#8888aa' : '#6b7280' }}>
                          Testimonio #{video.id}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
