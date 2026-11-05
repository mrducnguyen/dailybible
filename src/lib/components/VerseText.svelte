<script lang="ts">
  import { splitVerseText } from '$lib/highlights';
  import { lang, type Lang } from '$lib/stores/language';
  import { highlights, notes, openNote } from '$lib/stores/study';
  import type { ScriptureVerse } from '$lib/types';

  let { verse, language, showNote = true }: { verse: ScriptureVerse; language?: Lang; showNote?: boolean } = $props();

  const active = $derived(language ?? $lang);
  const parts = $derived(
    splitVerseText(
      active === 'latin' ? verse.textLatin : verse.textEnglish,
      $highlights.filter(h => h.verseId === verse.id && h.lang === active)
    )
  );
  const hasNote = $derived(showNote && $notes.some(n => n.verseId === verse.id));
</script>

<!-- No whitespace inside this span: selection offsets are measured against its text. -->
<span data-verse-text data-verse-id={verse.id} data-lang={active}>{#each parts as part}{#if part.highlight}<mark data-highlight-group={part.highlight.groupId} data-highlight-verse={verse.id} class="bg-yellow-200 text-inherit rounded-sm cursor-pointer">{part.text}</mark>{:else}{part.text}{/if}{/each}</span>{#if hasNote}<button class="ml-1 not-italic text-amber-600 hover:text-primary" title="View note" aria-label="View note" onclick={() => openNote(verse.id)}>✎</button>{/if}
