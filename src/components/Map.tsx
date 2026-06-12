/// <reference types="vite/client" />
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import MapGL, { MapRef, Source, Layer, Marker } from 'react-map-gl/maplibre';
import { useAppStore } from '../store/appStore';
import { Landmark, Hand, PlayCircle } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { SEDES_DATA } from '../data/sedesData';
import { getMpioCoordinates } from '../data/coordinates';
import caldasBoundary from '../data/caldasBoundary.json';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const CALDAS_CENTER: [number, number] = [-75.35, 5.38];
const GLOBAL_ZOOM = 8.5;
const GLOBAL_PITCH = 50;

// WE NEVER CHANGE THIS. WebGL context remains ultra-stable.
const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const ADMIN_PAINT = {
  'line-color': '#ff7b00',
  'line-width': 3,
  'line-opacity': 0.8,
  // Removed dasharray to fix the "destroyed" contour appearance
};

const GLOW_PAINT = {
  'line-color': '#ff7b00',
  'line-width': 10,
  'line-opacity': 0.1,
  'line-blur': 10,
};

export default function AppMap() {
  const {
    activeMunicipality,
    setActiveInstitutionId,
    activeSedeId,
    setActiveSedeId,
    isSidebarOpen,
    setVideoModalOpen,
  } = useAppStore();

  const mapRef = useRef<MapRef>(null);
  const animationRef = useRef<number | null>(null);
  const isRotating = useRef(false);
  const [waterOpacity, setWaterOpacity] = useState(0);

  const isLocal = !!activeMunicipality;

  const satellitePaint = useMemo(() => ({
    'raster-opacity': isLocal ? 1 : 0,
    'raster-opacity-transition': { duration: 1500 }
  }), [isLocal]);

  const initialViewState = useMemo(() => ({
    longitude: CALDAS_CENTER[0],
    latitude: CALDAS_CENTER[1],
    zoom: GLOBAL_ZOOM,
    pitch: GLOBAL_PITCH,
    bearing: 0,
  }), []);

  const mapMaxBounds = useMemo<[[number, number], [number, number]] | undefined>(() => {
    if (!activeMunicipality) return undefined;
    const [lng, lat] = activeMunicipality.coordinates;
    return [
      [lng - 0.15, lat - 0.15],
      [lng + 0.15, lat + 0.15],
    ];
  }, [activeMunicipality]);

  const updateWaterLayers = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    try {
      const waterColor = '#00E5FF';
      const layers = map.getStyle()?.layers;
      if (!layers) return;

      layers.forEach((layer) => {
        if (layer.id.includes('water') && layer.type === 'fill') {
          map.setPaintProperty(layer.id, 'fill-color', waterColor);
          map.setPaintProperty(layer.id, 'fill-opacity', isLocal ? waterOpacity * 0.8 : waterOpacity * 0.5);
        }
        if (layer.id.includes('waterway') && layer.type === 'line') {
          map.setPaintProperty(layer.id, 'line-color', waterColor);
          map.setPaintProperty(layer.id, 'line-opacity', isLocal ? waterOpacity : waterOpacity * 0.8);
          map.setPaintProperty(layer.id, 'line-width', isLocal ? 3 : 1);
        }
      });
    } catch (err) {
      console.warn("Could not override water layers", err);
    }
  }, [isLocal, waterOpacity]);

  const flyToGlobal = useCallback(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    map.flyTo({
      center: CALDAS_CENTER,
      zoom: GLOBAL_ZOOM,
      pitch: GLOBAL_PITCH,
      bearing: 0,
      padding: { left: isSidebarOpen ? 320 : 0, right: 0, top: 0, bottom: 0 },
      duration: 2000,
      essential: true,
    });
  }, [isSidebarOpen]);

  const stopRotation = useCallback(() => {
    isRotating.current = false;
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // ---------- SAFE CAMERA LOGIC ----------
  // Since style never rebuilds, flyTo is 100% safe to execute instantly.
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    stopRotation();

    if (activeMunicipality) {
      map.flyTo({
        center: activeMunicipality.coordinates,
        zoom: 14.5,
        pitch: 65,
        padding: { left: isSidebarOpen ? 320 : 0, right: 0, top: 0, bottom: 0 },
        duration: 3000,
        essential: true,
      });

      map.once('moveend', () => {
        if (!activeMunicipality || isRotating.current) return;
        isRotating.current = true;
        let bearing = map.getBearing();

        const animate = () => {
          if (!isRotating.current) return;
          bearing += 0.1;
          map.setBearing(bearing % 360);
          animationRef.current = requestAnimationFrame(animate);
        };
        animate();
      });
    } else {
      map.setMaxBounds(null);
      flyToGlobal();
    }

    return stopRotation;
  }, [activeMunicipality, stopRotation, flyToGlobal]);

  const prevActiveMunicipalityRef = useRef(activeMunicipality);

  // Sidebar padding
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    // Solo animar el padding si NO estamos cambiando de municipio simultáneamente
    if (prevActiveMunicipalityRef.current === activeMunicipality) {
      map.easeTo({
        padding: { left: isSidebarOpen ? 320 : 0, right: 0, top: 0, bottom: 0 },
        duration: 500,
      });
    }
    prevActiveMunicipalityRef.current = activeMunicipality;
  }, [isSidebarOpen, activeMunicipality]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;
    if (map.isStyleLoaded()) updateWaterLayers();
    map.on('style.load', updateWaterLayers);
    return () => {
      map.off('style.load', updateWaterLayers);
    };
  }, [updateWaterLayers]);

  const activeSede = SEDES_DATA.find(s => s.id === activeSedeId);

  return (
    <div className="absolute inset-0 w-full h-full bg-black">
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={STYLE_DARK} // Never changes!
        onDragStart={stopRotation}
        terrain={{ source: 'terrain-source', exaggeration: 1.5 }}
        maxBounds={mapMaxBounds}
        onClick={(e) => {
          if (isLocal) {
            setActiveInstitutionId(null);
            return;
          }
          setActiveInstitutionId(null);
          if (!e.defaultPrevented && activeSedeId) {
            setActiveSedeId(null);
            flyToGlobal();
          }
        }}
      >
        <Source
          id="terrain-source"
          type="raster-dem"
          tiles={['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png']}
          encoding="terrarium"
          tileSize={256}
          maxzoom={14}
        />

        {/* --- SATELLITE OVERLAY --- */}
        <Source id="satellite-tiles" type="raster" tiles={['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}']} tileSize={256}>
          <Layer id="satellite-layer" type="raster" paint={satellitePaint as any} />
        </Source>

        {!isLocal && (
          <Source id="caldas-boundary-source" type="geojson" data={caldasBoundary as any}>
            <Layer id="admin-1-highlight" type="line" paint={ADMIN_PAINT as any} />
            <Layer id="caldas-glow" type="line" paint={GLOW_PAINT as any} />
          </Source>
        )}

        {!isLocal && SEDES_DATA.map((sede) => {
          const isActive = activeSedeId === sede.id;
          const isFaded = !!activeSedeId && activeSedeId !== sede.id;

          return (
            <SedeMarker
              key={sede.id}
              sede={sede}
              isActive={isActive}
              isFaded={isFaded}
              onToggle={(willBeActive: boolean) => {
                setActiveSedeId(willBeActive ? sede.id : null);
                if (willBeActive && mapRef.current) {
                  mapRef.current.flyTo({
                    center: sede.coordinates,
                    zoom: 9.5,
                    duration: 1500,
                    essential: true,
                  });
                }
                if (!willBeActive) {
                  flyToGlobal();
                }
              }}
            />
          );
        })}

        {!isLocal && activeSede && <SedeDetailPanel sede={activeSede} />}

        {!isLocal && (
          <div className="absolute bottom-8 left-[calc(50%+160px)] -translate-x-1/2 z-[100] flex items-center gap-4">
            <div className="flex flex-col items-center glass px-6 py-3 rounded-full border border-white/10 shadow-2xl">
              <label className="text-[9px] font-mono text-cyan-300 tracking-[0.3em] uppercase mb-2 shadow-black drop-shadow-md flex items-center gap-2">
                Te rodea el agua <Hand className="w-3 h-3 text-cyan-400" />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={waterOpacity}
                onChange={(e) => setWaterOpacity(parseFloat(e.target.value))}
                className="w-48 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
            
            <button 
              onClick={() => setVideoModalOpen(true)}
              className="glass p-4 rounded-full border border-white/10 shadow-2xl text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all active:scale-95 group flex items-center justify-center"
              title="Repositorio de Anécdotas"
            >
              <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        )}
      </MapGL>
    </div>
  );
}

