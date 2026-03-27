import Database from 'better-sqlite3';
import { readFileSync, mkdirSync, statSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const BIBLE_JSON = resolve(__dirname, '../../bibleapp/backend/src/tools/BibleImporter/bible.json');
const OUT_DB = resolve(root, 'static/bible.db');

console.log('Reading bible.json...');
const raw = JSON.parse(readFileSync(BIBLE_JSON, 'utf8')) as {
  books: unknown[];
  verses: {
    bookCode: string;
    chapter: number;
    verseNumber: number;
    textLatin: string;
    textEnglish: string;
  }[];
};

// Book metadata - Catholic canon ordered
const BOOKS = [
  { bookCode: 'GEN', nameEnglish: 'Genesis', nameLatin: 'Genesis', bookNumber: 1, testament: 'OT', chapterCount: 50 },
  { bookCode: 'EXO', nameEnglish: 'Exodus', nameLatin: 'Exodus', bookNumber: 2, testament: 'OT', chapterCount: 40 },
  { bookCode: 'LEV', nameEnglish: 'Leviticus', nameLatin: 'Leviticus', bookNumber: 3, testament: 'OT', chapterCount: 27 },
  { bookCode: 'NUM', nameEnglish: 'Numbers', nameLatin: 'Numeri', bookNumber: 4, testament: 'OT', chapterCount: 36 },
  { bookCode: 'DEU', nameEnglish: 'Deuteronomy', nameLatin: 'Deuteronomium', bookNumber: 5, testament: 'OT', chapterCount: 34 },
  { bookCode: 'JOS', nameEnglish: 'Joshua', nameLatin: 'Josue', bookNumber: 6, testament: 'OT', chapterCount: 24 },
  { bookCode: 'JDG', nameEnglish: 'Judges', nameLatin: 'Judicum', bookNumber: 7, testament: 'OT', chapterCount: 21 },
  { bookCode: 'RUT', nameEnglish: 'Ruth', nameLatin: 'Ruth', bookNumber: 8, testament: 'OT', chapterCount: 4 },
  { bookCode: '1SA', nameEnglish: '1 Samuel', nameLatin: '1 Samuelis', bookNumber: 9, testament: 'OT', chapterCount: 31 },
  { bookCode: '2SA', nameEnglish: '2 Samuel', nameLatin: '2 Samuelis', bookNumber: 10, testament: 'OT', chapterCount: 24 },
  { bookCode: '1KI', nameEnglish: '1 Kings', nameLatin: '1 Regum', bookNumber: 11, testament: 'OT', chapterCount: 22 },
  { bookCode: '2KI', nameEnglish: '2 Kings', nameLatin: '2 Regum', bookNumber: 12, testament: 'OT', chapterCount: 25 },
  { bookCode: '1CH', nameEnglish: '1 Chronicles', nameLatin: '1 Paralipomenon', bookNumber: 13, testament: 'OT', chapterCount: 29 },
  { bookCode: '2CH', nameEnglish: '2 Chronicles', nameLatin: '2 Paralipomenon', bookNumber: 14, testament: 'OT', chapterCount: 36 },
  { bookCode: 'EZR', nameEnglish: 'Ezra', nameLatin: 'Esdras', bookNumber: 15, testament: 'OT', chapterCount: 10 },
  { bookCode: 'NEH', nameEnglish: 'Nehemiah', nameLatin: 'Nehemias', bookNumber: 16, testament: 'OT', chapterCount: 13 },
  { bookCode: 'TOB', nameEnglish: 'Tobit', nameLatin: 'Tobias', bookNumber: 17, testament: 'OT', chapterCount: 14 },
  { bookCode: 'JDT', nameEnglish: 'Judith', nameLatin: 'Judith', bookNumber: 18, testament: 'OT', chapterCount: 16 },
  { bookCode: 'EST', nameEnglish: 'Esther', nameLatin: 'Esther', bookNumber: 19, testament: 'OT', chapterCount: 16 },
  { bookCode: '1MA', nameEnglish: '1 Maccabees', nameLatin: '1 Machabaeorum', bookNumber: 20, testament: 'OT', chapterCount: 16 },
  { bookCode: '2MA', nameEnglish: '2 Maccabees', nameLatin: '2 Machabaeorum', bookNumber: 21, testament: 'OT', chapterCount: 15 },
  { bookCode: 'JOB', nameEnglish: 'Job', nameLatin: 'Job', bookNumber: 22, testament: 'OT', chapterCount: 42 },
  { bookCode: 'PSA', nameEnglish: 'Psalms', nameLatin: 'Psalmi', bookNumber: 23, testament: 'OT', chapterCount: 150 },
  { bookCode: 'PRO', nameEnglish: 'Proverbs', nameLatin: 'Proverbia', bookNumber: 24, testament: 'OT', chapterCount: 31 },
  { bookCode: 'ECC', nameEnglish: 'Ecclesiastes', nameLatin: 'Ecclesiastes', bookNumber: 25, testament: 'OT', chapterCount: 12 },
  { bookCode: 'SNG', nameEnglish: 'Song of Songs', nameLatin: 'Canticum Canticorum', bookNumber: 26, testament: 'OT', chapterCount: 8 },
  { bookCode: 'WIS', nameEnglish: 'Wisdom', nameLatin: 'Sapientia', bookNumber: 27, testament: 'OT', chapterCount: 19 },
  { bookCode: 'SIR', nameEnglish: 'Sirach', nameLatin: 'Ecclesiasticus', bookNumber: 28, testament: 'OT', chapterCount: 51 },
  { bookCode: 'ISA', nameEnglish: 'Isaiah', nameLatin: 'Isaias', bookNumber: 29, testament: 'OT', chapterCount: 66 },
  { bookCode: 'JER', nameEnglish: 'Jeremiah', nameLatin: 'Jeremias', bookNumber: 30, testament: 'OT', chapterCount: 52 },
  { bookCode: 'LAM', nameEnglish: 'Lamentations', nameLatin: 'Threni', bookNumber: 31, testament: 'OT', chapterCount: 5 },
  { bookCode: 'BAR', nameEnglish: 'Baruch', nameLatin: 'Baruch', bookNumber: 32, testament: 'OT', chapterCount: 6 },
  { bookCode: 'EZK', nameEnglish: 'Ezekiel', nameLatin: 'Ezechiel', bookNumber: 33, testament: 'OT', chapterCount: 48 },
  { bookCode: 'DAN', nameEnglish: 'Daniel', nameLatin: 'Daniel', bookNumber: 34, testament: 'OT', chapterCount: 14 },
  { bookCode: 'HOS', nameEnglish: 'Hosea', nameLatin: 'Osee', bookNumber: 35, testament: 'OT', chapterCount: 14 },
  { bookCode: 'JOL', nameEnglish: 'Joel', nameLatin: 'Joel', bookNumber: 36, testament: 'OT', chapterCount: 3 },
  { bookCode: 'AMO', nameEnglish: 'Amos', nameLatin: 'Amos', bookNumber: 37, testament: 'OT', chapterCount: 9 },
  { bookCode: 'OBA', nameEnglish: 'Obadiah', nameLatin: 'Abdias', bookNumber: 38, testament: 'OT', chapterCount: 1 },
  { bookCode: 'JON', nameEnglish: 'Jonah', nameLatin: 'Jonas', bookNumber: 39, testament: 'OT', chapterCount: 4 },
  { bookCode: 'MIC', nameEnglish: 'Micah', nameLatin: 'Micheas', bookNumber: 40, testament: 'OT', chapterCount: 7 },
  { bookCode: 'NAM', nameEnglish: 'Nahum', nameLatin: 'Nahum', bookNumber: 41, testament: 'OT', chapterCount: 3 },
  { bookCode: 'HAB', nameEnglish: 'Habakkuk', nameLatin: 'Habacuc', bookNumber: 42, testament: 'OT', chapterCount: 3 },
  { bookCode: 'ZEP', nameEnglish: 'Zephaniah', nameLatin: 'Sophonias', bookNumber: 43, testament: 'OT', chapterCount: 3 },
  { bookCode: 'HAG', nameEnglish: 'Haggai', nameLatin: 'Aggaeus', bookNumber: 44, testament: 'OT', chapterCount: 2 },
  { bookCode: 'ZEC', nameEnglish: 'Zechariah', nameLatin: 'Zacharias', bookNumber: 45, testament: 'OT', chapterCount: 14 },
  { bookCode: 'MAL', nameEnglish: 'Malachi', nameLatin: 'Malachias', bookNumber: 46, testament: 'OT', chapterCount: 4 },
  { bookCode: 'MAT', nameEnglish: 'Matthew', nameLatin: 'Matthaeus', bookNumber: 47, testament: 'NT', chapterCount: 28 },
  { bookCode: 'MRK', nameEnglish: 'Mark', nameLatin: 'Marcus', bookNumber: 48, testament: 'NT', chapterCount: 16 },
  { bookCode: 'LUK', nameEnglish: 'Luke', nameLatin: 'Lucas', bookNumber: 49, testament: 'NT', chapterCount: 24 },
  { bookCode: 'JHN', nameEnglish: 'John', nameLatin: 'Joannes', bookNumber: 50, testament: 'NT', chapterCount: 21 },
  { bookCode: 'ACT', nameEnglish: 'Acts', nameLatin: 'Actus Apostolorum', bookNumber: 51, testament: 'NT', chapterCount: 28 },
  { bookCode: 'ROM', nameEnglish: 'Romans', nameLatin: 'Romani', bookNumber: 52, testament: 'NT', chapterCount: 16 },
  { bookCode: '1CO', nameEnglish: '1 Corinthians', nameLatin: '1 Corinthios', bookNumber: 53, testament: 'NT', chapterCount: 16 },
  { bookCode: '2CO', nameEnglish: '2 Corinthians', nameLatin: '2 Corinthios', bookNumber: 54, testament: 'NT', chapterCount: 13 },
  { bookCode: 'GAL', nameEnglish: 'Galatians', nameLatin: 'Galatas', bookNumber: 55, testament: 'NT', chapterCount: 6 },
  { bookCode: 'EPH', nameEnglish: 'Ephesians', nameLatin: 'Ephesios', bookNumber: 56, testament: 'NT', chapterCount: 6 },
  { bookCode: 'PHP', nameEnglish: 'Philippians', nameLatin: 'Philippenses', bookNumber: 57, testament: 'NT', chapterCount: 4 },
  { bookCode: 'COL', nameEnglish: 'Colossians', nameLatin: 'Colossenses', bookNumber: 58, testament: 'NT', chapterCount: 4 },
  { bookCode: '1TH', nameEnglish: '1 Thessalonians', nameLatin: '1 Thessalonicenses', bookNumber: 59, testament: 'NT', chapterCount: 5 },
  { bookCode: '2TH', nameEnglish: '2 Thessalonians', nameLatin: '2 Thessalonicenses', bookNumber: 60, testament: 'NT', chapterCount: 3 },
  { bookCode: '1TI', nameEnglish: '1 Timothy', nameLatin: '1 Timotheum', bookNumber: 61, testament: 'NT', chapterCount: 6 },
  { bookCode: '2TI', nameEnglish: '2 Timothy', nameLatin: '2 Timotheum', bookNumber: 62, testament: 'NT', chapterCount: 4 },
  { bookCode: 'TIT', nameEnglish: 'Titus', nameLatin: 'Titum', bookNumber: 63, testament: 'NT', chapterCount: 3 },
  { bookCode: 'PHM', nameEnglish: 'Philemon', nameLatin: 'Philemonem', bookNumber: 64, testament: 'NT', chapterCount: 1 },
  { bookCode: 'HEB', nameEnglish: 'Hebrews', nameLatin: 'Hebraeos', bookNumber: 65, testament: 'NT', chapterCount: 13 },
  { bookCode: 'JAS', nameEnglish: 'James', nameLatin: 'Jacobi', bookNumber: 66, testament: 'NT', chapterCount: 5 },
  { bookCode: '1PE', nameEnglish: '1 Peter', nameLatin: '1 Petri', bookNumber: 67, testament: 'NT', chapterCount: 5 },
  { bookCode: '2PE', nameEnglish: '2 Peter', nameLatin: '2 Petri', bookNumber: 68, testament: 'NT', chapterCount: 3 },
  { bookCode: '1JN', nameEnglish: '1 John', nameLatin: '1 Joannis', bookNumber: 69, testament: 'NT', chapterCount: 5 },
  { bookCode: '2JN', nameEnglish: '2 John', nameLatin: '2 Joannis', bookNumber: 70, testament: 'NT', chapterCount: 1 },
  { bookCode: '3JN', nameEnglish: '3 John', nameLatin: '3 Joannis', bookNumber: 71, testament: 'NT', chapterCount: 1 },
  { bookCode: 'JUD', nameEnglish: 'Jude', nameLatin: 'Judae', bookNumber: 72, testament: 'NT', chapterCount: 1 },
  { bookCode: 'REV', nameEnglish: 'Revelation', nameLatin: 'Apocalypsis', bookNumber: 73, testament: 'NT', chapterCount: 22 },
];

mkdirSync(resolve(root, 'static'), { recursive: true });

console.log('Building database...');
const db = new Database(OUT_DB);

db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

// Books table
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    bookCode TEXT PRIMARY KEY,
    nameEnglish TEXT NOT NULL,
    nameLatin TEXT NOT NULL,
    bookNumber INTEGER NOT NULL,
    testament TEXT NOT NULL,
    chapterCount INTEGER NOT NULL
  );
