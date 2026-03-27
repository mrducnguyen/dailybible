<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { seasonVariant, formatDate } from '$lib/utils';

  let { data } = $props<{ data: PageData }>();
  const entry = $derived(data.entry);
</script>

<svelte:head><title>{entry.title} — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <nav class="text-sm text-stone-500">
    <a href="/liturgy/calendar" class="hover:text-primary">Calendar</a>
    <span class="mx-2">›</span>
    <span class="text-stone-800">{formatDate(data.date)}</span>
  </nav>

  <div class="card p-6 season-{entry.season.toLowerCase()}">
    <p class="text-sm text-stone-500 mb-2">{formatDate(entry.date)}</p>
    <div class="flex flex-wrap gap-2 mb-3">
      <Badge variant={seasonVariant(entry.liturgicalColor)}>{entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}</Badge>
      {#if entry.rank !== 'Feria'}
        <Badge variant="default">{entry.rank}</Badge>
      {/if}
    </div>
    <h1 class="text-2xl font-serif font-semibold">{entry.title}</h1>
    {#if entry.saintName}
      <p class="mt-2 text-stone-600">Feast of {entry.saintName}</p>
    {/if}
    <div class="mt-4 flex items-center gap-2">
      <div class="w-5 h-5 rounded-full border border-stone-300"
        style="background-color: {entry.liturgicalColor === 'Purple' ? '#6B3A8A' : entry.liturgicalColor === 'White' ? '#F5F0E8' : entry.liturgicalColor === 'Red' ? '#C0392B' : entry.liturgicalColor === 'Green' ? '#2D6A4F' : '#C2185B'}">
      </div>
      <span class="text-sm text-stone-500">{entry.liturgicalColor}</span>
    </div>
  </div>
</div>
