import { openDB, type IDBPDatabase } from 'idb';
import type { Bookmark, Highlight, Note } from '$lib/types';

const DB_NAME = 'dailybible-study';
const DB_VERSION = 1;

async function getDb(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore('bookmarks', { keyPath: 'id' });
      db.createObjectStore('highlights', { keyPath: 'id' });
      db.createObjectStore('notes', { keyPath: 'id' });
    }
  });
}

function uuid(): string {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

export const studyDb = {
  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    return (await getDb()).getAll('bookmarks');
  },
  async createBookmark(verseId: string, label?: string): Promise<Bookmark> {
    const bm: Bookmark = { id: uuid(), userId: 'local', verseId, label, createdAt: now() };
    await (await getDb()).put('bookmarks', bm);
    return bm;
  },
  async deleteBookmark(id: string): Promise<void> {
    await (await getDb()).delete('bookmarks', id);
  },
  async isBookmarked(verseId: string): Promise<boolean> {
    const all = await (await getDb()).getAll('bookmarks') as Bookmark[];
    return all.some(b => b.verseId === verseId);
  },

  // Highlights
  async getHighlights(): Promise<Highlight[]> {
    return (await getDb()).getAll('highlights');
  },
  async createHighlight(verseId: string, color: string): Promise<Highlight> {
    const hl: Highlight = { id: uuid(), userId: 'local', verseId, color, createdAt: now() };
    await (await getDb()).put('highlights', hl);
    return hl;
  },
  async deleteHighlight(id: string): Promise<void> {
    await (await getDb()).delete('highlights', id);
  },
  async getVerseHighlight(verseId: string): Promise<Highlight | undefined> {
    const all = await (await getDb()).getAll('highlights') as Highlight[];
    return all.find(h => h.verseId === verseId);
  },

  // Notes
  async getNotes(): Promise<Note[]> {
    return (await getDb()).getAll('notes');
  },
  async createNote(verseId: string, content: string): Promise<Note> {
    const note: Note = { id: uuid(), userId: 'local', verseId, content, createdAt: now() };
    await (await getDb()).put('notes', note);
    return note;
  },
  async updateNote(id: string, content: string): Promise<void> {
    const db = await getDb();
    const note = await db.get('notes', id) as Note;
    if (note) await db.put('notes', { ...note, content, updatedAt: now() });
  },
  async deleteNote(id: string): Promise<void> {
    await (await getDb()).delete('notes', id);
  },
  async getVerseNote(verseId: string): Promise<Note | undefined> {
    const all = await (await getDb()).getAll('notes') as Note[];
    return all.find(n => n.verseId === verseId);
  }
};
