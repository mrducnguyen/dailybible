<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { seasonVariant, formatDate } from '$lib/utils';

  let { data } = $props<{ data: PageData }>();
  const entry = $derived(data.entry);
  const readings = $derived(data.dayReadings?.readings ?? []);
  const yearLabel = $derived(data.yearLabel ?? '');
</script>

<svelte:head><title>Daily Bible — Today</title></svelte:head>

<div class="space-y-6">
  <div class="text-center py-4">
    <p class="text-sm text-stone-500 uppercase tracking-wide">{formatDate(new Date().toISOString().slice(0, 10))}</p>
    <h1 class="mt-1 text-4xl font-serif font-bold text-primary">Daily Bible</h1>
    <p class="mt-1 text-stone-500 italic">Clementine Vulgate • Douay-Rheims</p>
  </div>

  <div class="card p-6 season-{entry.season.toLowerCase()}">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <Badge variant={seasonVariant(entry.liturgicalColor)}>{entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}</Badge>
        {#if entry.rank !== 'Feria'}
          <Badge variant="default" class="ml-2">{entry.rank}</Badge>
        {/if}
        <h2 class="mt-2 text-2xl font-serif font-semibold">{entry.title}</h2>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-6 h-6 rounded-full border-2 border-stone-300"
          style="background-color: {entry.liturgicalColor === 'Purple' ? '#6B3A8A' : entry.liturgicalColor === 'White' ? '#F5F0E8' : entry.liturgicalColor === 'Red' ? '#C0392B' : entry.liturgicalColor === 'Green' ? '#2D6A4F' : '#C2185B'}">
        </div>
        <span class="text-sm text-stone-500">{entry.liturgicalColor}</span>
      </div>
    </div>
  </div>

  <!-- Today's Lectionary Readings -->
  {#if readings.length > 0}
    <div class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h2 class="font-serif text-lg font-semibold text-stone-800">Today's Mass Readings</h2>
          <p class="text-xs text-stone-400 mt-0.5">{yearLabel}</p>
        </div>
        <a href="/lectionary" class="btn-secondary text-sm py-1.5 px-3">View all →</a>
      </div>
      <div class="space-y-2">
        {#each readings as reading}
          <a href="/bible/{reading.bookCode}/{reading.segments[0]?.chapterStart ?? 1}"
            class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-stone-50 transition-colors group">
            <div class="flex items-center gap-3">
              <span class="text-xs font-semibold uppercase tracking-wider text-stone-400 w-16 shrink-0">
                {reading.role === 'psalm' ? 'Psalm' :
                 reading.role === 'first' ? '1st Rdg' :
                 reading.role === 'second' ? '2nd Rdg' : 'Gospel'}
              </span>
              <span class="text-sm text-stone-700 group-hover:text-primary font-mono transition-colors">
                {reading.citation}
              </span>
            </div>
            <span class="text-stone-300 group-hover:text-primary transition-colors text-sm">›</span>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
    {#each [
      { href: '/lectionary', icon: '📜', label: 'Mass Readings' },
      { href: '/bible', icon: '📖', label: 'Read the Bible' },
      { href: '/liturgy/calendar', icon: '📅', label: 'Liturgical Calendar' },
      { href: '/study', icon: '✏️', label: 'My Study Notes' }
    ] as link}
      <a href={link.href} class="card p-4 text-center hover:border-primary/40 hover:shadow-md transition-all group">
        <div class="text-3xl mb-2">{link.icon}</div>
        <p class="text-sm font-medium text-stone-700 group-hover:text-primary transition-colors">{link.label}</p>
      </a>
    {/each}
  </div>
</div>
