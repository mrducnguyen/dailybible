<script lang="ts">
</script>

<svelte:head><title>Study — Daily Bible</title></svelte:head>

<div class="space-y-6">
  <h1>My Study</h1>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    {#each [
      { href: '/study/bookmarks', icon: '★', label: 'Bookmarks', description: 'Your saved verses' },
      { href: '/study/highlights', icon: '🖊', label: 'Highlights', description: 'Highlighted passages' },
      { href: '/study/notes', icon: '✏️', label: 'Notes', description: 'Your verse notes' }
    ] as item}
      <a href={item.href} class="card p-5 hover:border-primary/40 hover:shadow-md transition-all group">
        <div class="text-3xl mb-2">{item.icon}</div>
        <p class="font-medium text-stone-800 group-hover:text-primary">{item.label}</p>
        <p class="text-sm text-stone-500 mt-1">{item.description}</p>
      </a>
    {/each}
  </div>
  <p class="text-xs text-stone-400 text-center">All data stored locally on your device.</p>
</div>
