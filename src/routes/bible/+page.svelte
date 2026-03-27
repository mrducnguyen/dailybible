<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';

  let { data } = $props<{ data: PageData }>();
</script>

<svelte:head><title>The Bible — Daily Bible</title></svelte:head>

<div class="space-y-8">
  <div>
    <h1>The Holy Bible</h1>
    <p class="text-stone-500 mt-1">Clementine Vulgate (Latin) • Douay-Rheims 1899 (English)</p>
  </div>

  {#if data.error}
    <EmptyState title="Could not load books" description={data.error} icon="⚠️" />
  {:else}
    {#each [
      { label: 'Old Testament', books: data.ot, count: 46 },
      { label: 'New Testament', books: data.nt, count: 27 }
    ] as section}
      <section>
        <h2 class="mb-4">{section.label}
          <span class="ml-2 text-base font-normal text-stone-500">({section.books.length} books)</span>
        </h2>
        {#if section.books.length === 0}
          <EmptyState title="No books loaded yet" description="The Bible database is loading. Refresh if it takes too long." icon="📖" />
        {:else}
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {#each section.books as book (book.id)}
              <a
                href="/bible/{book.bookCode}"
                class="card p-3 text-center hover:border-primary/40 hover:shadow-md transition-all group"
              >
                <p class="text-xs text-stone-400 mb-1">#{book.bookNumber}</p>
                <p class="font-serif font-semibold text-stone-800 group-hover:text-primary text-sm leading-tight">{book.nameEnglish}</p>
                <p class="text-xs text-stone-400 mt-1 italic truncate">{book.nameLatin}</p>
                <p class="text-xs text-stone-500 mt-1">{book.chapterCount} ch.</p>
              </a>
            {/each}
          </div>
        {/if}
      </section>
    {/each}

    <!-- Search shortcut -->
    <div class="card p-4 flex items-center gap-4 bg-stone-50">
      <span class="text-2xl">🔍</span>
      <div class="flex-1">
        <p class="font-medium text-stone-700">Search the Scriptures</p>
        <p class="text-sm text-stone-500">Search by keyword in Latin or English</p>
      </div>
      <a href="/bible/search" class="btn-secondary">Search</a>
    </div>
  {/if}
</div>
