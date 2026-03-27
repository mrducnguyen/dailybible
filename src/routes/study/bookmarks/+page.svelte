<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { studyDb } from '$lib/db/study';
  import type { Bookmark } from '$lib/types';

  let { data } = $props<{ data: PageData }>();
  let bookmarks = $state<Bookmark[]>([]);
  $effect(() => { bookmarks = [...data.bookmarks]; });

  async function remove(id: string) {
    await studyDb.deleteBookmark(id);
    bookmarks = bookmarks.filter(b => b.id !== id);
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

<svelte:head><title>Bookmarks — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Bookmarks</h1>
  </div>

  {#if bookmarks.length === 0}
    <EmptyState title="No bookmarks yet" description="Star a verse while reading to bookmark it." icon="★" />
  {:else}
    <div class="space-y-2">
      {#each bookmarks as bm (bm.id)}
        <div class="card p-4 flex items-center gap-3">
          <a href={verseUrl(bm.verseId)} class="flex-1 font-serif text-stone-800 hover:text-primary">
            {verseLabel(bm.verseId)}
            {#if bm.label}<span class="text-stone-500 text-sm ml-2">— {bm.label}</span>{/if}
          </a>
          <button onclick={() => remove(bm.id)} class="text-stone-400 hover:text-red-500 text-sm" title="Remove">✕</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
