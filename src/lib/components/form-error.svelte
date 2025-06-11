<script lang="ts">
	import type { Types } from '$lib';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { Frown } from '@lucide/svelte';

	let data: Types.Generic.FormError = $props();
	let title: string = $derived(data.title);
	let message: string = $derived(data.message);
</script>

<Accordion.Root type="single" class=" w-full rounded-md bg-red-300 px-5">
	<Accordion.Item value="item-1">
		<Accordion.Trigger class="items-center hover:cursor-pointer hover:no-underline "
			><div class="flex items-center gap-2">
				<Frown /><span class="font-bold">{title}</span>
			</div>
			<span class="rounded-sm bg-white px-3 py-2 text-xs">Click for debug</span></Accordion.Trigger
		>
		<Accordion.Content>{message}</Accordion.Content>
	</Accordion.Item>
</Accordion.Root>
