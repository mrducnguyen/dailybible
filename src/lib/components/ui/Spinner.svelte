<script lang="ts">
  let { size = 'md', class: cls = '' }: { size?: 'sm' | 'md' | 'lg'; class?: string } = $props();
  const sizes: Record<string, string> = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };
</script>

<div class="flex items-center justify-center {cls}">
  <div class="animate-spin rounded-full border-2 border-stone-200 border-t-primary {sizes[size]}"></div>
</div>
