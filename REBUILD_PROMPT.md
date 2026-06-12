# PROMPT MAESTRO: Reconstrucción de Circuito Cauce - Regionalización U. de Caldas

**Contexto General:**
Eres un asistente experto en desarrollo web avanzado (React 19, Vite, Tailwind CSS, Mapbox GL, Zustand). Tu objetivo es reconstruir desde cero la aplicación interactiva "Circuito Cauce - Regionalización", un mapa 3D interactivo e inmersivo para la Universidad de Caldas. La app muestra las 6 Sedes regionales y los 36 municipios impactados, usando animaciones fluidas, diseño brutalista/neón oscuro, y transiciones de cámara 3D.

---

## 1. Pila Tecnológica y Dependencias
- **Framework**: React 19 (con Vite).
- **Estilos**: Tailwind CSS.
- **Estado**: Zustand.
- **Mapa**: `mapbox-gl` (v3+) y `react-map-gl` (v8+).
- **Iconos**: `lucide-react`.
- **Fuentes (NUEVO)**: 
  - Primaria (Títulos, logos, encabezados): **Space Grotesk**
  - Secundaria (Cuerpo, UI, detalles): **Plus Jakarta Sans**

---

## 2. Paso a Paso para el Ensamblaje Inicial (Instrucciones para el Humano/Asistente)
Sigue este orden estricto para inicializar el proyecto:

1. **Crear el Proyecto**: `npm create vite@latest regionalizacion-app -- --template react-ts`
2. **Instalar Dependencias**: 
   `npm install mapbox-gl react-map-gl zustand lucide-react`
   `npm install -D tailwindcss postcss autoprefixer`
   `npx tailwindcss init -p`
3. **Migrar Activos Estáticos (ACCIÓN MANUAL DEL USUARIO)**: 
   - Copiar la carpeta `public/` completa del proyecto antiguo al nuevo (contiene imágenes, videos, logos).
   - Copiar la carpeta `src/data/` completa (contiene `sedesData.ts`, `coordinates.ts`, `caldasBoundary.json`).
4. **Configurar Tailwind y Fuentes**: 
   Añadir en el `index.html` los enlaces de Google Fonts para *Space Grotesk* y *Plus Jakarta Sans*. En `tailwind.config.js`, extender el tema para incluir `fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], serif: ['"Space Grotesk"', 'sans-serif'], mono: ['monospace'] }`.
5. **Variables de Entorno**: Crear un archivo `.env` con `VITE_MAPBOX_TOKEN=tu_token_aqui`.

---

## 3. Arquitectura del Estado (Zustand)
Archivo: `src/store/appStore.ts`
El estado global debe manejar:
- `activeMunicipality`: Objeto con datos del municipio seleccionado (id, nombre, coordenadas, subregión) o null.
- `activeSedeId`: String con el ID de la sede universitaria activa o null.
- `isSidebarOpen`: Booleano para el menú lateral.
- `videoModalOpen`: Booleano para el modal del repositorio de anécdotas.

---

## 4. Arquitectura de Componentes

### A. Layout Principal (`App.tsx`)
Debe ocupar toda la pantalla (`h-screen w-screen overflow-hidden bg-black`). Renderiza el `Sidebar` a la izquierda, el `Map` ocupando el fondo, y el `VideoModal` sobre todo.

### B. Menú Lateral (`Sidebar.tsx`)
- Panel izquierdo oscuro con borde/glow cyan.
- Muestra el logo de CAUCE y el título "REGIONALIZACIÓN U. CALDAS" (Usar *Space Grotesk*).
- Lista los 36 municipios agrupados, usando tipografía *Plus Jakarta Sans* para los detalles.
- Al hacer clic en un municipio, actualiza `activeMunicipality` en Zustand.

### C. El Mapa Interactivo (`Map.tsx`) - **CRÍTICO**
Este es el núcleo de la aplicación. Para evitar bugs de WebGL, parpadeos y corrupción gráfica con Mapbox v3, **DEBE** seguir estas reglas estrictas:
1. **Estilo Base Fijo**: El `<MapGL>` debe usar SIEMPRE `mapStyle="mapbox://styles/mapbox/dark-v11"`. **NUNCA** cambiar la prop `mapStyle` dinámicamente.
2. **Terreno 3D Permanente**: Mantener `terrain={{ source: 'mapbox-dem', exaggeration: 1.5 }}` siempre activo. No apagarlo ni prenderlo.
3. **Memoización de Estilos (Anti-Flickering)**: Todos los objetos de estilo (`paint`) de los `<Layer>` deben estar definidos fuera del componente o usando `useMemo`. Si pasas objetos en línea (`paint={{ 'line-color': 'red' }}`), el mapa parpadeará horriblemente en cada render de React.
4. **Capa Satelital Simulada**: Para la vista local, no cambies el `mapStyle`. En su lugar, usa un `<Source id="satellite" type="raster" ...>` y un `<Layer type="raster" paint={{ 'raster-opacity': isLocal ? 1 : 0, 'raster-opacity-transition': { duration: 1500 } }} />`. Esto hace un fundido suave de texturas reales sin romper la memoria gráfica.
5. **Fronteras Sólidas**: El `caldasBoundary.json` se dibuja con una línea glow naranja. **No usar `line-dasharray`**, ya que el terreno 3D fragmenta y destruye visualmente las líneas punteadas. Usar líneas continuas.
6. **Vuelo de Cámara (`flyTo`) Seguro**: Cuando se selecciona un municipio o sede, hacer un `map.flyTo()`. Pero para evitar tirones, usa `map.once('moveend')` antes de empezar la rotación infinita de la cámara.

### D. Marcadores y Paneles de Sedes
- Se renderizan usando `<Marker>` de `react-map-gl`.
- Las Sedes muestran iconos de `lucide-react`. Cuando se activa una sede, emite un "pulso de neón" (`animate-ping`) e irradia las zonas de impacto (municipios) dibujando marcadores adicionales con explosiones de color naranja.
- Mostrar un panel informativo elegante a la derecha con los datos de impacto cuando hay una sede activa. Usar *Space Grotesk* para números/títulos.

### E. Repositorio de Anécdotas (`VideoModal.tsx`)
- Un modal brutalista/glassmorphism que oscurece el mapa.
- Contiene un reproductor de video y una lista de videos adicionales integrados desde la carpeta `public/`.

---

## 5. Diseño y Estética UI
- **Glassmorphism Oscuro**: Fondos translúcidos (`bg-black/40 backdrop-blur-md`).
- **Neón y Glow**: Bordes vibrantes (`border-cyan-500/50`) y sombras fuertes (`shadow-[0_0_15px_cyan]`).
- **Tipografía Moderna**: Fuerte contraste de tamaños entre los nombres de sede (Space Grotesk, grande) y metadatos (Plus Jakarta Sans, tracking amplio, uppercase).
- **Feedback Visual**: Todo elemento clickeable debe tener `hover:scale-105 transition-all` o similar.

> **Instrucción Final para el Asistente**: Cuando leas este prompt, comienza creando la estructura base del estado, luego el layout principal, y finalmente concéntrate en implementar `Map.tsx` respetando estrictamente las reglas de anti-flickering y la técnica de "Capa Satelital Simulada" para evitar la corrupción de WebGL.
