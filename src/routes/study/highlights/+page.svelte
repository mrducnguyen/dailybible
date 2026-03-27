<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { studyDb } from '$lib/db/study';
  import type { Highlight } from '$lib/types';

  let { data } = $props<{ data: PageData }>();
  let highlights = $state<Highlight[]>([]);
  $effect(() => { highlights = [...data.highlights]; });

  async function remove(id: string) {
    await studyDb.deleteHighlight(id);
    highlights = highlights.filter(h => h.id !== id);
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

<svelte:head><title>Highlights — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Highlights</h1>
  </div>

  {#if highlights.length === 0}
    <EmptyState title="No highlights yet" description="Highlights will appear here." icon="🖊" />
  {:else}
    <div class="space-y-2">
      {#each highlights as hl (hl.id)}
        <div class="card p-4 flex items-center gap-3">
          <div class="w-4 h-4 rounded-full shrink-0" style="background-color: {hl.color}"></div>
          <a href={verseUrl(hl.verseId)} class="flex-1 font-serif text-stone-800 hover:text-primary">
            {verseLabel(hl.verseId)}
          </a>
          <button onclick={() => remove(hl.id)} class="text-stone-400 hover:text-red-500 text-sm">✕</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
