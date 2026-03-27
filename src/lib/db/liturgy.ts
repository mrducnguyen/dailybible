import type { LiturgicalCalendarEntry } from '$lib/types';

// ── Computus (Anonymous Gregorian algorithm) ──────────────────────────────────

export function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = ((19 * a) + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + (2 * e) + (2 * i) - h - k) % 7;
  const m = Math.floor((a + (11 * h) + (22 * l)) / 451);
  const month = Math.floor((h + l - (7 * m) + 114) / 31);
  const day = ((h + l - (7 * m) + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

export function firstSundayOfAdvent(year: number): Date {
  const dec3 = new Date(year, 11, 3);
  const dow = dec3.getDay();
  const d = new Date(dec3);
  d.setDate(d.getDate() - dow);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface Boundaries {
  easter: Date;
  ashWednesday: Date;
  palmSunday: Date;
  pentecost: Date;
  advent: Date;
  baptismOfLord: Date;
}

function getBoundaries(year: number): Boundaries {
  const easter = calculateEaster(year);
  const ashWednesday = addDays(easter, -46);
  const palmSunday = addDays(easter, -7);
  const pentecost = addDays(easter, 49);
  const advent = firstSundayOfAdvent(year);
  // Baptism of the Lord: Sunday after Jan 6
  const jan6 = new Date(year, 0, 6);
  const jan6dow = jan6.getDay();
  const baptismOfLord = addDays(jan6, jan6dow === 0 ? 7 : 7 - jan6dow);
  return { easter, ashWednesday, palmSunday, pentecost, advent, baptismOfLord };
}

export function getSeason(date: Date): string {
  const year = date.getFullYear();
  const b = getBoundaries(year);
  // Christmas: Dec 25 current year through Baptism of Lord
  if (date >= new Date(year - 1, 11, 25) && date <= b.baptismOfLord) return 'Christmas';
  if (date >= new Date(year, 11, 25)) return 'Christmas';
  if (date >= b.advent && date <= new Date(year, 11, 24)) return 'Advent';
  if (date >= b.ashWednesday && date < b.palmSunday) return 'Lent';
  if (date >= b.palmSunday && date < b.easter) return 'HolyWeek';
  if (date >= b.easter && date <= b.pentecost) return 'Easter';
  return 'OrdinaryTime';
}

function isGaudete(date: Date): boolean {
  const advent = firstSundayOfAdvent(date.getFullYear());
  const third = addDays(advent, 14);
  return sameDay(date, third);
}

function isLaetare(date: Date): boolean {
  const easter = calculateEaster(date.getFullYear());
  const fourth = addDays(easter, -21);
  return sameDay(date, fourth);
}

function isGoodFriday(date: Date): boolean {
  const easter = calculateEaster(date.getFullYear());
  return sameDay(date, addDays(easter, -2));
}

function isPentecost(date: Date): boolean {
  const easter = calculateEaster(date.getFullYear());
  return sameDay(date, addDays(easter, 49));
}

export function getLiturgicalColor(date: Date): string {
  if (isGaudete(date) || isLaetare(date)) return 'Rose';
  const season = getSeason(date);
  if (season === 'HolyWeek' && isGoodFriday(date)) return 'Red';
  if (season === 'Easter' && isPentecost(date)) return 'Red';
  const map: Record<string, string> = {
    Advent: 'Purple', Christmas: 'White', Lent: 'Purple',
    HolyWeek: 'Purple', Easter: 'White', OrdinaryTime: 'Green'
  };
  return map[season] ?? 'Green';
}

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}

export function getLiturgicalTitle(date: Date): string {
  const year = date.getFullYear();
  const b = getBoundaries(year);
  const iso = toIso(date);

  if (sameDay(date, b.easter)) return 'Easter Sunday';
  if (sameDay(date, addDays(b.easter, 39))) return 'Ascension of the Lord';
  if (sameDay(date, b.pentecost)) return 'Pentecost Sunday';
  if (sameDay(date, b.ashWednesday)) return 'Ash Wednesday';
  if (sameDay(date, b.palmSunday)) return 'Palm Sunday of the Passion of the Lord';
  if (sameDay(date, addDays(b.easter, -3))) return "Holy Thursday (Mass of the Lord's Supper)";
  if (sameDay(date, addDays(b.easter, -2))) return 'Good Friday';
  if (sameDay(date, addDays(b.easter, -1))) return 'Holy Saturday';
  if (iso.slice(5) === '12-25') return 'The Nativity of the Lord (Christmas)';
  if (iso.slice(5) === '01-01') return 'Solemnity of Mary, the Holy Mother of God';
  if (iso.slice(5) === '08-15') return 'Assumption of the Blessed Virgin Mary';
  if (iso.slice(5) === '11-01') return 'All Saints';
  if (iso.slice(5) === '12-08') return 'Immaculate Conception of the Blessed Virgin Mary';

  if (date.getDay() === 0) {
    const season = getSeason(date);
    if (season === 'Advent') {
      const advent = firstSundayOfAdvent(year);
      const weekNum = Math.round((date.getTime() - advent.getTime()) / (7 * 86400000)) + 1;
      return `${ordinal(weekNum)} Sunday of Advent`;
    }
    if (season === 'Lent') {
      const weekNum = Math.round((date.getTime() - b.ashWednesday.getTime()) / (7 * 86400000));
      return `${ordinal(weekNum)} Sunday of Lent`;
    }
    if (season === 'Easter') {
      const weekNum = Math.round((date.getTime() - b.easter.getTime()) / (7 * 86400000)) + 1;
      return `${ordinal(weekNum)} Sunday of Easter`;
    }
    return 'Sunday in Ordinary Time';
  }

  const season = getSeason(date);
  const label: Record<string, string> = {
    Advent: 'Advent', Christmas: 'Christmas', Lent: 'Lent',
    HolyWeek: 'Holy Week', Easter: 'Easter', OrdinaryTime: 'Ordinary Time'
  };
  return `Weekday — ${label[season] ?? season}`;
}

export function getLiturgicalRank(date: Date): string {
  const iso = toIso(date);
  const mmdd = iso.slice(5);
  const solemnities = ['01-01', '08-15', '11-01', '12-08', '12-25'];
  const b = getBoundaries(date.getFullYear());
  const moveable = [b.easter, b.pentecost, addDays(b.easter, 39)].map(toIso);
  if (solemnities.includes(mmdd) || moveable.includes(iso)) return 'Solemnity';
  if (date.getDay() === 0) return 'Sunday';
  return 'Feria';
}

export function getCalendarEntry(date: Date): LiturgicalCalendarEntry {
  return {
    id: toIso(date),
    date: toIso(date),
    season: getSeason(date),
    rank: getLiturgicalRank(date),
    title: getLiturgicalTitle(date),
    liturgicalColor: getLiturgicalColor(date),
    saintName: undefined
  };
}

export function getMonthEntries(year: number, month: number): LiturgicalCalendarEntry[] {
  const entries: LiturgicalCalendarEntry[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let day = 1; day <= daysInMonth; day++) {
    entries.push(getCalendarEntry(new Date(year, month - 1, day)));
  }
  return entries;
}
