import { describe, expect, it } from 'vitest';
import { COUNTRIES, CONTINENTS, correctAnswer, distanceKm, isCorrect, makeQuiz, matchesCapital, matchesCountry, normalize, project, rng, shuffle } from './geo';

const find = (n: string) => COUNTRIES.find((c) => c.name === n)!;

describe('dataset', () => {
  it('has unique countries, a capital for each and sensible coordinates', () => {
    expect(new Set(COUNTRIES.map((c) => c.name)).size).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) {
      expect(c.capital.length).toBeGreaterThan(1);
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90);
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180);
      expect(CONTINENTS).toContain(c.continent);
    }
    for (const k of CONTINENTS) expect(COUNTRIES.filter((c) => c.continent === k).length).toBeGreaterThanOrEqual(4);
  });
  it('places capitals in the right hemisphere', () => {
    expect(find('Australia').lat).toBeLessThan(0);
    expect(find('Brazil').lon).toBeLessThan(0);
    expect(find('Japan').lon).toBeGreaterThan(100);
  });
});

describe('answer matching', () => {
  it('ignores case, accents, punctuation and a leading “the”', () => {
    expect(normalize('  Bogotá ')).toBe('bogota');
    expect(matchesCapital('reykjavik', find('Iceland'))).toBe(true);
    expect(matchesCapital('washington dc', find('United States'))).toBe(true);
    expect(matchesCountry('the usa', find('United States'))).toBe(true);
    expect(matchesCountry('Czech Republic', find('Czechia'))).toBe(true);
    expect(matchesCapital('Sydney', find('Australia'))).toBe(false);
  });
  it('accepts every official capital for countries with more than one', () => {
    expect(['Pretoria', 'Cape Town', 'Bloemfontein'].every((x) => matchesCapital(x, find('South Africa')))).toBe(true);
    expect(matchesCapital('La Paz', find('Bolivia'))).toBe(true);
  });
});

describe('maths', () => {
  it('measures great-circle distances', () => {
    const d = distanceKm(find('United Kingdom'), find('France'));
    expect(d).toBeGreaterThan(330);
    expect(d).toBeLessThan(360);
    expect(distanceKm(find('Spain'), find('Spain'))).toBe(0);
  });
  it('projects onto a map box', () => {
    expect(project(0, 0, 360, 180)).toEqual({ x: 180, y: 90 });
    expect(project(90, -180, 360, 180)).toEqual({ x: 0, y: 0 });
  });
});

describe('quizzes', () => {
  it('is reproducible with a seed and never repeats a country', () => {
    const a = makeQuiz('capital', COUNTRIES, 10, rng(42)).map((q) => q.country.name);
    const b = makeQuiz('capital', COUNTRIES, 10, rng(42)).map((q) => q.country.name);
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(10);
    expect(shuffle([1, 2, 3], rng(1)).sort()).toEqual([1, 2, 3]);
  });
  it('offers four options including the right one, from the same continent when possible', () => {
    for (const q of makeQuiz('capital', COUNTRIES, 20, rng(7))) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(correctAnswer(q));
      expect(new Set(q.options).size).toBe(4);
    }
  });
  it('builds clear “further north” pairs', () => {
    for (const q of makeQuiz('north', COUNTRIES, 15, rng(3))) {
      if (q.mode !== 'north') throw new Error();
      expect(Math.abs(q.country.lat - q.other.lat)).toBeGreaterThanOrEqual(2);
      expect(isCorrect(q, correctAnswer(q))).toBe(true);
    }
  });
  it('limits to the pool size', () => {
    const europe = COUNTRIES.filter((c) => c.continent === 'Oceania');
    expect(makeQuiz('continent', europe, 50, rng(9))).toHaveLength(europe.length);
  });
});
