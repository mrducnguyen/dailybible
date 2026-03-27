<script lang="ts">
  import type { PageData } from './$types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { seasonVariant, formatDate } from '$lib/utils';

  let { data } = $props<{ data: PageData }>();
  const entry = $derived(data.entry);
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

  <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8">
    {#each [
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
