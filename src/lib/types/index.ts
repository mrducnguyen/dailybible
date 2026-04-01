export interface ScriptureBook {
  id: string;
  bookCode: string;
  nameEnglish: string;
  nameLatin: string;
  bookNumber: number;
  testament: string;
  chapterCount: number;
}

export interface ScriptureVerse {
  id: string;
  bookId: string;
  bookCode: string;
  chapter: number;
  verseNumber: number;
  textLatin: string;
  textEnglish: string;
  crossReferences: string[];
}

export interface LiturgicalCalendarEntry {
  id: string;
  date: string;
  season: string;
  rank: string;
  title: string;
  saintName?: string;
  liturgicalColor: string;
}

export interface Bookmark {
  id: string;
  userId: string;
  verseId: string;
  label?: string;
  createdAt: string;
}

export interface Highlight {
  id: string;
  userId: string;
  verseId: string;
  color: string;
  createdAt: string;
}

export interface Note {
  id: string;
  userId: string;
  verseId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface LectionarySegment {
  chapterStart: number;
  verseStart: number;
  chapterEnd: number;
  verseEnd: number;
}

export interface LectionaryReading {
  role: 'first' | 'psalm' | 'second' | 'gospel';
  label: string;
  bookCode: string;
  citation: string;
  segments: LectionarySegment[];
}

export interface LectionaryDay {
  key: string;
  lectionaryYear: 'A' | 'B' | 'C';
  readings: LectionaryReading[];
}
