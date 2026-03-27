<script lang="ts">
  import type { PageData } from './$types';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';

  let { data } = $props<{ data: PageData }>();
  let { book, error } = $derived(data);
</script>

<svelte:head>
  <title>{book ? `${book.nameEnglish} — Daily Bible` : 'Book — Daily Bible'}</title>
</svelte:head>

<div class="space-y-6">
  <!-- Breadcrumb -->
  <nav class="text-sm text-stone-500">
    <a href="/bible" class="hover:text-primary">Bible</a>
    <span class="mx-2">›</span>
    <span class="text-stone-800">{book?.nameEnglish ?? data.params?.bookCode}</span>
  </nav>

  {#if error && !book}
    <EmptyState title="Book not found" description={error} icon="📖" />
  {:else if book}
    <div>
      <p class="text-xs text-stone-400 uppercase tracking-wide">{book.testament === 'OT' ? 'Old Testament' : 'New Testament'} · Book {book.bookNumber}</p>
      <h1 class="mt-1">{book.nameEnglish}</h1>
      <p class="text-stone-500 italic mt-0.5">{book.nameLatin}</p>
    </div>

    <div>
      <h2 class="mb-4 text-lg">Select a Chapter</h2>
      <div class="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {#each Array.from({ length: book.chapterCount }, (_, i) => i + 1) as chapter}
          <a
            href="/bible/{book.bookCode}/{chapter}"
            class="card flex items-center justify-center h-11 font-medium text-stone-700 hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all text-sm"
          >
            {chapter}
          </a>
        {/each}
      </div>
    </div>
  {/if}
</div>
