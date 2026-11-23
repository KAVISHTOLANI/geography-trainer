import { useMemo, useRef, useState, type ReactNode } from 'react';
import { EmptyState, Field, Landing, NotFound, PageHead, Shell, usePersistentState, useRoute } from './shared/ui';
import { DataTable, useTable, type Column } from './shared/table';
import { formatDay, todayISO } from './shared/dates';
import { CONTINENTS, COUNTRIES, MODE_LABEL, correctAnswer, distanceKm, isCorrect, makeQuiz, project, rng, type Continent, type Country, type Mode, type Question } from './lib/geo';

const KEY = 'mapwise:store';
const NAV = [
  { to: '/', label: 'Overview' },
  { to: '/quiz', label: 'Quiz' },
  { to: '/map', label: 'Map' },
  { to: '/reference', label: 'Reference' },
  { to: '/history', label: 'History' },
];
const CONT_COLOR: Record<Continent, string> = { Africa: '#b5651d', Asia: '#b1274a', Europe: '#2f6aa3', 'North America': '#5b7f3a', 'South America': '#8a4f9e', Oceania: '#1b8a8a' };

interface Result {
  date: string;
  mode: Mode;
  continent: string;
  score: number;
  total: number;
  missed: string[];
}
interface Store {
  history: Result[];
}

export function demoHistory(today: string): Result[] {
  const d = (n: number) => { const x = new Date(`${today}T12:00:00`); x.setDate(x.getDate() - n); return x.toISOString().slice(0, 10); };
  return [
    { date: d(9), mode: 'capital', continent: 'Europe', score: 6, total: 10, missed: ['Switzerland', 'Iceland', 'Finland', 'Hungary'] },
    { date: d(6), mode: 'capital', continent: 'Europe', score: 8, total: 10, missed: ['Switzerland', 'Iceland'] },
    { date: d(4), mode: 'continent', continent: 'All', score: 9, total: 10, missed: ['Turkey'] },
    { date: d(2), mode: 'country', continent: 'Africa', score: 5, total: 10, missed: ['Tanzania', 'Nigeria', 'Senegal', 'Uganda', 'Ghana'] },
    { date: d(1), mode: 'capital', continent: 'Asia', score: 7, total: 10, missed: ['Pakistan', 'Mongolia', 'Vietnam'] },
  ];
}

export default function App() {
  const [route] = useRoute();
  const today = todayISO();
  const [store, setStore] = usePersistentState<Store>(KEY, () => ({ history: demoHistory(today) }));
  const ctx = { store, setStore, today };
  let page: ReactNode;
  if (route === '/') page = <Home />;
  else if (route === '/quiz') page = <Quiz {...ctx} />;
  else if (route === '/map') page = <MapPage />;
  else if (route === '/reference') page = <Reference />;
  else if (route === '/history') page = <History {...ctx} />;
  else page = <NotFound />;
  return (
    <Shell name="Mapwise" wordmark={['Map', 'wise']} nav={NAV} route={route} cta={{ to: '/quiz', label: 'Start a quiz' }} footerNote="Capitals as officially designated; some countries split capital functions — notes explain where. Coordinates are approximate.">
      {page}
    </Shell>
  );
}

type Ctx = { store: Store; setStore: (s: Store) => void; today: string };

