import Papa from 'papaparse';
import { rawCsvData } from '../data/csvRaw';
import { getMpioCoordinates } from '../data/coordinates';

export interface Institution {
  id: string;
  name: string;
  programa: string;
  estrategia: string;
  total: number;
  mpio: string;
  zona: string;
  coordinates: [number, number];
}

export interface Municipality {
  name: string;
  zona: string;
  totalStudents: number;
  institutions: Institution[];
  coordinates: [number, number];
}

export interface RegionData {
  municipalities: Municipality[];
  zonas: Record<string, {
    totalStudents: number;
    mpios: string[];
    coordinates: [number, number];
  }>;
}

/**
 * Deterministic jitter for institution markers so they don't overlap.
 * Uses golden-angle distribution for even spread.
 */
function getJitteredCoords(base: [number, number], index: number): [number, number] {
  const angle = index * 137.5 * (Math.PI / 180);
  const distance = 0.003 + (index * 0.0002);
  return [
    base[0] + Math.cos(angle) * distance,
    base[1] + Math.sin(angle) * distance,
  ];
}

export function parseData(): RegionData {
  const parsed = Papa.parse(rawCsvData.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  const mpiosMap: Record<string, Municipality> = {};
  const zonasMap: Record<string, Set<string>> = {};
  const ioMapCount: Record<string, number> = {};

  parsed.data.forEach((row: any) => {
    const mpio = row['MPIO']?.trim();
    // CSV header has trailing space: "I.E. "
    const ieName = (row['I.E. '] ?? row['I.E.'])?.trim();
    const total = parseInt(row['TOTAL'], 10);
    const zona = row['ZONA']?.trim();
    const estrategia = row['ESTRATEGIA']?.trim();
    const programa = row['PROGRAMA']?.trim();

    // Skip rows without municipality, institution name, or with zero/NaN total
    if (!mpio || !ieName || isNaN(total) || total === 0) return;

    if (!mpiosMap[mpio]) {
      mpiosMap[mpio] = {
        name: mpio,
        zona: zona || 'DESCONOCIDA',
        totalStudents: 0,
        institutions: [],
        coordinates: getMpioCoordinates(mpio),
      };
    }

    if (zona) {
      if (!zonasMap[zona]) zonasMap[zona] = new Set();
      zonasMap[zona].add(mpio);
    }

    mpiosMap[mpio].totalStudents += total;

    // Track count per mpio for deterministic jitter
    if (!ioMapCount[mpio]) ioMapCount[mpio] = 0;
    ioMapCount[mpio] += 1;

    const baseCoords = getMpioCoordinates(mpio);
    const coords = getJitteredCoords(baseCoords, ioMapCount[mpio]);

    mpiosMap[mpio].institutions.push({
      id: `${mpio}-${ieName}-${ioMapCount[mpio]}`,
      name: ieName,
      estrategia: estrategia || '',
      programa: programa || '',
      total,
      mpio,
      zona: zona || '',
      coordinates: coords,
    });
  });

  const municipalities = Object.values(mpiosMap).sort((a, b) =>
    a.name.localeCompare(b.name, 'es')
  );

  // Compute approximate zone centers from their municipalities
  const zonasParsed: Record<string, {
    totalStudents: number;
    mpios: string[];
    coordinates: [number, number];
  }> = {};

  for (const [zona, mpiosSet] of Object.entries(zonasMap)) {
    const mpiosList = Array.from(mpiosSet);
    let totalScore = 0;
    let sumLng = 0;
    let sumLat = 0;

    mpiosList.forEach(m => {
      const mpioData = mpiosMap[m];
      if (mpioData) {
        totalScore += mpioData.totalStudents;
        sumLng += mpioData.coordinates[0];
        sumLat += mpioData.coordinates[1];
      }
    });

    zonasParsed[zona] = {
      totalStudents: totalScore,
      mpios: mpiosList,
      coordinates: mpiosList.length > 0
        ? [sumLng / mpiosList.length, sumLat / mpiosList.length]
        : [-75.5, 5.0],
    };
  }

  return {
    municipalities,
    zonas: zonasParsed,
  };
}
