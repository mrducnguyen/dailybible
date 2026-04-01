<script lang="ts">
  import type { PageData } from './$types';
  import type { LiturgicalCalendarEntry } from '$lib/types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { seasonVariant } from '$lib/utils';
  import { getCalendarEntry } from '$lib/db/liturgy';
  import { onMount } from 'svelte';

  let { data } = $props<{ data: PageData }>();

  const CHUNK = 60; // days loaded per extension

  function isoOffset(baseIso: string, days: number): string {
    const d = new Date(baseIso + 'T00:00:00');
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  function buildRange(startIso: string, count: number): LiturgicalCalendarEntry[] {
    const result: LiturgicalCalendarEntry[] = [];
    for (let i = 0; i < count; i++) {
      const d = new Date(startIso + 'T00:00:00');
      d.setDate(d.getDate() + i);
      result.push(getCalendarEntry(d));
    }
    return result;
  }

  // Initial window: 60 days before today through 120 days after
  const INITIAL_BEFORE = 60;
  const INITIAL_AFTER  = 120;
  const startIso = isoOffset(data.todayIso, -INITIAL_BEFORE);

  let entries: LiturgicalCalendarEntry[] = $state(
    buildRange(startIso, INITIAL_BEFORE + 1 + INITIAL_AFTER)
  );

  // Track the ISO dates at the edges so we know where to extend
  let headIso: string = $state(entries[0].date);
  let tailIso: string = $state(entries[entries.length - 1].date);

  // DOM refs
  let topSentinel: HTMLElement | undefined = $state();
  let bottomSentinel: HTMLElement | undefined = $state();
  let todayEl: HTMLElement | undefined = $state();

  // Svelte action: capture the element for whichever entry is today
  function anchorToday(node: HTMLElement, isToday: boolean) {
    if (isToday) todayEl = node;
    return {
      update(nowToday: boolean) { if (nowToday) todayEl = node; },
      destroy() { if (todayEl === node) todayEl = undefined; },
    };
  }

  onMount(() => {
    // Scroll today to the top of the viewport
    todayEl?.scrollIntoView({ block: 'start', behavior: 'instant' });

    const observer = new IntersectionObserver(async (changes) => {
      for (const change of changes) {
        if (!change.isIntersecting) continue;

        if (change.target === topSentinel) {
          // Prepend CHUNK days above the current top
          const newStart = isoOffset(headIso, -CHUNK);
          const newEntries = buildRange(newStart, CHUNK);

          // Compensate scroll position so the visible content doesn't jump
          const prevHeight = document.documentElement.scrollHeight;
          const prevTop    = window.scrollY;
          entries  = [...newEntries, ...entries];
          headIso  = entries[0].date;

          // Wait one frame for the DOM to update, then restore position
          requestAnimationFrame(() => {
            window.scrollTo(0, prevTop + (document.documentElement.scrollHeight - prevHeight));
          });
        }

        if (change.target === bottomSentinel) {
          // Append CHUNK days below the current tail
          const newStart = isoOffset(tailIso, 1);
          const newEntries = buildRange(newStart, CHUNK);
          entries = [...entries, ...newEntries];
          tailIso = entries[entries.length - 1].date;
        }
      }
    }, { rootMargin: '400px' });

    if (topSentinel)    observer.observe(topSentinel);
    if (bottomSentinel) observer.observe(bottomSentinel);

    return () => observer.disconnect();
  });

  function colorHex(color: string): string {
    if (color === 'Purple') return '#6B3A8A';
    if (color === 'White')  return '#D4AF37';
    if (color === 'Red')    return '#C0392B';
    if (color === 'Green')  return '#2D6A4F';
    return '#C2185B'; // Rose
  }

  // Build a parallel array noting which entry starts a new month
  function monthHeaders(list: LiturgicalCalendarEntry[]): (string | null)[] {
    let prev = '';
    return list.map(e => {
      const key = e.date.slice(0, 7); // 'yyyy-mm'
      if (key === prev) return null;
      prev = key;
      const d = new Date(e.date + 'T00:00:00');
      return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    });
  }

  const headers = $derived(monthHeaders(entries));
</script>

<svelte:head><title>Liturgical Calendar — Daily Bible</title></svelte:head>

<div class="space-y-1">
  <div class="flex items-center justify-between pb-3 sticky top-16 bg-stone-50/95 backdrop-blur z-10 pt-2">
    <h1 class="text-xl font-serif font-bold text-primary">Liturgical Calendar</h1>
    <button
      class="btn-secondary text-sm py-1.5 px-3"
      onclick={() => todayEl?.scrollIntoView({ block: 'start', behavior: 'smooth' })}
    >
      Jump to today
    </button>
  </div>

  <!-- Top sentinel — triggers prepend when scrolled into view -->
  <div bind:this={topSentinel} class="h-px" aria-hidden="true"></div>

  {#each entries as entry, i (entry.date)}
    {@const isToday = entry.date === data.todayIso}
    {@const label = headers[i]}

    {#if label}
      <p class="text-xs font-semibold uppercase tracking-widest text-stone-400 pt-4 pb-1 px-1">{label}</p>
    {/if}

    <a
      href="/liturgy/{entry.date}"
      use:anchorToday={isToday}
      class="card p-3 flex items-center gap-3 hover:border-primary/40 transition-all
             {isToday ? 'border-primary/60 bg-primary/5 shadow-sm' : ''}"
    >
      <div class="text-center w-10 shrink-0">
        <p class="text-xs text-stone-400">
          {new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })}
        </p>
        <p class="text-lg font-bold {isToday ? 'text-primary' : 'text-stone-800'}">
          {new Date(entry.date + 'T00:00:00').getDate()}
        </p>
      </div>

      <div class="w-3 h-3 rounded-full shrink-0" style="background-color: {colorHex(entry.liturgicalColor)}"></div>

      <div class="flex-1 min-w-0">
        <p class="text-sm font-medium text-stone-800 truncate">
          {#if isToday}<span class="text-primary font-semibold">Today — </span>{/if}{entry.title}
        </p>
        <p class="text-xs text-stone-500">
          {entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}
        </p>
      </div>

      {#if entry.rank !== 'Feria'}
        <Badge variant={seasonVariant(entry.liturgicalColor)}>{entry.rank}</Badge>
      {/if}
    </a>
  {/each}

  <!-- Bottom sentinel — triggers append when scrolled into view -->
  <div bind:this={bottomSentinel} class="h-px" aria-hidden="true"></div>
</div>
