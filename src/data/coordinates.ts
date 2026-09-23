export const MPIO_COORDINATES: Record<string, [number, number]> = {
  // Format: [longitude, latitude] matching Mapbox
  // === Caldas ===
  "Aguadas": [-75.4608, 5.6105],
  "Anserma": [-75.7836, 5.2392],
  "Aranzazu": [-75.4800, 5.2800],
  "Belalcazar": [-75.8117, 4.9961],
  "Chinchiná": [-75.6067, 4.9819],
  "Filadelfia": [-75.5614, 5.2975],
  "La Dorada": [-74.6644, 5.4528],
  "La Merced": [-75.5492, 5.4050],
  "Manizales": [-75.5174, 5.0689],
  "Manzanares": [-75.1583, 5.2492],
  "Marmato": [-75.5978, 5.4744],
  "Marquetalia": [-75.0500, 5.3000],
  "Marulanda": [-75.2597, 5.2833],
  "Neira": [-75.5208, 5.1661],
  "Norcasia": [-74.8889, 5.5767],
  "Pacora": [-75.4686, 5.5147],
  "Palestina": [-75.6167, 5.0167],
  "Pensilvania": [-75.1594, 5.3850],
  "Riosucio": [-75.7825, 5.4217],
  "Risaralda": [-75.7725, 5.1667],
  "Salamina": [-75.4853, 5.4069],
  "Samaná": [-74.9903, 5.4122],
  "San José": [-75.8208, 5.0833],
  "Supia": [-75.6492, 5.4550],
  "Victoria": [-74.9083, 5.3167],
  "Villamaría": [-75.5133, 5.0442],
  "Viterbo": [-75.8739, 5.0639],

  // === Risaralda ===
  "Santa Cecilia": [-76.0142, 5.3408],
  "Mistrató": [-75.8825, 5.3017],
  "La Celia": [-76.0022, 5.0003],
  "Quinchía": [-75.7289, 5.3347],
  "Balboa": [-75.9575, 4.9511],
  "Dosquebradas": [-75.6728, 4.8317],
  "Marsella": [-75.7369, 4.9392],
  "Pueblo Rico": [-76.0469, 5.2344],
  "Belén de Umbria": [-75.8697, 5.1978],
  "Guática": [-75.8011, 5.3150],

  // === Vaupés ===
  "MITÚ": [-70.2344, 1.2589],
};

// Build a normalized lookup map for case-insensitive / trimmed matching
const normalizedLookup = new Map<string, [number, number]>();
for (const [key, value] of Object.entries(MPIO_COORDINATES)) {
  normalizedLookup.set(key.trim().toUpperCase(), value);
}

export function getMpioCoordinates(mpio: string): [number, number] {
  const normalized = mpio.trim().toUpperCase();

  // Exact normalized match
  const exact = normalizedLookup.get(normalized);
  if (exact) return exact;

  // Default to center of Caldas (Manizales) if not found
  console.warn(`[coordinates] Unknown municipality: "${mpio}" — defaulting to Manizales`);
  return [-75.5174, 5.0689];
}

export interface MpioCameraConfig {
  center: [number, number];
  zoom?: number;
  pitch?: number;
  bearing?: number;
}

