<script lang="ts">
	import type { Types } from '$lib';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Frown } from '@lucide/svelte';

	let data: Types.Generic.FormError = $props();
	let summary: string = $derived(data.summary);
	let debug: string = $derived(data.debug ?? '');
</script>

<Accordion.Root
	disabled={debug.length === 0}
	type="single"
	class=" w-full rounded-md bg-red-100 px-5"
>
	<Accordion.Item value="item-1">
		<Accordion.Trigger class="items-center hover:cursor-pointer hover:no-underline "
			><div class="flex items-center gap-2">
				<Frown /><span class="font-bold">{summary}</span>
			</div>
			{#if debug}
				<span class="rounded-sm bg-white px-3 py-2 text-xs">Click for debug</span>
			{/if}
		</Accordion.Trigger>
		{#if debug}
			<Accordion.Content>{debug}</Accordion.Content>
		{/if}
	</Accordion.Item>
</Accordion.Root>
