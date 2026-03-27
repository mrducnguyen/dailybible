<script lang="ts">
  import type { Snippet } from 'svelte';

  let { variant = 'default', class: cls = '', children }: {
    variant?: 'default' | 'purple' | 'gold' | 'green' | 'red' | 'rose';
    class?: string;
    children?: Snippet;
  } = $props();

  const variants: Record<string, string> = {
    default: 'bg-stone-100 text-stone-700',
    purple: 'bg-purple-100 text-purple-800',
    gold: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800',
    rose: 'bg-pink-100 text-pink-800'
  };
</script>

<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {variants[variant]} {cls}">
  {@render children?.()}
</span>
