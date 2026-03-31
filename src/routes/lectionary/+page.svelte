<script lang="ts">
  import type { PageData } from './$types';
  import type { LectionaryReading, ScriptureVerse } from '$lib/types';
  import Badge from '$lib/components/ui/Badge.svelte';
  import Spinner from '$lib/components/ui/Spinner.svelte';
  import EmptyState from '$lib/components/ui/EmptyState.svelte';
  import { seasonVariant, formatDate } from '$lib/utils';
  import { scriptureDb } from '$lib/db/scripture';
  import { browser } from '$app/environment';
  import { lang } from '$lib/stores/language';

  let { data } = $props<{ data: PageData }>();

  const entry = $derived(data.entry);
  const readings = $derived(data.dayReadings?.readings ?? []);

  type LoadedReading = { verses: ScriptureVerse[] } | null;
  let loadedReadings: LoadedReading[] = $state([]);
  let versesLoaded: boolean = $state(false);

  $effect(() => {
    if (!browser || readings.length === 0) {
      loadedReadings = [];
      versesLoaded = false;
      return;
    }
    versesLoaded = false;
    const current = readings;
    Promise.all(
      current.map(async (reading: LectionaryReading): Promise<LoadedReading> => {
        try {
          const allVerses: ScriptureVerse[] = [];
          for (const seg of reading.segments) {
            const verses = await scriptureDb.getVerseRange(
              reading.bookCode,
              seg.chapterStart,
              seg.verseStart,
              seg.chapterEnd,
              seg.verseEnd
            );
            allVerses.push(...verses);
          }
          return { verses: allVerses };
        } catch {
          return null;
        }
      })
    ).then(results => {
      if (current === readings) {
        loadedReadings = results;
        versesLoaded = true;
      }
    });
  });

  const roleIcon: Record<string, string> = {
    first: '✦', psalm: '♪', second: '✦', gospel: '✝',
  };

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

<svelte:head>
  <title>Mass Readings — Daily Bible</title>
</svelte:head>

<div class="space-y-6">
  <div>
    <p class="text-sm text-stone-500 uppercase tracking-wide">{formatDate(data.date)}</p>
    <h1 class="mt-1 text-3xl font-serif font-bold text-primary">Mass Readings</h1>
    <p class="mt-0.5 text-stone-500 text-sm italic">Roman Rite Lectionary for Mass</p>
  </div>

  <!-- Liturgical context -->
  <div class="card p-5 season-{entry.season.toLowerCase()}">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <div>
        <div class="flex flex-wrap gap-2">
          <Badge variant={seasonVariant(entry.liturgicalColor)}>
            {entry.season.replace('OrdinaryTime','Ordinary Time').replace('HolyWeek','Holy Week')}
          </Badge>
          {#if entry.rank !== 'Feria'}
            <Badge variant="default">{entry.rank}</Badge>
          {/if}
          <Badge variant="default">{data.yearLabel}</Badge>
        </div>
        <p class="mt-2 font-serif text-lg font-semibold text-stone-800">{entry.title}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-5 h-5 rounded-full border border-stone-300"
          style="background-color: {
            entry.liturgicalColor === 'Purple' ? '#6B3A8A' :
            entry.liturgicalColor === 'White'  ? '#F5F0E8' :
            entry.liturgicalColor === 'Red'    ? '#C0392B' :
            entry.liturgicalColor === 'Green'  ? '#2D6A4F' : '#C2185B'
          }">
        </div>
        <span class="text-sm text-stone-500">{entry.liturgicalColor}</span>
      </div>
    </div>
  </div>

  <!-- Readings list -->
  {#if readings.length === 0}
    <EmptyState
      title="No readings assigned"
      description="Lectionary data covers Sundays, solemnities, and Holy Week. Ordinary weekday readings are not yet included."
      icon="✝"
    />
  {:else}
    <div class="space-y-4">
      {#each readings as reading, i (reading.role + i)}
        <div class="card p-0 overflow-hidden border-l-4 {roleColor[reading.role] ?? 'border-l-stone-300'}">
          <div class="p-4">
            <!-- Header: role label + citation -->
            <div class="flex flex-wrap items-baseline justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="text-stone-400 text-sm select-none">{roleIcon[reading.role] ?? '•'}</span>
                <span class="text-xs font-semibold uppercase tracking-wider text-stone-500">
                  {reading.label}
                </span>
              </div>
              <span class="text-sm font-medium text-stone-700 font-mono">{reading.citation}</span>
            </div>

            <!-- Verses -->
            {#if !browser}
              <!-- SSR: nothing -->
            {:else if versesLoaded && loadedReadings[i]?.verses.length}
              <p class="mt-3 text-stone-800 leading-relaxed text-[0.9375rem]">
                {#each loadedReadings[i]!.verses as verse}
                  <sup class="text-[0.65rem] font-semibold text-stone-400 mr-[1px] select-none align-super">{verse.verseNumber}</sup>{$lang === 'latin' ? verse.textLatin : verse.textEnglish}{' '}
                {/each}
              </p>
            {:else if versesLoaded && !loadedReadings[i]?.verses.length}
              <p class="mt-3 text-sm text-stone-400 italic">Passage not found in database.</p>
            {:else if !versesLoaded}
              <div class="mt-3 flex items-center gap-2 text-stone-400 text-sm">
                <Spinner size="sm" />
                <span>Loading…</span>
              </div>
            {/if}
          </div>

          <div class="border-t border-stone-100 px-4 py-2.5 bg-stone-50/60 flex justify-end">
            <a href={chapterLink(reading)} class="btn-secondary text-xs py-1 px-3">
              Read chapter →
            </a>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="grid grid-cols-2 gap-3 pt-2">
    <a href="/liturgy/calendar" class="card p-4 text-center hover:border-primary/40 hover:shadow-md transition-all group">
      <div class="text-2xl mb-1">📅</div>
      <p class="text-sm font-medium text-stone-700 group-hover:text-primary transition-colors">Calendar</p>
    </a>
    <a href="/bible" class="card p-4 text-center hover:border-primary/40 hover:shadow-md transition-all group">
      <div class="text-2xl mb-1">📖</div>
      <p class="text-sm font-medium text-stone-700 group-hover:text-primary transition-colors">Bible</p>
    </a>
  </div>
</div>
