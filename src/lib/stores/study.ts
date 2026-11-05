import { get, writable } from 'svelte/store';
import { browser } from '$app/environment';
import { studyDb } from '$lib/db/study';
import type { MixPassage } from '$lib/mix';
import type { Bookmark, Highlight, Note } from '$lib/types';

export interface SelectedSegment {
  verseId: string;
  lang: Highlight['lang'];
  start: number;
  end: number;
  /** Full text of the verse in `lang`. */
  verseText: string;
}

export const bookmarks = writable<Bookmark[]>([]);
export const highlights = writable<Highlight[]>([]);
export const notes = writable<Note[]>([]);
/** The verse whose note is open in the editor. */
export const noteTarget = writable<string | null>(null);

if (browser) {
  studyDb.getBookmarks().then(bookmarks.set);
  studyDb.getHighlights().then(highlights.set);
  studyDb.getNotes().then(notes.set);
}

export async function addBookmark(passages: MixPassage[]): Promise<void> {
  const created = await studyDb.createBookmark(passages);
  bookmarks.update(all => [...all, created]);
}

export async function removeBookmark(id: string): Promise<void> {
  await studyDb.deleteBookmark(id);
  bookmarks.update(all => all.filter(b => b.id !== id));
}

export function openNote(verseId: string): void {
  noteTarget.set(verseId);
}

/** Save a selection as one highlight group, absorbing any highlights it touches. */
export async function addHighlight(segments: SelectedSegment[]): Promise<void> {
  const existing = get(highlights);
  const removed = new Set<string>();
  const groupId = crypto.randomUUID();

  const merged = segments.map((segment, position) => {
    let { start, end } = segment;
    for (const h of existing) {
      if (h.verseId === segment.verseId && h.lang === segment.lang && h.start <= end && h.end >= start) {
        start = Math.min(start, h.start);
        end = Math.max(end, h.end);
        removed.add(h.id);
      }
    }
    return {
      verseId: segment.verseId,
      lang: segment.lang,
      color: 'yellow',
      groupId,
      position,
      start,
      end,
      text: segment.verseText.slice(start, end)
    };
  });

  const created = await studyDb.replaceHighlights([...removed], merged);
  highlights.set([...existing.filter(h => !removed.has(h.id)), ...created]);
}

export async function removeHighlightGroup(groupId: string): Promise<void> {
  const existing = get(highlights);
  const ids = existing.filter(h => h.groupId === groupId).map(h => h.id);
  await studyDb.replaceHighlights(ids, []);
  highlights.set(existing.filter(h => h.groupId !== groupId));
}

export async function saveNote(verseId: string, content: string): Promise<void> {
  const existing = get(notes).find(n => n.verseId === verseId);
  if (existing) {
    await studyDb.updateNote(existing.id, content);
  } else {
    await studyDb.createNote(verseId, content);
  }
  notes.set(await studyDb.getNotes());
}

export async function removeNote(id: string): Promise<void> {
  await studyDb.deleteNote(id);
  notes.update(all => all.filter(n => n.id !== id));
}