/* ---------- Dot map ---------- */
export function DotMap({ highlight = [], onPick, compact, dim = true }: { highlight?: string[]; onPick?: (c: Country) => void; compact?: boolean; dim?: boolean }) {
  const [hover, setHover] = useState<Country | null>(null);
  const W = 720, H = 360;
  return (
    <figure className="dotmap">
      <svg viewBox={`0 30 ${W} 260`} role="img" aria-label={`Map of ${COUNTRIES.length} capital cities as dots, coloured by continent${highlight.length ? `; highlighted: ${highlight.join(', ')}` : ''}`}>
        <rect y={30} width={W} height={260} className="sea" />
        {[-30, 0, 30, 60].map((lat) => { const y = project(lat, 0, W, H).y; return <g key={lat}><line x1={0} x2={W} y1={y} y2={y} className={lat === 0 ? 'eq' : 'grat'} /><text x={4} y={y - 3} className="glbl">{lat === 0 ? 'Equator' : `${Math.abs(lat)}°${lat > 0 ? 'N' : 'S'}`}</text></g>; })}
        {[-120, -60, 0, 60, 120].map((lon) => { const x = project(0, lon, W, H).x; return <line key={lon} x1={x} x2={x} y1={0} y2={H} className="grat" />; })}
        {COUNTRIES.map((c, i) => {
          const { x, y } = project(c.lat, c.lon, W, H);
          const hi = highlight.includes(c.name);
          return (
            <g key={c.name} className={`dot ${hi ? 'is-hi' : ''} ${dim && highlight.length && !hi ? 'is-dim' : ''}`} transform={`translate(${x},${y})`} style={{ ['--c' as string]: CONT_COLOR[c.continent], ['--i' as string]: i }}
              tabIndex={onPick ? 0 : -1} role={onPick ? 'button' : undefined} aria-label={onPick ? `${c.capital}, ${c.name}` : undefined}
              onMouseEnter={() => setHover(c)} onMouseLeave={() => setHover(null)} onFocus={() => setHover(c)} onBlur={() => setHover(null)}
              onClick={() => onPick?.(c)} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onPick?.(c))}>
              <circle r={hi ? 7 : 4.5} />
              {hi && <circle r={14} className="ping" />}
            </g>
          );
        })}
      </svg>
      {!compact && (
        <figcaption className="stack-tight">
          <p className="legend">{CONTINENTS.map((k) => <span key={k}><i style={{ background: CONT_COLOR[k], borderRadius: '50%' }} />{k}</span>)}</p>
          <p className="small muted" aria-live="polite">{hover ? <><strong>{hover.capital}</strong>, {hover.name} · {hover.lat.toFixed(1)}°{hover.lat >= 0 ? 'N' : 'S'}, {Math.abs(hover.lon).toFixed(1)}°{hover.lon >= 0 ? 'E' : 'W'}</> : 'Each dot is a capital city (equirectangular projection; coastlines not drawn). Hover or focus a dot.'}</p>
        </figcaption>
      )}
    </figure>
  );
}

function HeroPreview() {
  const q = { country: COUNTRIES.find((c) => c.name === 'Canada')! };
  return (
    <div className="hero-mw">
      <p className="eyebrow">Question 3 of 10 · Country → capital</p>
      <p className="hero-mw-q">What is the capital of <strong>Canada</strong>?</p>
      <div className="opts-mini">{['Toronto', 'Ottawa', 'Vancouver', 'Montreal'].map((o) => <span key={o} className={o === 'Ottawa' ? 'right' : ''}>{o}</span>)}</div>
      <DotMap highlight={[q.country.name]} compact />
    </div>
  );
}

function Home() {
  return (
    <Landing
      eyebrow="Geography trainer"
      title={<>Know the world, <em>one capital at a time.</em></>}
      lead="Short quizzes on 66 countries: capitals both ways, continents, and which city lies further north — with typed or multiple-choice answers, a map of every capital, and a list of the ones you keep missing."
      primary={{ href: '#/quiz', label: 'Start a quiz' }}
      secondary={{ href: '#/map', label: 'Explore the map' }}
      previewLabel="Quiz — live preview"
      preview={<HeroPreview />}
      steps={[
        { title: 'Pick a quiz', body: 'Choose a question type, a continent and how many questions.' },
        { title: 'Answer', body: 'Tap an option or type it — accents, capital letters and common names like “USA” are accepted.' },
        { title: 'Review', body: 'See what you missed on the map, retry just those, and track scores over time.' },
      ]}
      stepsIntro="Mapwise opens with five labelled demo quiz results so the history page has something to show."
      features={[
        { title: 'Honest facts', body: 'Countries with more than one capital (South Africa, Bolivia) accept each, with a note explaining why.' },
        { title: 'Typed or tapped', body: 'Multiple choice for warming up; typing for real recall.' },
        { title: 'A map of capitals', body: 'Every capital as a dot, coloured by continent, with a distance tool between any two.' },
        { title: 'Retry your misses', body: 'One click builds a quiz from the countries you got wrong last time.' },
      ]}
      note="Mapwise covers a curated set of 66 countries, not all 190+. Coordinates are approximate and borders aren’t drawn."
      closing={{ title: <>Ten questions <em>over a coffee.</em></>, action: { href: '#/quiz', label: 'Start a quiz' } }}
    />
  );
}

