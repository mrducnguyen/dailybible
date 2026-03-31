<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';
  import SearchBox from '$lib/components/SearchBox.svelte';

  let { children }: { children: Snippet } = $props();
  let mobileOpen = $state(false);

  const navLinks = [
    { href: '/', label: 'Today', icon: '✝' },
    { href: '/lectionary', label: 'Readings', icon: '📜' },
    { href: '/bible', label: 'Bible', icon: '📖' },
    { href: '/liturgy/calendar', label: 'Calendar', icon: '📅' },
    { href: '/study', label: 'Study', icon: '✏️' }
  ];
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-primary text-white shadow-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center h-14 md:h-16 gap-2 md:gap-4">
        <!-- Left: logo + search -->
        <div class="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
          <a href="/" class="flex items-center gap-1.5 font-serif font-bold text-white hover:text-yellow-200 transition-colors flex-shrink-0">
            <span class="text-xl md:text-2xl">☩</span>
            <span class="hidden md:inline text-xl">Daily Bible</span>
          </a>
          <SearchBox />
        </div>
        <!-- Right: nav + mobile button (never moves) -->
        <div class="flex items-center gap-1 flex-shrink-0">
          <nav class="hidden md:flex items-center gap-1">
            {#each navLinks as link}
              <a
                href={link.href}
                class="flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  {$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href + '/') && link.href !== '/')
                    ? 'bg-white/20 text-white'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'}"
              >
                <span>{link.icon}</span> {link.label}
              </a>
            {/each}
          </nav>
          <button class="md:hidden text-white p-2" onclick={() => (mobileOpen = !mobileOpen)}>
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {#if mobileOpen}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              {:else}
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              {/if}
            </svg>
          </button>
        </div>
      </div>
      {#if mobileOpen}
        <div class="md:hidden pb-3 border-t border-white/20 mt-1 pt-2">
          {#each navLinks as link}
            <a href={link.href} onclick={() => (mobileOpen = false)}
              class="flex items-center gap-2 px-3 py-2.5 text-sm text-white/90 hover:bg-white/10 rounded-md">
              <span>{link.icon}</span> {link.label}
            </a>
          {/each}
        </div>
      {/if}
    </div>
  </header>
  <main class="flex-1 max-w-6xl mx-auto w-full px-4 py-6">
    {@render children()}
  </main>
  <footer class="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
    <p>Daily Bible — <em>Pray, Called Ones</em></p>
    <p class="mt-1 text-xs">Roman Rite • Clementine Vulgate • Douay-Rheims • Offline-first</p>
  </footer>
</div>
