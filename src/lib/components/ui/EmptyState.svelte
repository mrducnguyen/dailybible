<script lang="ts">
  let { title, description, icon = '📖' } = $props<{
    title: string;
    description?: string;
    icon?: string;
  }>();
</script>

<div class="text-center py-12">
  <div class="text-5xl mb-4">{icon}</div>
  <h3 class="text-lg font-medium text-stone-700">{title}</h3>
  {#if description}
    <p class="mt-2 text-sm text-stone-500">{description}</p>
  {/if}
</div>