/* ---------- Quiz ---------- */
function Quiz({ store, setStore, today }: Ctx) {
  const [mode, setMode] = useState<Mode>('capital');
  const [cont, setCont] = useState<string>('All');
  const [count, setCount] = useState(10);
  const [typed, setTyped] = useState(false);
  const [qs, setQs] = useState<Question[] | null>(null);
  const [i, setI] = useState(0);
  const [answer, setAnswer] = useState('');
  const [given, setGiven] = useState<string | null>(null);
  const [results, setResults] = useState<boolean[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const pool = cont === 'All' ? COUNTRIES : COUNTRIES.filter((c) => c.continent === cont);
  const lastMissed = store.history.at(-1)?.missed ?? [];
  const canType = mode === 'capital' || mode === 'country';

  function start(fromMissed = false) {
    const p = fromMissed ? COUNTRIES.filter((c) => lastMissed.includes(c.name)) : pool;
    setQs(makeQuiz(mode, p, fromMissed ? p.length : count, rng(Date.now())));
    setI(0); setResults([]); setGiven(null); setAnswer('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }
  function submit(a: string) {
    if (given || !qs) return;
    setGiven(a);
    setResults([...results, isCorrect(qs[i], a)]);
  }
  function next() {
    if (!qs) return;
    if (i + 1 >= qs.length) {
      const all = [...results];
      setStore({ history: [...store.history, { date: today, mode: qs[0].mode, continent: cont, score: all.filter(Boolean).length, total: all.length, missed: qs.filter((_, k) => !all[k]).map((q) => q.country.name) }].slice(-100) });
      setI(i + 1);
      return;
    }
    setI(i + 1); setGiven(null); setAnswer('');
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  if (!qs) return (
    <div className="stack">
      <PageHead eyebrow="Quiz" title={<>Set up <em>a round.</em></>} />
      <div className="card stack">
        <div className="tabs" role="radiogroup" aria-label="Question type">{(Object.keys(MODE_LABEL) as Mode[]).map((m) => <button key={m} type="button" role="radio" aria-checked={mode === m} onClick={() => setMode(m)}>{MODE_LABEL[m]}</button>)}</div>
        <div className="filters">
          <Field label="Continent">{(p) => <select {...p} value={cont} onChange={(e) => setCont(e.target.value)}><option value="All">All continents ({COUNTRIES.length})</option>{CONTINENTS.map((c) => <option key={c} value={c}>{c} ({COUNTRIES.filter((x) => x.continent === c).length})</option>)}</select>}</Field>
          <Field label="Questions">{(p) => <select {...p} value={count} onChange={(e) => setCount(Number(e.target.value))}>{[5, 10, 20].map((n) => <option key={n} value={n}>{n}</option>)}</select>}</Field>
          {canType && <label className="check"><input type="checkbox" checked={typed} onChange={(e) => setTyped(e.target.checked)} /> Type answers instead of choosing</label>}
        </div>
        <div className="row">
          <button type="button" className="btn btn-primary" onClick={() => start()}>Start {Math.min(count, pool.length)} questions</button>
          {lastMissed.length > 0 && <button type="button" className="btn" onClick={() => start(true)}>Retry last round’s {lastMissed.length} misses</button>}
        </div>
      </div>
    </div>
  );

  if (i >= qs.length) {
    const score = results.filter(Boolean).length;
    const missed = qs.filter((_, k) => !results[k]);
    return (
      <div className="stack">
        <PageHead eyebrow="Round complete" title={<>{score} <em>out of {qs.length}.</em></>} actions={<button type="button" className="btn btn-primary" onClick={() => setQs(null)}>New round</button>} />
        {missed.length > 0 ? (
          <div className="layout-main">
            <section className="card stack"><h2 className="h3">To review</h2><ul className="list">{missed.map((q) => <li key={q.country.name} className="row-between"><span><strong>{q.country.name}</strong> · {q.country.capital}</span><span className="small muted">{q.country.continent}</span></li>)}</ul></section>
            <aside className="card"><DotMap highlight={missed.map((q) => q.country.name)} compact /></aside>
          </div>
        ) : <EmptyState title="Perfect round">Nothing to review — try a harder mode or typed answers.</EmptyState>}
      </div>
    );
  }

  const q = qs[i];
  const right = correctAnswer(q);
  const ok = given != null && isCorrect(q, given);
  const prompt = q.mode === 'capital' ? <>What is the capital of <strong>{q.country.name}</strong>?</> : q.mode === 'country' ? <><strong>{q.country.capital}</strong> is the capital of which country?</> : q.mode === 'continent' ? <>Which continent is <strong>{q.country.name}</strong> in?</> : <>Whose capital is further north: <strong>{q.options[0]}</strong> or <strong>{q.options[1]}</strong>?</>;
  return (
    <div className="stack quiz">
      <div className="row-between"><span className="label-mono">Question {i + 1} of {qs.length} · {MODE_LABEL[q.mode]}</span><span className="small">Score {results.filter(Boolean).length}</span></div>
      <div className="progress" role="progressbar" aria-label="Quiz progress" aria-valuemin={0} aria-valuemax={qs.length} aria-valuenow={i}><span style={{ width: `${(i / qs.length) * 100}%` }} /></div>
      <section className="card stack q-card">
        <h1 className="q-text">{prompt}</h1>
        {typed && canType ? (
          <form className="row" onSubmit={(e) => { e.preventDefault(); if (answer.trim()) submit(answer); }}>
            <label className="sr-only" htmlFor="ans">Your answer</label>
            <input id="ans" ref={inputRef} value={answer} disabled={!!given} onChange={(e) => setAnswer(e.target.value)} autoComplete="off" className="q-input" />
            {!given && <button className="btn btn-primary" type="submit" disabled={!answer.trim()}>Check</button>}
          </form>
        ) : (
          <div className="opts">{q.options.map((o) => <button key={o} type="button" className={`btn opt ${given ? (o === right ? 'right' : o === given ? 'wrong' : '') : ''}`} disabled={!!given} onClick={() => submit(o)}>{o}</button>)}</div>
        )}
        {given != null && (
          <div className={`feedback ${ok ? 'ok' : 'no'}`} role="status">
            <strong>{ok ? 'Correct!' : `Not quite — ${right}.`}</strong>
            {q.mode === 'north' && <span className="small"> {q.country.capital} {q.country.lat.toFixed(1)}° vs {q.other.capital} {q.other.lat.toFixed(1)}°</span>}
            {q.country.note && <span className="small"> {q.country.note}</span>}
            <button type="button" className="btn btn-primary btn-sm" onClick={next} autoFocus>{i + 1 >= qs.length ? 'See results' : 'Next →'}</button>
          </div>
        )}
      </section>
      {given != null && <DotMap highlight={q.mode === 'north' ? [q.country.name, q.other.name] : [q.country.name]} compact />}
    </div>
  );
}

/* ---------- Map ---------- */
function MapPage() {
  const [a, setA] = useState('United Kingdom');
  const [b, setB] = useState('Japan');
  const [picked, setPicked] = useState<Country | null>(null);
  const ca = COUNTRIES.find((c) => c.name === a)!, cb = COUNTRIES.find((c) => c.name === b)!;
  const names = [...COUNTRIES].map((c) => c.name).sort();
  return (
    <div className="stack">
      <PageHead eyebrow="Map" title={<>Every capital, <em>as a dot.</em></>} />
      <section className="card stack"><DotMap highlight={[a, b, ...(picked ? [picked.name] : [])]} onPick={setPicked} dim={false} />
        {picked && <p className="pick-info" role="status"><strong>{picked.capital}</strong> is the capital of <strong>{picked.name}</strong> ({picked.continent}).{picked.note && ` ${picked.note}`}</p>}
      </section>
      <section className="card stack" aria-labelledby="dist-t">
        <h2 id="dist-t" className="h3">Distance between capitals</h2>
        <div className="filters">
          <Field label="From">{(p) => <select {...p} value={a} onChange={(e) => setA(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select>}</Field>
          <Field label="To">{(p) => <select {...p} value={b} onChange={(e) => setB(e.target.value)}>{names.map((n) => <option key={n}>{n}</option>)}</select>}</Field>
        </div>
        <p className="display-num" data-testid="distance">{distanceKm(ca, cb).toLocaleString()} km</p>
        <p className="small muted">{ca.capital} → {cb.capital}, great-circle distance (as the crow flies), about {Math.round(distanceKm(ca, cb) * 0.621).toLocaleString()} miles.</p>
      </section>
    </div>
  );
}

/* ---------- Reference ---------- */
function Reference() {
  const [q, setQ] = useState('');
  const [cont, setCont] = useState('');
  const rows = useMemo(() => COUNTRIES.filter((c) => (!cont || c.continent === cont) && `${c.name} ${c.capital} ${(c.aliases ?? []).join(' ')}`.toLowerCase().includes(q.trim().toLowerCase())), [q, cont]);
  const columns: Column<Country>[] = [
    { key: 'name', label: 'Country', sort: (c) => c.name, render: (c) => <>{c.name}{c.note && <span className="note-dot" title={c.note} aria-label={`Note: ${c.note}`}> *</span>}</> },
    { key: 'capital', label: 'Capital', sort: (c) => c.capital, render: (c) => c.capital },
    { key: 'cont', label: 'Continent', sort: (c) => c.continent, render: (c) => <span className="cont" style={{ ['--c' as string]: CONT_COLOR[c.continent] }}>{c.continent}</span> },
    { key: 'lat', label: 'Latitude', num: true, sort: (c) => c.lat, render: (c) => `${Math.abs(c.lat).toFixed(1)}°${c.lat >= 0 ? 'N' : 'S'}` },
  ];
  const table = useTable(rows, columns, { initialSort: 'name', pageSize: 15 });
  return (
    <div className="stack">
      <PageHead eyebrow="Reference" title={<>All {COUNTRIES.length} <em>countries.</em></>} description="Sort by latitude to see which capitals are furthest north or south." />
      <div className="card stack">
        <div className="filters">
          <Field label="Search" className="grow">{(p) => <input {...p} type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Country or capital" />}</Field>
          <Field label="Continent">{(p) => <select {...p} value={cont} onChange={(e) => setCont(e.target.value)}><option value="">All</option>{CONTINENTS.map((c) => <option key={c}>{c}</option>)}</select>}</Field>
        </div>
        <DataTable caption="Countries and capitals" columns={columns} table={table} rowKey={(c) => c.name} empty="No countries match." />
        <p className="small muted">* has a note about split or official capitals — hover or focus to read it.</p>
      </div>
    </div>
  );
}

/* ---------- History ---------- */
function History({ store, setStore }: Ctx) {
  const h = store.history;
  const [tip, setTip] = useState<string | null>(null);
  const missCount = new Map<string, number>();
  for (const r of h) for (const m of r.missed) missCount.set(m, (missCount.get(m) ?? 0) + 1);
  const tough = [...missCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!h.length) return <EmptyState title="No rounds yet" actions={<a className="btn btn-primary" href="#/quiz">Start a quiz</a>}>Your scores appear here after each round.</EmptyState>;
  const recent = h.slice(-12);
  return (
    <div className="stack">
      <PageHead eyebrow="History" title={<>How you’re <em>getting on.</em></>} actions={<button type="button" className="btn btn-ghost btn-sm" onClick={() => window.confirm('Clear all quiz history?') && setStore({ history: [] })}>Clear history</button>} />
      <div className="stats">
        <div className="stat"><span className="stat-label">Rounds</span><span className="stat-value">{h.length}</span></div>
        <div className="stat"><span className="stat-label">Average</span><span className="stat-value">{Math.round((h.reduce((s, r) => s + r.score / r.total, 0) / h.length) * 100)}%</span></div>
        <div className="stat"><span className="stat-label">Best</span><span className="stat-value">{Math.max(...h.map((r) => Math.round((r.score / r.total) * 100)))}%</span></div>
      </div>
      <div className="grid-2">
        <section className="card stack" aria-labelledby="sc-t">
          <h2 id="sc-t" className="h3">Recent scores</h2>
          <div className="bars-wrap" onMouseLeave={() => setTip(null)}>
            <div className="bars-axis" aria-hidden="true"><span>100%</span><span>50%</span><span>0%</span></div>
            <div className="bars" role="img" aria-label={recent.map((r) => `${r.date}: ${r.score} of ${r.total}`).join(', ')}>
              {recent.map((r, i) => {
                const text = `${formatDay(r.date, { day: 'numeric', month: 'short' })} · ${MODE_LABEL[r.mode]} · ${r.continent}: ${r.score}/${r.total}`;
                return (
                  <div key={i} className="bar-col" tabIndex={0} aria-label={text} style={{ ['--i' as string]: i }} onMouseEnter={() => setTip(text)} onFocus={() => setTip(text)} onBlur={() => setTip(null)}>
                    <div className="bar-stack" style={{ height: `${(r.score / r.total) * 100}%` }}><span style={{ flexGrow: 1, background: 'var(--accent)' }} /></div>
                    <span className="bar-label mono">{formatDay(r.date, { day: 'numeric' })}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="small" aria-live="polite">{tip ?? 'Hover or focus a bar for the round details.'}</p>
        </section>
        <section className="card stack" aria-labelledby="tough-t">
          <h2 id="tough-t" className="h3">Most often missed</h2>
          {tough.length ? <ol className="tough">{tough.map(([n, k]) => { const c = COUNTRIES.find((x) => x.name === n); return <li key={n}><span><strong>{n}</strong>{c && <span className="small muted"> · {c.capital}</span>}</span><span className="badge">{k}×</span></li>; })}</ol> : <p className="muted small">No misses yet.</p>}
        </section>
      </div>
      <p className="small muted">Demo history entries are fictional; new rounds are added as you play.</p>
    </div>
  );
}
