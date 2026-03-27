<script lang="ts">
  import { browser } from '$app/environment';
  import { scriptureDb } from '$lib/db/scripture';
  import type { ScriptureVerse } from '$lib/types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';

  let query = $state('');
  let translation = $state<'english' | 'latin'>('english');
  let results = $state<ScriptureVerse[]>([]);
  let searching = $state(false);
  let searched = $state(false);

  async function search() {
    if (!query.trim() || !browser) return;
    searching = true;
    searched = true;
    try {
      results = await scriptureDb.search(query, translation);
    } finally {
      searching = false;
    }
  }
</script>

<svelte:head><title>Search — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <h1>Search the Scriptures</h1>

  <div class="flex gap-2 flex-wrap">
    <input
      type="search"
      bind:value={query}
      placeholder="Search in English or Latin..."
      class="flex-1 min-w-0 border border-stone-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      onkeydown={(e) => e.key === 'Enter' && search()}
    />
    <div class="flex items-center gap-1 bg-stone-100 rounded-md p-1">
      <button class="px-3 py-1.5 text-sm rounded {translation === 'english' ? 'bg-white shadow text-primary font-medium' : 'text-stone-500'}"
        onclick={() => (translation = 'english')}>English</button>
      <button class="px-3 py-1.5 text-sm rounded {translation === 'latin' ? 'bg-white shadow text-primary font-medium' : 'text-stone-500'}"
        onclick={() => (translation = 'latin')}>Latin</button>
    </div>
    <button class="btn-primary" onclick={search}>Search</button>
  </div>

  {#if searching}
    <Spinner size="lg" class="py-12" />
  {:else if searched && results.length === 0}
    <EmptyState title="No results found" description="Try a different search term." icon="🔍" />
  {:else if results.length > 0}
    <p class="text-sm text-stone-500">{results.length} result{results.length !== 1 ? 's' : ''}</p>
    <div class="space-y-2">
      {#each results as verse (verse.id)}
        <a href="/bible/{verse.bookCode}/{verse.chapter}"
          class="card p-4 block hover:border-primary/40 hover:shadow-md transition-all">
          <p class="text-xs text-stone-400 mb-1 font-mono">{verse.bookCode} {verse.chapter}:{verse.verseNumber}</p>
          <p class="text-stone-800 leading-relaxed">
            {translation === 'english' ? verse.textEnglish : verse.textLatin}
          </p>
        </a>
      {/each}
    </div>
  {/if}
</div>
