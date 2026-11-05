<script lang="ts">
  import { onMount } from 'svelte';
  import { verseLabel } from '$lib/highlights';
  import {
    addHighlight,
    noteTarget,
    notes,
    openNote,
    removeHighlightGroup,
    removeNote,
    saveNote,
    type SelectedSegment
  } from '$lib/stores/study';

  type Popover =
    | { kind: 'selection'; segments: SelectedSegment[]; x: number; y: number; below: boolean }
    | { kind: 'highlight'; groupId: string; verseId: string; x: number; y: number; below: boolean };

  const EDGE_MARGIN = 90;
  const HEADER_HEIGHT = 72;

  let popover = $state<Popover | null>(null);
  let popoverEl = $state<HTMLElement>();
  let dialog = $state<HTMLDialogElement>();
  let draft = $state('');
  const existingNote = $derived($notes.find(n => n.verseId === $noteTarget));

  let pointerDown = false;
  let selectionTimer: ReturnType<typeof setTimeout> | undefined;

  function offsetWithin(el: Element, node: Node, offset: number): number {
    const before = document.createRange();
    before.selectNodeContents(el);
    before.setEnd(node, offset);
    return before.toString().length;
  }

  /** Turn the browser selection into a character range per verse. */
  function selectedSegments(range: Range): SelectedSegment[] {
    const segments: SelectedSegment[] = [];
    for (const el of document.querySelectorAll<HTMLElement>('[data-verse-text]')) {
      // Search results are links, so they show highlights but don't start them.
      if (!range.intersectsNode(el) || el.closest('a')) continue;
      const verseText = el.textContent ?? '';
      let start = el.contains(range.startContainer) ? offsetWithin(el, range.startContainer, range.startOffset) : 0;
      let end = el.contains(range.endContainer) ? offsetWithin(el, range.endContainer, range.endOffset) : verseText.length;
      while (start < end && /\s/.test(verseText[start])) start++;
      while (end > start && /\s/.test(verseText[end - 1])) end--;
      if (end > start) {
        segments.push({ verseId: el.dataset.verseId!, lang: el.dataset.lang as SelectedSegment['lang'], start, end, verseText });
      }
    }
    return segments;
  }

  function placement(rect: DOMRect) {
    // On touch screens the system's copy/paste menu sits above the selection.
    const below = window.matchMedia('(pointer: coarse)').matches;
    const x = Math.min(window.innerWidth - EDGE_MARGIN, Math.max(EDGE_MARGIN, rect.left + rect.width / 2)) + window.scrollX;
    const y = below
      ? Math.min(rect.bottom, window.innerHeight - 56) + 10 + window.scrollY
      : Math.max(rect.top, HEADER_HEIGHT + 44) - 10 + window.scrollY;
    return { x, y, below };
  }

  function updateFromSelection() {
    if (pointerDown || $noteTarget) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) {
      if (popover?.kind === 'selection') popover = null;
      return;
    }
    const range = selection.getRangeAt(0);
    const segments = selectedSegments(range);
    const rects = range.getClientRects();
    const anchor = (window.matchMedia('(pointer: coarse)').matches ? rects[rects.length - 1] : rects[0]) ?? range.getBoundingClientRect();
    popover = segments.length ? { kind: 'selection', segments, ...placement(anchor) } : null;
  }

  function scheduleUpdate() {
    clearTimeout(selectionTimer);
    selectionTimer = setTimeout(updateFromSelection, 120);
  }

  function onPointerDown(event: PointerEvent) {
    if (!popoverEl?.contains(event.target as Node)) pointerDown = true;
  }

  function onPointerUp() {
    pointerDown = false;
    scheduleUpdate();
  }

  function onClick(event: MouseEvent) {
    const target = event.target as Element;
    if (popoverEl?.contains(target) || !window.getSelection()?.isCollapsed) return;
    const mark = target.closest<HTMLElement>('mark[data-highlight-group]');
    if (mark && !mark.closest('a')) {
      popover = {
        kind: 'highlight',
        groupId: mark.dataset.highlightGroup!,
        verseId: mark.dataset.highlightVerse!,
        ...placement(mark.getBoundingClientRect())
      };
    } else {
      popover = null;
    }
  }

  async function highlightSelection() {
    if (popover?.kind !== 'selection') return;
    const { segments } = popover;
    popover = null;
    window.getSelection()?.removeAllRanges();
    await addHighlight(segments);
  }

  async function removeHighlight() {
    if (popover?.kind !== 'highlight') return;
    const { groupId } = popover;
    popover = null;
    await removeHighlightGroup(groupId);
  }

  function addNote() {
    if (!popover) return;
    const verseId = popover.kind === 'selection' ? popover.segments[0].verseId : popover.verseId;
    popover = null;
    window.getSelection()?.removeAllRanges();
    openNote(verseId);
  }

  $effect(() => {
    if ($noteTarget && dialog && !dialog.open) {
      draft = $notes.find(n => n.verseId === $noteTarget)?.content ?? '';
      dialog.showModal();
    }
  });

  async function submitNote(event: SubmitEvent) {
    event.preventDefault();
    if (!$noteTarget || !draft.trim()) return;
    await saveNote($noteTarget, draft.trim());
    dialog?.close();
  }

  async function deleteNote() {
    if (existingNote) await removeNote(existingNote.id);
    dialog?.close();
  }

  onMount(() => {
    document.addEventListener('selectionchange', scheduleUpdate);
    return () => {
      document.removeEventListener('selectionchange', scheduleUpdate);
      clearTimeout(selectionTimer);
    };
  });
