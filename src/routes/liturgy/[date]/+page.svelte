<script lang="ts">
  import type { PageData } from './$types';
  import type { LectionaryReading } from '$lib/types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { seasonVariant, formatDate } from '$lib/utils';

  let { data } = $props<{ data: PageData }>();
  const entry = $derived(data.entry);
  const readings = $derived(data.dayReadings?.readings ?? []);

  const roleColor: Record<string, string> = {
    first: 'border-l-amber-500',
    psalm: 'border-l-blue-400',
    second: 'border-l-amber-500',
    gospel: 'border-l-primary',
  };

  function chapterLink(reading: LectionaryReading): string {
    const seg = reading.segments[0];
    if (!seg) return `/bible/${reading.bookCode}`;
    return `/bible/${reading.bookCode}/${seg.chapterStart}`;
  }
</script>

<svelte:head><title>{entry.title} — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <nav class="text-sm text-stone-500">
    <a href="/liturgy/calendar" class="hover:text-primary">Calendar</a>
    <span class="mx-2">›</span>
    <span class="text-stone-800">{formatDate(data.date)}</span>
  </nav>

  <!-- Liturgical day card -->
  <div class="card p-6 season-{entry.season.toLowerCase()}">
    <p class="text-sm text-stone-500 mb-2">{formatDate(entry.date)}</p>
    <div class="flex flex-wrap gap-2 mb-3">
      <Badge variant={seasonVariant(entry.liturgicalColor)}>
        {entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}
      </Badge>
      {#if entry.rank !== 'Feria'}
        <Badge variant="default">{entry.rank}</Badge>
      {/if}
      <Badge variant="default">{data.yearLabel}</Badge>
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

  <!-- Mass readings -->
  <div>
    <h2 class="text-lg font-serif font-semibold text-stone-700 mb-3">Mass Readings</h2>
    {#if readings.length === 0}
      <EmptyState
        title="No readings assigned"
        description="Lectionary data covers Sundays, solemnities, and Holy Week."
        icon="✝"
      />
    {:else}
      <div class="space-y-3">
        {#each readings as reading, i (reading.role + i)}
          <a href={chapterLink(reading)}
            class="card p-0 overflow-hidden border-l-4 {roleColor[reading.role] ?? 'border-l-stone-300'} flex items-center hover:border-primary/60 hover:shadow-md transition-all group">
            <div class="flex-1 p-4">
              <p class="text-xs font-semibold uppercase tracking-wider text-stone-400">{reading.label}</p>
              <p class="mt-0.5 font-medium text-stone-800 font-mono group-hover:text-primary transition-colors">
                {reading.citation}
              </p>
            </div>
            <span class="pr-4 text-stone-300 group-hover:text-primary transition-colors">›</span>
          </a>
        {/each}
      </div>
    {/if}
  </div>
</div>
