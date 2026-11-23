export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';
export const CONTINENTS: Continent[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

export interface Country {
  name: string;
  capital: string;
  continent: Continent;
  lat: number; // capital, approximate
  lon: number;
  aliases?: string[];
  capitalAliases?: string[];
  note?: string;
}

const c = (name: string, capital: string, continent: Continent, lat: number, lon: number, extra: Partial<Country> = {}): Country => ({ name, capital, continent, lat, lon, ...extra });

/** A curated set of countries with well-established capitals. Coordinates are approximate (to ~0.1°). */
export const COUNTRIES: Country[] = [
  c('United Kingdom', 'London', 'Europe', 51.5, -0.1, { aliases: ['UK', 'Britain', 'Great Britain'] }),
  c('France', 'Paris', 'Europe', 48.9, 2.4),
  c('Germany', 'Berlin', 'Europe', 52.5, 13.4),
  c('Spain', 'Madrid', 'Europe', 40.4, -3.7),
  c('Italy', 'Rome', 'Europe', 41.9, 12.5),
  c('Portugal', 'Lisbon', 'Europe', 38.7, -9.1),
  c('Netherlands', 'Amsterdam', 'Europe', 52.4, 4.9, { note: 'Amsterdam is the constitutional capital; the government sits in The Hague.' }),
  c('Belgium', 'Brussels', 'Europe', 50.8, 4.4),
  c('Ireland', 'Dublin', 'Europe', 53.3, -6.3),
  c('Poland', 'Warsaw', 'Europe', 52.2, 21.0),
  c('Sweden', 'Stockholm', 'Europe', 59.3, 18.1),
  c('Norway', 'Oslo', 'Europe', 59.9, 10.8),
  c('Finland', 'Helsinki', 'Europe', 60.2, 24.9),
  c('Denmark', 'Copenhagen', 'Europe', 55.7, 12.6),
  c('Greece', 'Athens', 'Europe', 38.0, 23.7),
  c('Austria', 'Vienna', 'Europe', 48.2, 16.4),
  c('Switzerland', 'Bern', 'Europe', 46.9, 7.4, { capitalAliases: ['Berne'] }),
  c('Czechia', 'Prague', 'Europe', 50.1, 14.4, { aliases: ['Czech Republic'] }),
  c('Hungary', 'Budapest', 'Europe', 47.5, 19.0),
  c('Iceland', 'Reykjavík', 'Europe', 64.1, -21.9),
  c('Japan', 'Tokyo', 'Asia', 35.7, 139.7),
  c('China', 'Beijing', 'Asia', 39.9, 116.4),
  c('India', 'New Delhi', 'Asia', 28.6, 77.2),
  c('South Korea', 'Seoul', 'Asia', 37.6, 127.0, { aliases: ['Republic of Korea', 'Korea'] }),
  c('Thailand', 'Bangkok', 'Asia', 13.8, 100.5),
  c('Vietnam', 'Hanoi', 'Asia', 21.0, 105.8, { aliases: ['Viet Nam'] }),
  c('Indonesia', 'Jakarta', 'Asia', -6.2, 106.8),
  c('Philippines', 'Manila', 'Asia', 14.6, 121.0),
  c('Pakistan', 'Islamabad', 'Asia', 33.7, 73.0),
  c('Bangladesh', 'Dhaka', 'Asia', 23.8, 90.4),
  c('Nepal', 'Kathmandu', 'Asia', 27.7, 85.3),
  c('Turkey', 'Ankara', 'Asia', 39.9, 32.9, { aliases: ['Türkiye'], note: 'Most of Turkey is in Asia; a small part, including much of Istanbul, is in Europe.' }),
  c('Saudi Arabia', 'Riyadh', 'Asia', 24.7, 46.7),
  c('Iran', 'Tehran', 'Asia', 35.7, 51.4),
  c('Malaysia', 'Kuala Lumpur', 'Asia', 3.1, 101.7),
  c('Singapore', 'Singapore', 'Asia', 1.3, 103.8),
  c('Mongolia', 'Ulaanbaatar', 'Asia', 47.9, 106.9, { capitalAliases: ['Ulan Bator'] }),
  c('Egypt', 'Cairo', 'Africa', 30.0, 31.2),
  c('Nigeria', 'Abuja', 'Africa', 9.1, 7.5),
  c('Kenya', 'Nairobi', 'Africa', -1.3, 36.8),
  c('Ethiopia', 'Addis Ababa', 'Africa', 9.0, 38.7),
  c('South Africa', 'Pretoria', 'Africa', -25.7, 28.2, { note: 'South Africa has three capitals: Pretoria (executive), Cape Town (legislative) and Bloemfontein (judicial).', capitalAliases: ['Cape Town', 'Bloemfontein'] }),
  c('Morocco', 'Rabat', 'Africa', 34.0, -6.8),
  c('Ghana', 'Accra', 'Africa', 5.6, -0.2),
  c('Senegal', 'Dakar', 'Africa', 14.7, -17.4),
  c('Tanzania', 'Dodoma', 'Africa', -6.2, 35.7, { note: 'Dodoma is the official capital; many offices remain in Dar es Salaam.' }),
  c('Algeria', 'Algiers', 'Africa', 36.8, 3.1),
  c('Uganda', 'Kampala', 'Africa', 0.3, 32.6),
  c('United States', 'Washington, D.C.', 'North America', 38.9, -77.0, { aliases: ['USA', 'US', 'United States of America', 'America'], capitalAliases: ['Washington', 'Washington DC'] }),
  c('Canada', 'Ottawa', 'North America', 45.4, -75.7),
  c('Mexico', 'Mexico City', 'North America', 19.4, -99.1),
  c('Cuba', 'Havana', 'North America', 23.1, -82.4),
  c('Jamaica', 'Kingston', 'North America', 18.0, -76.8),
  c('Brazil', 'Brasília', 'South America', -15.8, -47.9),
  c('Argentina', 'Buenos Aires', 'South America', -34.6, -58.4),
  c('Chile', 'Santiago', 'South America', -33.4, -70.7),
  c('Peru', 'Lima', 'South America', -12.0, -77.0),
  c('Colombia', 'Bogotá', 'South America', 4.7, -74.1),
  c('Venezuela', 'Caracas', 'South America', 10.5, -66.9),
  c('Australia', 'Canberra', 'Oceania', -35.3, 149.1),
  c('New Zealand', 'Wellington', 'Oceania', -41.3, 174.8),
  c('Fiji', 'Suva', 'Oceania', -18.1, 178.4),
  c('Papua New Guinea', 'Port Moresby', 'Oceania', -9.4, 147.2),
  c('Costa Rica', 'San José', 'North America', 9.9, -84.1),
  c('Ecuador', 'Quito', 'South America', -0.2, -78.5),
  c('Bolivia', 'Sucre', 'South America', -19.0, -65.3, { note: 'Sucre is the constitutional capital; the government sits in La Paz.', capitalAliases: ['La Paz'] }),
];

export function normalize(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[.,'’]/g, '').replace(/[-\s]+/g, ' ').replace(/^the /, '').trim();
}

export function matchesCountry(answer: string, c: Country): boolean {
  const a = normalize(answer);
  return [c.name, ...(c.aliases ?? [])].some((x) => normalize(x) === a);
}

export function matchesCapital(answer: string, c: Country): boolean {
  const a = normalize(answer);
  return [c.capital, ...(c.capitalAliases ?? [])].some((x) => normalize(x) === a);
}

const R = 6371;
export function distanceKm(a: Pick<Country, 'lat' | 'lon'>, b: Pick<Country, 'lat' | 'lon'>): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(h)));
}

