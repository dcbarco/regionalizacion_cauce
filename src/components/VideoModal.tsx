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
  { id: 6, title: 'Maria José Alvarez', src: '/6. Maria José Alvarez.mp4' },
];

export default function VideoModal() {
  const { isVideoModalOpen, setVideoModalOpen } = useAppStore();
  const [activeVideo, setActiveVideo] = useState(VIDEOS[0]);

  return (
    <AnimatePresence>
      {isVideoModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-12 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-6xl h-[80vh] glass rounded-3xl border border-white/20 shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            <button
              onClick={() => {
                setVideoModalOpen(false);
                // Reset video on close if needed
                setActiveVideo(VIDEOS[0]);
              }}
              className="absolute top-4 right-4 z-20 glass hover:bg-white/10 p-3 rounded-full text-white transition-colors active:scale-95"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video Player */}
            <div className="flex-1 bg-black/90 relative h-full">
              <video
                key={activeVideo.id}
                src={activeVideo.src}
                controls
                autoPlay
                className="w-full h-full object-contain outline-none"
              />
            </div>

            {/* Playlist Sidebar */}
            <div className="w-full md:w-[350px] bg-black/40 border-l border-white/10 flex flex-col h-full">
              <div className="p-6 border-b border-white/10 shrink-0">
                <h3 className="font-serif text-3xl text-white">Repositorio</h3>
                <p className="font-mono text-xs text-cyan-400 mt-1 uppercase tracking-widest">
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
                          ? "glass bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                          : "hover:bg-white/5 border border-transparent"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isActive ? "bg-cyan-500 text-black" : "bg-white/10 text-white group-hover:bg-white/20"
                      )}>
                        <Play className={cn("w-4 h-4 ml-1", isActive ? "fill-black" : "fill-transparent")} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={cn(
                          "font-serif text-lg truncate transition-colors",
                          isActive ? "text-cyan-300" : "text-white"
                        )}>
                          {video.title}
                        </p>
                        <p className="font-mono text-[10px] text-gray-500 uppercase tracking-widest mt-1">
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