</script>

<svelte:document onpointerdown={onPointerDown} onpointerup={onPointerUp} onclick={onClick} />

{#if popover}
  <!-- Pressing a button must not clear the selection it acts on. -->
  <div
    bind:this={popoverEl}
    role="toolbar"
    aria-label="Text actions"
    tabindex="-1"
    data-study-popover
    class="absolute z-[60] flex items-center gap-1 rounded-lg bg-stone-900 p-1 text-sm text-white shadow-lg"
    style="left: {popover.x}px; top: {popover.y}px; transform: translate(-50%, {popover.below ? '0' : '-100%'})"
    onpointerdown={event => event.preventDefault()}
  >
    {#if popover.kind === 'selection'}
      <button class="rounded px-3 py-1.5 hover:bg-white/15 whitespace-nowrap" onclick={highlightSelection}>
        <span class="mr-1 inline-block h-2.5 w-2.5 rounded-full bg-yellow-300"></span>Highlight
      </button>
    {:else}
      <button class="rounded px-3 py-1.5 hover:bg-white/15 whitespace-nowrap" onclick={removeHighlight}>Remove highlight</button>
    {/if}
    <button class="rounded px-3 py-1.5 hover:bg-white/15 whitespace-nowrap" onclick={addNote}>✎ Note</button>
  </div>
{/if}

<dialog
  bind:this={dialog}
  class="w-[calc(100%-2rem)] max-w-lg rounded-lg p-0 shadow-xl backdrop:bg-black/40"
  onclose={() => noteTarget.set(null)}
>
  {#if $noteTarget}
    <form class="space-y-3 p-5" onsubmit={submitNote}>
      <h2 class="text-lg">Note on {verseLabel($noteTarget)}</h2>
      <!-- svelte-ignore a11y_autofocus -->
      <textarea
        bind:value={draft}
        rows="5"
        autofocus
        aria-label="Your note"
        placeholder="Write your note…"
        class="w-full rounded-md border border-stone-300 p-3 text-sm text-stone-800 focus:border-primary focus:outline-none"
      ></textarea>
      <p class="text-xs text-stone-500">Saved only in this browser. Clearing browser data deletes it.</p>
      <div class="flex items-center gap-2">
        {#if existingNote}
          <button type="button" class="text-sm text-red-700 hover:underline" onclick={deleteNote}>Delete</button>
        {/if}
        <div class="ml-auto flex gap-2">
          <button type="button" class="btn-secondary" onclick={() => dialog?.close()}>Cancel</button>
          <button type="submit" class="btn-primary disabled:opacity-50" disabled={!draft.trim()}>Save note</button>
        </div>
      </div>
    </form>
  {/if}
</dialog>
