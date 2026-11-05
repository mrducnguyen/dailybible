import { openDB, type IDBPDatabase } from 'idb';
import type { MixPassage } from '$lib/mix';
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
    const bookmarks: Bookmark[] = await (await getDb()).getAll('bookmarks');
    // Records from when bookmarks were single verses have no passages.
    return bookmarks.filter(b => Array.isArray(b.passages));
  },
  async createBookmark(passages: MixPassage[]): Promise<Bookmark> {
    const bm: Bookmark = { id: uuid(), userId: 'local', passages, createdAt: now() };
    await (await getDb()).put('bookmarks', bm);
    return bm;
  },
  async deleteBookmark(id: string): Promise<void> {
    await (await getDb()).delete('bookmarks', id);
  },

  // Highlights
  async getHighlights(): Promise<Highlight[]> {
    const highlights: Highlight[] = await (await getDb()).getAll('highlights');
    return highlights.filter(h => typeof h.start === 'number');
  },
  async replaceHighlights(removeIds: string[], add: Omit<Highlight, 'id' | 'userId' | 'createdAt'>[]): Promise<Highlight[]> {
    const created = add.map(h => ({ ...h, id: uuid(), userId: 'local', createdAt: now() }));
    const tx = (await getDb()).transaction('highlights', 'readwrite');
    await Promise.all([...removeIds.map(id => tx.store.delete(id)), ...created.map(h => tx.store.put(h)), tx.done]);
    return created;
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
  }
};