`);

// Verses table
db.exec(`
  CREATE TABLE IF NOT EXISTS verses (
    id TEXT PRIMARY KEY,
    bookCode TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    verseNumber INTEGER NOT NULL,
    textEnglish TEXT NOT NULL,
    textLatin TEXT NOT NULL,
    FOREIGN KEY (bookCode) REFERENCES books(bookCode)
  );
  CREATE INDEX IF NOT EXISTS idx_verses_book_chapter ON verses(bookCode, chapter);
`);

// FTS5 for full-text search
db.exec(`
  CREATE VIRTUAL TABLE IF NOT EXISTS verses_fts USING fts5(
    id UNINDEXED,
    bookCode UNINDEXED,
    textEnglish,
    textLatin,
    content=verses,
    content_rowid=rowid
  );
`);

// Insert books
const insertBook = db.prepare(`
  INSERT OR REPLACE INTO books (bookCode, nameEnglish, nameLatin, bookNumber, testament, chapterCount)
  VALUES (@bookCode, @nameEnglish, @nameLatin, @bookNumber, @testament, @chapterCount)
`);

const insertBooks = db.transaction(() => {
  for (const book of BOOKS) {
    insertBook.run(book);
  }
});
insertBooks();
console.log(`Inserted ${BOOKS.length} books`);

// Insert verses
const insertVerse = db.prepare(`
  INSERT OR REPLACE INTO verses (id, bookCode, chapter, verseNumber, textEnglish, textLatin)
  VALUES (@id, @bookCode, @chapter, @verseNumber, @textEnglish, @textLatin)
`);

const insertFts = db.prepare(`
  INSERT INTO verses_fts (id, bookCode, textEnglish, textLatin)
  VALUES (@id, @bookCode, @textEnglish, @textLatin)
`);

// Filter to only known books
const knownCodes = new Set(BOOKS.map(b => b.bookCode));
const filteredVerses = raw.verses.filter(v => knownCodes.has(v.bookCode));

const insertAll = db.transaction(() => {
  for (const v of filteredVerses) {
    const id = `${v.bookCode}-${v.chapter}-${v.verseNumber}`;
    insertVerse.run({ id, bookCode: v.bookCode, chapter: v.chapter, verseNumber: v.verseNumber, textEnglish: v.textEnglish, textLatin: v.textLatin });
    insertFts.run({ id, bookCode: v.bookCode, textEnglish: v.textEnglish, textLatin: v.textLatin });
  }
});
insertAll();
console.log(`Inserted ${filteredVerses.length} verses`);

db.close();
const sizeBytes = statSync(OUT_DB).size;
console.log(`Done! DB written to ${OUT_DB}`);
console.log(`Size: ${(sizeBytes / 1024 / 1024).toFixed(1)} MB`);
