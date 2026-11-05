<script lang="ts">
  import { base } from '$app/paths';
  import StorageNotice from '$lib/components/StorageNotice.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { rangeLabel, versePath } from '$lib/highlights';
  import { highlights, removeHighlightGroup } from '$lib/stores/study';
  import type { Highlight } from '$lib/types';

  // A selection across several verses is stored per verse but listed as one highlight.
  const groups = $derived.by(() => {
    const byGroup = new Map<string, Highlight[]>();
    for (const h of $highlights) byGroup.set(h.groupId, [...(byGroup.get(h.groupId) ?? []), h]);
    return [...byGroup.entries()]
      .map(([groupId, items]) => ({ groupId, items: items.sort((a, b) => a.position - b.position) }))
      .sort((a, b) => b.items[0].createdAt.localeCompare(a.items[0].createdAt));
  });
</script>

<svelte:head><title>Highlights — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center gap-3">
    <a href="{base}/study" class="text-stone-400 hover:text-primary">← Study</a>
    <h1>Highlights</h1>
  </div>

  <StorageNotice />

  {#if groups.length === 0}
    <EmptyState title="No highlights yet" description="Select any text while reading, then choose Highlight." icon="🖊" />
  {:else}
    <div class="space-y-3">
      {#each groups as { groupId, items } (groupId)}
        <div class="card p-4 space-y-2">
          <div class="flex items-center justify-between gap-3">
            <a href="{base}{versePath(items[0].verseId)}" class="text-sm font-mono text-stone-500 hover:text-primary">
              {rangeLabel(items[0].verseId, items[items.length - 1].verseId)}{items[0].lang === 'latin' ? ' · Latin' : ''}
            </a>
            <button onclick={() => removeHighlightGroup(groupId)} class="text-stone-400 hover:text-red-500 text-sm" aria-label="Remove highlight">✕</button>
          </div>
          <p class="leading-relaxed text-stone-800"><mark class="bg-yellow-200 text-inherit rounded-sm">{items.map(h => h.text).join(' ')}</mark></p>
        </div>
      {/each}
    </div>
  {/if}
</div>
