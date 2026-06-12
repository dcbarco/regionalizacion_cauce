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
