<script lang="ts">
  import { base } from '$app/paths';
  import StorageNotice from '$lib/components/StorageNotice.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { verseLabel, versePath } from '$lib/highlights';
  import { notes, openNote, removeNote } from '$lib/stores/study';

  const sorted = $derived([...$notes].sort((a, b) => (b.updatedAt ?? b.createdAt).localeCompare(a.updatedAt ?? a.createdAt)));
</script>

<svelte:head><title>Notes — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="{base}/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Notes</h1>
  </div>

  <StorageNotice />

  {#if sorted.length === 0}
    <EmptyState title="No notes yet" description="Select any text while reading, then choose Note." icon="✏️" />
  {:else}
    <div class="space-y-3">
      {#each sorted as note (note.id)}
        <div class="card p-4 space-y-2">
          <div class="flex items-center justify-between gap-3">
            <a href="{base}{versePath(note.verseId)}" class="text-sm font-mono text-stone-500 hover:text-primary">
              {verseLabel(note.verseId)}
            </a>
            <div class="flex items-center gap-3">
              <button onclick={() => openNote(note.verseId)} class="text-stone-400 hover:text-primary text-sm" aria-label="Edit note">✎</button>
              <button onclick={() => removeNote(note.id)} class="text-stone-400 hover:text-red-500 text-sm" aria-label="Delete note">✕</button>
            </div>
          </div>
          <p class="text-stone-800 leading-relaxed whitespace-pre-wrap">{note.content}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>
