<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { seasonVariant } from '$lib/utils';
  import { goto } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  function navigate(delta: number) {
    let m = data.month + delta;
    let y = data.year;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    goto(`/liturgy/calendar?year=${y}&month=${m}`);
  }

  function todayIso() {
    return new Date().toISOString().slice(0, 10);
  }
</script>

<svelte:head><title>Liturgical Calendar — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1>Liturgical Calendar</h1>
    <div class="flex items-center gap-2">
      <button class="btn-secondary px-3" onclick={() => navigate(-1)}>←</button>
      <span class="font-medium text-stone-700">{MONTHS[data.month - 1]} {data.year}</span>
      <button class="btn-secondary px-3" onclick={() => navigate(1)}>→</button>
    </div>
  </div>

  <div class="space-y-2">
    {#each data.entries as entry}
      {@const isToday = entry.date === todayIso()}
      <a href="/liturgy/{entry.date}"
        class="card p-3 flex items-center gap-3 hover:border-primary/40 transition-all {isToday ? 'border-primary/50 bg-primary/5' : ''}">
        <div class="text-center w-10 shrink-0">
          <p class="text-xs text-stone-400">{new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}</p>
          <p class="text-lg font-bold {isToday ? 'text-primary' : 'text-stone-800'}">{new Date(entry.date + 'T00:00:00').getDate()}</p>
        </div>
        <div class="w-3 h-3 rounded-full shrink-0"
          style="background-color: {entry.liturgicalColor === 'Purple' ? '#6B3A8A' : entry.liturgicalColor === 'White' ? '#D4AF37' : entry.liturgicalColor === 'Red' ? '#C0392B' : entry.liturgicalColor === 'Green' ? '#2D6A4F' : '#C2185B'}">
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-stone-800 truncate">{entry.title}</p>
          <p class="text-xs text-stone-500">{entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}</p>
        </div>
        {#if entry.rank !== 'Feria'}
          <Badge variant={seasonVariant(entry.liturgicalColor)}>{entry.rank}</Badge>
        {/if}
      </a>
    {/each}
  </div>
</div>