export const MPIO_CAMERA_CONFIGS: Record<string, MpioCameraConfig> = {
  "Aguadas": {
    center: [-75.45367, 5.60585],
    zoom: 15.08,
    pitch: 60,
    bearing: 23.7,
  },
  "Anserma": {
    center: [-75.7813, 5.23045],
    zoom: 14.89,
    pitch: 59.5,
    bearing: 73.4
  },
  "Aranzazu": {
    center: [-75.48955, 5.26925],
    zoom: 15.62,
    pitch: 60,
    bearing: 33.7
  },
  "Balboa": {
    center: [-75.9589, 4.95508],
    zoom: 15.35,
    pitch: 60,
    bearing: -92.1
  },
  "Belalcazar": {
    center: [-75.80884, 4.99109],
    zoom: 15.32,
    pitch: 44,
    bearing: 27.5
  },
  "Belén de Umbria": {
    center: [-75.8696, 5.20251],
    zoom: 15.87,
    pitch: 60,
    bearing: 154.5
  },
  "Chinchiná": {
    center: [-75.60281, 4.97784],
    zoom: 15.07,
    pitch: 60,
    bearing: 20.8
  },
  "Dosquebradas": {
    center: [-75.67324, 4.82963],
    zoom: 14.46,
    pitch: 60,
    bearing: 83.1
  },
  "Filadelfia": {
    center: [-75.56493, 5.29777],
    zoom: 15.43,
    pitch: 60,
    bearing: -140.9
  },
  "Guática": {
    center: [-75.80036, 5.31555],
    zoom: 15.11,
    pitch: 60,
    bearing: 115.8
  },
  "La Celia": {
    center: [-76.00173, 4.99897],
    zoom: 14.76,
    pitch: 44,
    bearing: 112.1
  },
  "La Dorada": {
    center: [-74.66207, 5.44653],
    zoom: 14.5,
    pitch: 60,
    bearing: 45.6
  },
  "La Merced": {
    center: [-75.54589, 5.39818],
    zoom: 15.99,
    pitch: 50,
    bearing: 16.4
  },
  "Manizales": {
    center: [-75.50881, 5.06027],
    zoom: 14.4,
    pitch: 60,
    bearing: 93.4
  },
  "Manzanares": {
    center: [-75.15344, 5.25123],
    zoom: 14.96,
    pitch: 60,
    bearing: 74.6
  },
  "Marmato": {
    center: [-75.59096, 5.47658],
    zoom: 14.97,
    pitch: 60,
    bearing: -39
  },
  "Marquetalia": {
    center: [-75.05303, 5.29808],
    zoom: 15.58,
    pitch: 49.5,
    bearing: -91
  },
  "Marsella": {
    center: [-75.73989, 4.93566],
    zoom: 15.4,
    pitch: 60,
    bearing: 97.8
  },
  "Mistrató": {
    center: [-75.88237, 5.29201],
    zoom: 15.93,
    pitch: 59,
    bearing: 10.4
  },
  "Mitú": {
    center: [-75.88237, 5.29201],
    zoom: 15.93,
    pitch: 59,
    bearing: 10.4
  },
  "Neira": {
    center: [-75.52142, 5.16812],
    zoom: 15.65,
    pitch: 60,
    bearing: -173.9
  },
  "Norcasia": {
    center: [-74.89048, 5.57649],
    zoom: 15.39,
    pitch: 60,
    bearing: -133.7
  },
  "Pacora": {
    center: [-75.4605, 5.53157],
    zoom: 15.01,
    pitch: 60,
    bearing: -145.9
  },
  "Palestina": {
    center: [-75.62936, 5.01707],
    zoom: 15.32,
    pitch: 60,
    bearing: 145.7
  },
  "Pueblo Rico": {
    center: [-76.0326, 5.22507],
    zoom: 16.01,
    pitch: 60,
    bearing: -165.2
  },
  "Quinchía": {
    center: [-75.73289, 5.34095],
    zoom: 15.42,
    pitch: 60,
    bearing: -178.1
  },
  "Riosucio": {
    center: [-75.69796, 5.42191],
    zoom: 14.9,
    pitch: 60,
    bearing: 0
  },
  "Risaralda": {
    center: [-75.7693, 5.16014],
    zoom: 15.92,
    pitch: 41,
    bearing: 87.8
  },
  "Salamina": {
    center: [-75.48973, 5.39968],
    zoom: 15.18,
    pitch: 60,
    bearing: 136.2
  },
  "Samaná": {
    center: [-74.99264, 5.41083],
    zoom: 16.01,
    pitch: 60,
    bearing: 14.7
  },
  "San José": {
    center: [-75.78956, 5.08123],
    zoom: 15.71,
    pitch: 57,
    bearing: -9.8
  },
  "Santa Cecilia": {
    center: [-76.14629, 5.34005],
    zoom: 15.56,
    pitch: 60,
    bearing: 80.5
  },
  "Supia": {
    center: [-75.64763, 5.44112],
    zoom: 15.23,
    pitch: 60,
    bearing: 55.3
  },
  "Victoria": {
    center: [-74.90988, 5.31479],
    zoom: 15.37,
    pitch: 60,
    bearing: 102.6
  },
  "Viterbo": {
    center: [-75.86579, 5.06293],
    zoom: 15.16,
    pitch: 60,
    bearing: -30.9
  }
};

export function getMpioCameraConfig(mpioName: string): MpioCameraConfig {
  const normalized = mpioName.trim().toUpperCase();
  for (const [key, config] of Object.entries(MPIO_CAMERA_CONFIGS)) {
    if (key.trim().toUpperCase() === normalized) {
      return config;
    }
  }
  const defaultCoords = getMpioCoordinates(mpioName);
  return {
    center: defaultCoords,
    zoom: 14.5,
    pitch: 65,
    bearing: 0,
  };
}

