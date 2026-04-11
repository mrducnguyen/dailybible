import { LECTIONARY } from '$lib/data/lectionary';
import type { LectionaryDay, LectionaryReading, LectionarySegment } from '$lib/types';
import {
  calculateEaster,
  firstSundayOfAdvent,
  getSeason,
} from './liturgy';

// ── Helpers (mirrors liturgy.ts internals) ────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

interface Bounds {
  easter: Date;
  ashWednesday: Date;
  palmSunday: Date;
  pentecost: Date;
  baptismOfLord: Date;
  advent: Date;
}

function getBounds(year: number): Bounds {
  const easter = calculateEaster(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecost = addDays(easter, 49);
  const advent = firstSundayOfAdvent(year);
  const jan6 = new Date(year, 0, 6);
  const jan6dow = jan6.getDay();
  const baptismOfLord = addDays(jan6, jan6dow === 0 ? 7 : 7 - jan6dow);
  return { easter, ashWednesday, palmSunday, pentecost, advent, baptismOfLord };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Return the Sunday lectionary year (A / B / C) for a given date.
 *
 * The cycle advances at the start of each Advent:
 *   Advent 2022 → Year A, 2023 → B, 2024 → C, 2025 → A, …
 */
export function getLectionaryYear(date: Date): 'A' | 'B' | 'C' {
  const year = date.getFullYear();
  const adventThisYear = firstSundayOfAdvent(year);
  // If before Advent of this civil year, the liturgical year started in the previous Advent
  const adventYear = date >= adventThisYear ? year : year - 1;
  // Anchor: Advent 2022 = Year A (cycle index 0)
  const idx = ((adventYear - 2022) % 3 + 3) % 3;
  return (['A', 'B', 'C'] as const)[idx];
}

/**
 * Compute the Ordinary Time Sunday number (2–34) for a date that is already
 * confirmed to fall in OrdinaryTime and to be a Sunday.
 *
 * Algorithm:
 *  – First period (after Baptism of Lord, before Ash Wednesday):
 *      Baptism of Lord = OT-1; next Sunday = OT-2; etc.
 *  – Second period (after Pentecost, before Advent):
 *      Count backward from the Sunday before Advent (= OT-34, Christ the King).
 */
function getOrdinaryTimeSundayNumber(date: Date): number {
  const year = date.getFullYear();
  const b = getBounds(year);
  const adventStart = firstSundayOfAdvent(year);
  const christKing = addDays(adventStart, -7); // always OT-34

  if (date <= b.ashWednesday) {
    // First period
    const weeksSinceBaptism = Math.round(
      (date.getTime() - b.baptismOfLord.getTime()) / (7 * 86400000)
    );
    return weeksSinceBaptism + 1; // baptismOfLord = OT-1
  }

  // Second period
  const weeksBeforeChristKing = Math.round(
    (christKing.getTime() - date.getTime()) / (7 * 86400000)
  );
  return 34 - weeksBeforeChristKing;
}

/**
 * Map a date to a lectionary key used in LECTIONARY data.
 * Returns null for ordinary weekdays that have no Sunday-cycle data.
 */
export function getLectionaryKey(date: Date): string | null {
  const year = date.getFullYear();
  const iso = toIso(date);
  const mmdd = iso.slice(5);
  const b = getBounds(year);
  const dow = date.getDay(); // 0=Sun

  // ── Fixed solemnities ───────────────────────────────────────────
  if (mmdd === '01-01') return 'solemnity-mary';
  if (mmdd === '08-15') return 'assumption';
  if (mmdd === '11-01') return 'all-saints';
  if (mmdd === '12-08') return 'immaculate-conception';
  if (mmdd === '12-25') return 'christmas';

  // ── Moveable feasts ─────────────────────────────────────────────
  if (sameDay(date, b.easter)) return 'easter-1';
  if (sameDay(date, addDays(b.easter, 7))) return 'easter-2';
  if (sameDay(date, b.ashWednesday)) return 'ash-wednesday';
  if (sameDay(date, b.palmSunday)) return 'palm-sunday';
  if (sameDay(date, addDays(b.easter, -3))) return 'holy-thursday';
  if (sameDay(date, addDays(b.easter, -2))) return 'good-friday';
  if (sameDay(date, b.baptismOfLord)) return 'baptism-lord';
  if (sameDay(date, b.pentecost)) return 'pentecost';

  // Ascension (Thursday = Easter+39; transferred Sunday = Easter+42)
  if (sameDay(date, addDays(b.easter, 39))) return 'ascension';
  if (sameDay(date, addDays(b.easter, 42))) return 'ascension'; // US transferred Sunday

  // Holy Week weekdays (Mon/Tue/Wed before Easter)
  if (sameDay(date, addDays(b.easter, -6))) return 'holy-week-mon';
  if (sameDay(date, addDays(b.easter, -5))) return 'holy-week-tue';
  if (sameDay(date, addDays(b.easter, -4))) return 'holy-week-wed';

  // ── Season-based Sunday keys ─────────────────────────────────────
  if (dow === 0) {
    const season = getSeason(date);

    // Advent Sundays
    if (season === 'Advent') {
      const advent = firstSundayOfAdvent(year);
      const weekNum =
        Math.round((date.getTime() - advent.getTime()) / (7 * 86400000)) + 1;
      return `advent-${weekNum}`;
    }

    // Lent Sundays
    if (season === 'Lent') {
      const weekNum = Math.round(
        (date.getTime() - b.ashWednesday.getTime()) / (7 * 86400000)
      );
      return `lent-${weekNum}`;
    }

    // Easter Sundays 3–7
    if (season === 'Easter') {
      const weekNum =
        Math.round((date.getTime() - b.easter.getTime()) / (7 * 86400000)) + 1;
      // Avoid duplicating Easter 1 and 2 (already handled above)
      if (weekNum >= 3 && weekNum <= 7) return `easter-${weekNum}`;
    }

    // Ordinary Time Sundays
    if (season === 'OrdinaryTime') {
      // Trinity Sunday = first Sunday after Pentecost
      if (sameDay(date, addDays(b.pentecost, 7))) return 'trinity';
      // Corpus Christi = second Sunday after Pentecost (where it's on Sunday)
      if (sameDay(date, addDays(b.pentecost, 14))) return 'corpus-christi';

      const n = getOrdinaryTimeSundayNumber(date);
      if (n >= 2 && n <= 34) return `ordinary-${n}`;
    }

    // Epiphany (Jan 6 or the Sunday between Jan 2–8)
    if (season === 'Christmas' && mmdd >= '01-02' && mmdd <= '01-08') {
      return 'epiphany';
    }

    // Holy Family (Sunday after Christmas in Christmas season)
    if (
      season === 'Christmas' &&
      (mmdd >= '12-26' || mmdd <= '01-01') &&
      !sameDay(date, b.baptismOfLord)
    ) {
      // The Sunday in the octave of Christmas, or Dec 30 if no Sunday
      if (mmdd >= '12-26' && mmdd <= '12-31') return 'holy-family';
    }
  }

  return null;
}

// ── Psalm versification mapping ───────────────────────────────────────────────
//
// The DB uses Vulgate (Latin/Douay-Rheims) Psalm numbering, while the lectionary
// data uses Hebrew/Protestant numbering (as in modern Catholic lectionaries).
//
// Mapping rules:
//   Hebrew  1–8   → Vulgate  1–8   (identical)
//   Hebrew  9–113 → Vulgate  8–112 (shift −1; Ps 9+10 merged as Vulgate 9)
//   Hebrew  114   → Vulgate  113   (first half of merged psalm — not in lectionary)
//   Hebrew  115   → Vulgate  113   (second half — not in lectionary)
//   Hebrew  116   → split: vv 1–9 → Vulgate 114; vv 10–19 → Vulgate 115 (verse −9)
//   Hebrew  117–146 → Vulgate 116–145 (shift −1)
//   Hebrew  147   → split: vv 1–11 → Vulgate 146; vv 12–20 → Vulgate 147 (verse −11)
//   Hebrew  148–150 → Vulgate 148–150 (identical)

function psalmHebrewToVulgate(
  hebrewCh: number,
  hebrewV: number
): { chapter: number; verse: number } {
  if (hebrewCh <= 8)   return { chapter: hebrewCh,       verse: hebrewV };
  if (hebrewCh <= 113) return { chapter: hebrewCh - 1,   verse: hebrewV };
  if (hebrewCh === 116) {
    return hebrewV <= 9
      ? { chapter: 114, verse: hebrewV }
      : { chapter: 115, verse: hebrewV - 9 };
  }
  if (hebrewCh <= 146) return { chapter: hebrewCh - 1,   verse: hebrewV };
  if (hebrewCh === 147) {
    return hebrewV <= 11
      ? { chapter: 146, verse: hebrewV }
      : { chapter: 147, verse: hebrewV - 11 };
  }
  return { chapter: hebrewCh, verse: hebrewV };
}

// ── Assemble typed readings ───────────────────────────────────────────────────

const ROLE_LABELS: Record<string, string> = {
  first: 'First Reading',
  psalm: 'Responsorial Psalm',
  second: 'Second Reading',
  gospel: 'Gospel',
};

function assembleReadings(
  raw: {
    first: { book: string; cite: string; segs: readonly (readonly [number, number, number, number])[] };
    psalm: { book: string; cite: string; segs: readonly (readonly [number, number, number, number])[] };
    second?: { book: string; cite: string; segs: readonly (readonly [number, number, number, number])[] };
    gospel: { book: string; cite: string; segs: readonly (readonly [number, number, number, number])[] };
  }
): LectionaryReading[] {
  const order: Array<[string, typeof raw.first | undefined]> = [
    ['first', raw.first],
    ['psalm', raw.psalm],
    ['second', raw.second],
    ['gospel', raw.gospel],
  ];
  return order
    .filter((pair): pair is [string, NonNullable<typeof raw.first>] => pair[1] != null)
    .map(([role, ref]) => ({
      role: role as LectionaryReading['role'],
      label: ROLE_LABELS[role],
      bookCode: ref.book,
      citation: ref.cite,
      segments: ref.segs.map(
        ([chapterStart, verseStart, chapterEnd, verseEnd]): LectionarySegment => {
          if (ref.book === 'PSA') {
            const start = psalmHebrewToVulgate(chapterStart, verseStart);
            const end   = psalmHebrewToVulgate(chapterEnd,   verseEnd);
            return { chapterStart: start.chapter, verseStart: start.verse, chapterEnd: end.chapter, verseEnd: end.verse };
          }
          return { chapterStart, verseStart, chapterEnd, verseEnd };
        }
      ),
    }));
}

/**
 * Get the lectionary readings for a given date.
 * Returns null if there are no assigned readings (e.g., ordinary weekday
 * outside of Holy Week that is not covered by the Sunday cycle).
 */
export function getDayReadings(date: Date): LectionaryDay | null {
  const key = getLectionaryKey(date);
  if (!key) return null;

  const entry = LECTIONARY[key];
  if (!entry) return null;

  const lectionaryYear = getLectionaryYear(date);
  const raw = entry.common ?? entry[lectionaryYear];
  if (!raw) return null;

  return {
    key,
    lectionaryYear,
    readings: assembleReadings(raw),
  };
}

/**
 * Human-readable label for the lectionary year.
 * E.g. "Year A (Matthew)" for Year A.
 */
export function lectionaryYearLabel(year: 'A' | 'B' | 'C'): string {
  const gospel: Record<string, string> = {
    A: 'Matthew',
    B: 'Mark',
    C: 'Luke',
  };
  return `Year ${year} — ${gospel[year]}`;
}
