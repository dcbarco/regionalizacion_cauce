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
const GLOBAL_ZOOM = 8.7;
const GLOBAL_PITCH = 50;

const STYLE_DARK = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const STYLE_LIGHT = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

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
    theme,
  } = useAppStore();

  const mapRef = useRef<MapRef>(null);
  const animationRef = useRef<number | null>(null);
  const isRotating = useRef(false);
  const [waterOpacity, setWaterOpacity] = useState(0);

  const isLocal = !!activeMunicipality;
  const isLight = theme === 'light';

  const satellitePaint = useMemo(() => ({
    'raster-opacity': isLocal ? 1 : 0,
    'raster-opacity-transition': { duration: 1500 }
  }), [isLocal]);

  const mapStyle = isLight ? STYLE_LIGHT : STYLE_DARK;

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
      const waterColor = isLight ? '#38bdf8' : '#00E5FF';
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
  }, [isLocal, waterOpacity, isLight]);

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
    <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: isLight ? '#e8eef5' : '#000' }}>
      <MapGL
        ref={mapRef}
        initialViewState={initialViewState}
        mapStyle={mapStyle}
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
              isLight={isLight}
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

        {!isLocal && activeSede && <SedeDetailPanel sede={activeSede} isLight={isLight} />}

        {!isLocal && (
          <div className="absolute bottom-8 left-[calc(50%+160px)] -translate-x-1/2 z-[100] flex items-center gap-4">
            <div className="flex flex-col items-center glass px-6 py-3 rounded-full shadow-2xl">
              <label
                className="text-[9px] font-mono tracking-[0.3em] uppercase mb-2 drop-shadow-md flex items-center gap-2"
                style={{ color: isLight ? '#ea580c' : '#67e8f9' }}
              >
                Te rodea el agua <Hand className="w-3 h-3" style={{ color: isLight ? '#ea580c' : '#22d3ee' }} />
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={waterOpacity}
                onChange={(e) => setWaterOpacity(parseFloat(e.target.value))}
                className={`w-48 h-1 rounded-lg appearance-none cursor-pointer ${isLight ? 'accent-orange-600' : 'accent-cyan-400'}`}
                style={{ background: isLight ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.2)' }}
              />
            </div>
            
            <button 
              onClick={() => setVideoModalOpen(true)}
              className="glass p-4 rounded-full shadow-2xl transition-all active:scale-95 group flex items-center justify-center"
              style={{
                color: isLight ? '#ea580c' : '#22d3ee',
              }}
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
  isLight: boolean;
  onToggle: (willBeActive: boolean) => void;
}

function SedeMarker({ sede, isActive, isFaded, isLight, onToggle }: SedeMarkerProps) {
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
              className="absolute rounded-full animate-ping opacity-50"
              style={{
                backgroundColor: isLight ? '#ea580c' : '#22d3ee',
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
            className="p-2 rounded-full border backdrop-blur-md transition-all"
            style={{
              backgroundColor: isActive
                ? (isLight ? 'rgba(234,88,12,0.3)' : 'rgba(34,211,238,0.4)')
                : (isLight ? 'rgba(234,88,12,0.15)' : 'rgba(34,211,238,0.2)'),
              borderColor: isActive
                ? (isLight ? '#ea580c' : '#67e8f9')
                : (isLight ? 'rgba(234,88,12,0.4)' : 'rgba(34,211,238,0.5)'),
              boxShadow: isActive
                ? (isLight ? '0 0 20px rgba(234,88,12,0.5)' : '0 0 30px rgba(0,229,255,0.8)')
                : (isLight ? '0 0 10px rgba(234,88,12,0.3)' : '0 0 15px rgba(0,229,255,0.4)'),
            }}
          >
            <Landmark className="w-6 h-6" style={{ color: isActive ? (isLight ? '#c2410c' : '#fff') : (isLight ? '#ea580c' : '#67e8f9') }} />
          </div>

          {!isActive && (
            <div
              className="mt-2 px-2 py-1 glass rounded text-[9px] font-mono shadow-md"
              style={{ color: isLight ? '#ea580c' : '#67e8f9' }}
            >
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
                <div
                  className="w-4 h-4 rounded-full animate-pulse border"
                  style={{
                    backgroundColor: '#fb923c',
                    borderColor: isLight ? '#ea580c' : '#fff',
                    boxShadow: '0 0 25px 8px rgba(255,123,0,0.8)',
                  }}
                />
                <div
                  className="mt-2 px-2 py-1 backdrop-blur-md border rounded-md text-[11px] font-bold tracking-widest uppercase shadow-xl relative z-10 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)',
                    borderColor: isLight ? 'rgba(234,88,12,0.4)' : 'rgba(255,123,0,0.5)',
                    color: isLight ? '#1a1a2e' : '#fff',
                  }}
                >
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
  isLight: boolean;
}

function SedeDetailPanel({ sede, isLight }: SedeDetailPanelProps) {
  return (
    <div className="absolute top-8 right-8 z-[100] w-[400px] pointer-events-none">
      <div className="glass neon-border border-2 p-8 rounded-2xl animate-in slide-in-from-right-4 fade-in duration-500 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full" style={{ background: isLight ? 'rgba(234,88,12,0.1)' : 'rgba(34,211,238,0.2)' }} />
        <div className="absolute bottom-0 left-0 w-32 h-32 blur-3xl rounded-full" style={{ background: isLight ? 'rgba(139,92,246,0.1)' : 'rgba(168,85,247,0.2)' }} />

        <div className="relative z-10">
          <div
            className="inline-block px-3 py-1 text-[10px] font-mono tracking-[0.2em] uppercase rounded-full mb-4"
            style={{
              backgroundColor: isLight ? 'rgba(234,88,12,0.1)' : 'rgba(0,229,255,0.2)',
              color: isLight ? '#ea580c' : '#22d3ee',
              border: `1px solid ${isLight ? 'rgba(234,88,12,0.3)' : 'rgba(0,229,255,0.5)'}`,
            }}
          >
            Detalles de Sede
          </div>

          <h3 className="font-serif text-4xl mb-2 drop-shadow-md" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>
            {sede.name}
          </h3>

          <div className="flex items-center gap-2 mb-8">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: isLight ? '#ea580c' : '#22d3ee' }} />
            <h4 className="font-mono text-sm tracking-widest uppercase" style={{ color: isLight ? '#c2410c' : '#cffafe' }}>
              {sede.subregion}
            </h4>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl p-5" style={{ backgroundColor: isLight ? 'rgba(0,0,0,0.03)' : 'rgba(0,0,0,0.4)', border: `1px solid ${isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'}` }}>
              <p className="font-mono text-[10px] uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: isLight ? '#ea580c' : '#22d3ee' }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Zonas Impactadas
              </p>
              <div className="flex flex-wrap gap-2">
                {sede.impacted.map(z => (
                  <span
                    key={z}
                    className="px-2 py-1 rounded text-xs font-mono"
                    style={{
                      backgroundColor: isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'}`,
                      color: isLight ? '#374151' : '#e5e7eb',
                    }}
                  >
                    {z}
                  </span>
                ))}
              </div>
            </div>

            <div
              className="rounded-xl p-5 flex items-center justify-between"
              style={{
                background: isLight
                  ? 'linear-gradient(135deg, rgba(234,88,12,0.1) 0%, rgba(139,92,246,0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(34,211,238,0.2) 0%, rgba(168,85,247,0.2) 100%)',
                border: `1px solid ${isLight ? 'rgba(234,88,12,0.2)' : 'rgba(0,229,255,0.3)'}`,
              }}
            >
              <div>
                <p className="font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: isLight ? '#ea580c' : '#67e8f9' }}>Impacto Total</p>
                <p className="font-sans text-xs" style={{ color: isLight ? '#6b7280' : '#9ca3af' }}>Estudiantes beneficiados</p>
              </div>
              <p className="font-serif text-5xl drop-shadow-lg" style={{ color: isLight ? '#1a1a2e' : '#fff' }}>{sede.impact}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
