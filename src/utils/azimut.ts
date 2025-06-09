// Tipos de orientación principales (8 direcciones)
type Orientation = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SO' | 'O' | 'NO';

// Interfaz para representar un rango de azimut
interface AzimutRange {
    min: number;
    max: number;
    minInclusive: boolean;
    maxInclusive: boolean;
}

// Función para parsear el rango literal (con soporte para comas decimales)
function parseAzimutRange(rangeString: string): AzimutRange {
    // Remover espacios y reemplazar comas por puntos para decimales
    const cleanRange = rangeString.trim().replace(/\s+/g, ' ').replace(/,/g, '.');

    // Patrones para diferentes formatos de rangos
    const patterns = [
        // Formato: -90° ≤ Az < -67.5°
        /^(-?\d+(?:\.\d+)?)°?\s*≤\s*Az\s*<\s*(-?\d+(?:\.\d+)?)°?$/,
        // Formato: -90 <= Az < -67.5
        /^(-?\d+(?:\.\d+)?)\s*<=?\s*Az\s*<\s*(-?\d+(?:\.\d+)?)$/
    ];

    for (const pattern of patterns) {
        const match = cleanRange.match(pattern);
        if (match) {
            return {
                min: parseFloat(match[1]),
                max: parseFloat(match[2]),
                minInclusive: true,
                maxInclusive: false
            };
        }
    }

    throw new Error(`No se pudo parsear el rango: ${rangeString}`);
}

// Función para obtener la orientación basada en un rango
function getOrientationFromRange(min: number, max: number): Orientation {
    // Normalizar ángulos al rango [0, 360)
    const normalizeAngle = (angle: number): number => {
        let normalized = angle % 360;
        if (normalized < 0) normalized += 360;
        return normalized;
    };

    const normalizedMin = normalizeAngle(min);
    const normalizedMax = normalizeAngle(max);

    // Calcular el punto medio del rango para determinar la orientación
    let midPoint: number;

    if (normalizedMax > normalizedMin) {
        midPoint = (normalizedMin + normalizedMax) / 2;
    } else {
        // Caso donde el rango cruza el 0° (ej: 350° a 10°)
        midPoint = ((normalizedMin + normalizedMax + 360) / 2) % 360;
    }

    // Definir los rangos de orientación (8 direcciones principales de 45° cada una)
    if (midPoint >= 337.5 || midPoint < 22.5) return 'N';   // Norte
    if (midPoint >= 22.5 && midPoint < 67.5) return 'NE';   // Noreste
    if (midPoint >= 67.5 && midPoint < 112.5) return 'E';   // Este
    if (midPoint >= 112.5 && midPoint < 157.5) return 'SE'; // Sureste
    if (midPoint >= 157.5 && midPoint < 202.5) return 'S';  // Sur
    if (midPoint >= 202.5 && midPoint < 247.5) return 'SO'; // Suroeste
    if (midPoint >= 247.5 && midPoint < 292.5) return 'O';  // Oeste
    if (midPoint >= 292.5 && midPoint < 337.5) return 'NO'; // Noroeste

    return 'N'; // Valor por defecto
}

// Función principal que recibe el rango literal
export function azimutRangeToOrientation(rangeString: string): Orientation {
    try {
        const range = parseAzimutRange(rangeString);
        return getOrientationFromRange(range.min, range.max);
    } catch (error) {
        throw new Error(`Error al procesar el rango "${rangeString}": ${error}`);
    }
}

// Función que devuelve el nombre completo de la orientación
function azimutRangeToFullOrientation(rangeString: string): string {
    const orientationMap: Record<Orientation, string> = {
        'N': 'Norte',
        'NE': 'Noreste',
        'E': 'Este',
        'SE': 'Sureste',
        'S': 'Sur',
        'SO': 'Suroeste',
        'O': 'Oeste',
        'NO': 'Noroeste'
    };

    const orientation = azimutRangeToOrientation(rangeString);
    return orientationMap[orientation];
}

// Función para procesar múltiples rangos
function processMultipleRanges(ranges: string[]): Array<{range: string, orientation: Orientation, fullName: string}> {
    return ranges.map(range => ({
        range,
        orientation: azimutRangeToOrientation(range),
        fullName: azimutRangeToFullOrientation(range)
    }));
}

const yourRanges = [
    '0° ≤ Az < 22,5°',
    '22,5° ≤ Az < 45°',
    '45° ≤ Az < 67,5°',
    '67,5° ≤ Az < 90°',
    '90° ≤ Az < 112,5°',
    '112,5° ≤ Az < 135°',
    '135° ≤ Az < 157,5°',
    '157,5° ≤ Az < 180°',
    '-180° ≤ Az < -157,5°',
    '-157,5° ≤ Az < -135°',
    '-135° ≤ Az < -112,5°',
    '-112,5° ≤ Az < -90°',
    '-90° ≤ Az < -67,5°',
    '-67,5° ≤ Az < -45°',
    '-45° ≤ Az < -22,5°',
    '-22,5° ≤ Az < 0°',
    '0° ≤ Az < 22,5°'
];


yourRanges.forEach((range, index) => {
    try {
        const orientation = azimutRangeToOrientation(range);
        const fullName = azimutRangeToFullOrientation(range);
    } catch (error) {
        console.log(`${range} → ERROR: ${error}`);
    }
});

// Función de conveniencia para convertir un array completo
function convertAzimutRangesToOrientations(ranges: string[]): Orientation[] {
    return ranges.map(range => azimutRangeToOrientation(range));
}

// Función de conveniencia para obtener un objeto con todas las conversiones
function getOrientationMapping(ranges: string[]): Record<string, {orientation: Orientation, fullName: string}> {
    const mapping: Record<string, {orientation: Orientation, fullName: string}> = {};

    ranges.forEach(range => {
        const orientation = azimutRangeToOrientation(range);
        const fullName = azimutRangeToFullOrientation(range);
        mapping[range] = { orientation, fullName };
    });

    return mapping;
}