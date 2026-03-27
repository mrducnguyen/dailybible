<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { studyDb } from '$lib/db/study';
  import type { Note } from '$lib/types';

  let { data } = $props<{ data: PageData }>();
  let notes = $state<Note[]>([]);
  $effect(() => { notes = [...data.notes]; });

  async function remove(id: string) {
    await studyDb.deleteNote(id);
    notes = notes.filter(n => n.id !== id);
  }

  function verseUrl(verseId: string) {
    const [bookCode, chapter] = verseId.split('-');
    return `/bible/${bookCode}/${chapter}`;
  }

  function verseLabel(verseId: string) {
    const [bookCode, chapter, verse] = verseId.split('-');
    return `${bookCode} ${chapter}:${verse}`;
  }
</script>

<svelte:head><title>Notes — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Notes</h1>
  </div>

  {#if notes.length === 0}
    <EmptyState title="No notes yet" description="Notes on verses will appear here." icon="✏️" />
  {:else}
    <div class="space-y-3">
      {#each notes as note (note.id)}
        <div class="card p-4 space-y-2">
          <div class="flex items-center justify-between">
            <a href={verseUrl(note.verseId)} class="text-sm font-mono text-stone-500 hover:text-primary">
              {verseLabel(note.verseId)}
            </a>
            <button onclick={() => remove(note.id)} class="text-stone-400 hover:text-red-500 text-sm">✕</button>
          </div>
          <p class="text-stone-800 leading-relaxed">{note.content}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>
