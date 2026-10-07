// WMO weather interpretation codes, as returned by Open-Meteo in `weather_code`.

const DESCRIPTIONS: Record<number, string> = {
  0: "despejado",
  1: "poco nuboso",
  2: "intervalos nubosos",
  3: "cubierto",
  45: "niebla",
  48: "niebla con escarcha",
  51: "llovizna débil",
  53: "llovizna",
  55: "llovizna intensa",
  56: "llovizna helada",
  57: "llovizna helada intensa",
  61: "lluvia débil",
  63: "lluvia",
  65: "lluvia fuerte",
  66: "lluvia helada",
  67: "lluvia helada fuerte",
  71: "nevada débil",
  73: "nevada",
  75: "nevada fuerte",
  77: "granos de nieve",
  80: "chubascos débiles",
  81: "chubascos",
  82: "chubascos fuertes",
  85: "chubascos de nieve",
  86: "chubascos de nieve fuertes",
  95: "tormenta",
  96: "tormenta con granizo",
  99: "tormenta con granizo fuerte",
};

export function isThunderstorm(code: number): boolean {
  return code >= 95;
}

export function isSnow(code: number): boolean {
  return (code >= 71 && code <= 77) || code === 85 || code === 86;
}

export function describeWeather(code: number): string {
  return DESCRIPTIONS[code] ?? `código ${code}`;
}

export function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code === 1) return "🌤️";
  if (code === 2) return "⛅";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 57) return "🌦️";
  if (code >= 61 && code <= 67) return "🌧️";
  if (code === 85 || code === 86) return "🌨️";
  if (isSnow(code)) return "❄️";
  if (code >= 80 && code <= 82) return "🌧️";
  if (isThunderstorm(code)) return "⛈️";
  return "❔";
}

// Codes grow roughly with severity, so the highest one is the worst condition in the set.
export function worstWeatherCode(codes: number[]): number | undefined {
  return codes.length > 0 ? Math.max(...codes) : undefined;
}
