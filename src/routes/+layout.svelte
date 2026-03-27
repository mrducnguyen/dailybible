<script lang="ts">
  import '../app.css';
  import type { Snippet } from 'svelte';
  import { page } from '$app/stores';

  let { children }: { children: Snippet } = $props();
  let mobileOpen = $state(false);

  const navLinks = [
    { href: '/', label: 'Today', icon: '✝' },
    { href: '/bible', label: 'Bible', icon: '📖' },
    { href: '/liturgy/calendar', label: 'Calendar', icon: '📅' },
    { href: '/study', label: 'Study', icon: '✏️' }
  ];
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-primary text-white shadow-md sticky top-0 z-50">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <a href="/" class="flex items-center gap-2 font-serif text-xl font-bold text-white hover:text-yellow-200 transition-colors">
          <span class="text-2xl">☩</span> Daily Bible
        </a>
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