/** Small deterministic RNG so quizzes can be reproduced (and tested). */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

export function shuffle<T>(xs: T[], rand: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type Mode = 'capital' | 'country' | 'continent' | 'north';
export const MODE_LABEL: Record<Mode, string> = { capital: 'Country → capital', country: 'Capital → country', continent: 'Which continent?', north: 'Which is further north?' };

export type Question =
  | { mode: 'capital' | 'country'; country: Country; options: string[] }
  | { mode: 'continent'; country: Country; options: Continent[] }
  | { mode: 'north'; country: Country; other: Country; options: string[] };

export function makeQuiz(mode: Mode, pool: Country[], count: number, rand: () => number): Question[] {
  const picks = shuffle(pool, rand).slice(0, Math.min(count, pool.length));
  return picks.map((country) => {
    if (mode === 'continent') return { mode, country, options: CONTINENTS };
    if (mode === 'north') {
      // Pick a partner whose capital is at least 2° of latitude away so the answer is clear.
      const others = shuffle(COUNTRIES.filter((x) => x !== country && Math.abs(x.lat - country.lat) >= 2), rand);
      const other = others[0];
      return { mode, country, other, options: shuffle([country.name, other.name], rand) };
    }
    const sameContinent = COUNTRIES.filter((x) => x !== country && x.continent === country.continent);
    const distractors = shuffle(sameContinent.length >= 3 ? sameContinent : COUNTRIES.filter((x) => x !== country), rand).slice(0, 3);
    const opt = (x: Country) => (mode === 'capital' ? x.capital : x.name);
    return { mode, country, options: shuffle([opt(country), ...distractors.map(opt)], rand) };
  });
}

export function correctAnswer(q: Question): string {
  if (q.mode === 'north') return q.country.lat > q.other.lat ? q.country.name : q.other.name;
  if (q.mode === 'continent') return q.country.continent;
  return q.mode === 'capital' ? q.country.capital : q.country.name;
}

export function isCorrect(q: Question, answer: string): boolean {
  if (q.mode === 'capital') return matchesCapital(answer, q.country);
  if (q.mode === 'country') return matchesCountry(answer, q.country);
  return normalize(answer) === normalize(correctAnswer(q));
}

/** Equirectangular projection to an SVG box. */
export function project(lat: number, lon: number, w: number, h: number) {
  return { x: ((lon + 180) / 360) * w, y: ((90 - lat) / 180) * h };
}