// =============================================
// Sub-components
// =============================================

interface SedeMarkerProps {
  key?: string;
  sede: typeof SEDES_DATA[0];
  isActive: boolean;
  isFaded: boolean;
  onToggle: (willBeActive: boolean) => void;
}

function SedeMarker({ sede, isActive, isFaded, onToggle }: SedeMarkerProps) {
  return (
    <>
      <Marker
        longitude={sede.coordinates[0]}
        latitude={sede.coordinates[1]}
        anchor="center"
        style={{ zIndex: isActive ? 50 : 10 }}
      >
        <div
          className={`relative group cursor-pointer flex flex-col items-center transition-all duration-500 ease-out ${
            isFaded ? 'opacity-30 scale-90' : 'opacity-100 scale-100'
          } ${isActive ? 'scale-110' : 'hover:scale-105'}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle(!isActive);
          }}
        >
          {/* Neon pulse ring for active sede */}
          {isActive && (
            <div
              className="absolute bg-cyan-400 rounded-full animate-ping opacity-50"
              style={{
                width: '40px',
                height: '40px',
                top: '50%',
                left: '50%',
                marginLeft: '-20px',
                marginTop: '-20px',
              }}
            />
          )}

          <div
            className={`p-2 rounded-full border backdrop-blur-md transition-all ${
              isActive
                ? 'bg-cyan-500/40 border-cyan-300 shadow-[0_0_30px_rgba(0,229,255,0.8)]'
                : 'bg-cyan-500/20 border-cyan-400/50 shadow-[0_0_15px_rgba(0,229,255,0.4)]'
            }`}
          >
            <Landmark className={`w-6 h-6 ${isActive ? 'text-white' : 'text-cyan-300'}`} />
          </div>

          {!isActive && (
            <div className="mt-2 px-2 py-1 glass rounded text-[9px] font-mono text-cyan-300 shadow-md">
              {sede.name}
            </div>
          )}
        </div>
      </Marker>

      {/* Impact zone markers */}
      {isActive &&
        sede.impacted.map((mpioName, i) => {
          const coords = getMpioCoordinates(mpioName);
          if (!coords) return null;
          return (
            <Marker
              key={`${sede.id}-${mpioName}`}
              longitude={coords[0]}
              latitude={coords[1]}
              anchor="center"
              style={{ zIndex: 10 }}
            >
              <div
                className="relative flex flex-col items-center animate-in fade-in zoom-in duration-500"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-500/20 rounded-full blur-[40px] pointer-events-none" />
                <div className="w-4 h-4 bg-orange-400 rounded-full shadow-[0_0_25px_8px_rgba(255,123,0,0.8)] animate-pulse border border-white" />
                <div className="mt-2 px-2 py-1 bg-black/80 backdrop-blur-md border border-orange-500/50 rounded-md text-[11px] font-bold tracking-widest uppercase text-white shadow-xl relative z-10 transition-transform hover:scale-110">
                  {mpioName}
                </div>
              </div>
            </Marker>
          );
        })}
    </>
  );
}

interface SedeDetailPanelProps {
  sede: typeof SEDES_DATA[0];
}

function SedeDetailPanel({ sede }: SedeDetailPanelProps) {
  return (
    <div className="absolute top-8 right-8 z-[100] w-[400px] pointer-events-none">
      <div className="glass neon-border border-2 p-8 rounded-2xl animate-in slide-in-from-right-4 fade-in duration-500 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-400 border border-cyan-500/50 text-[10px] font-mono tracking-[0.2em] uppercase rounded-full mb-4">
            Detalles de Sede
          </div>

          <h3 className="font-serif text-4xl text-white mb-2 shadow-black drop-shadow-md">
            {sede.name}
          </h3>

          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <h4 className="font-mono text-sm text-cyan-100 tracking-widest uppercase">
              {sede.subregion}
            </h4>
          </div>

          <div className="space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl p-5">
              <p className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Zonas Impactadas
              </p>
              <div className="flex flex-wrap gap-2">
                {sede.impacted.map(z => (
                  <span key={z} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-gray-200">
                    {z}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 rounded-xl p-5 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] text-cyan-300 uppercase tracking-widest mb-1">Impacto Total</p>
                <p className="font-sans text-xs text-gray-400">Estudiantes beneficiados</p>
              </div>
              <p className="font-serif text-5xl text-white drop-shadow-lg">{sede.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
