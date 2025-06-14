<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { SetContextFormSchema } from './_schemas';
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Album } from '@lucide/svelte';

	let { superform, contextsList } = $props();
	let showLoading = $state(false);

	const form = superForm(superform, {
		clearOnSubmit: 'errors',

		validators: zodClient(SetContextFormSchema),
		onSubmit: () => {
			showLoading = true;
			validateForm({ update: true });
		},
		onUpdate: async ({ result }) => {
			showLoading = false;

			if (result.data.success) {
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			console.log('Error changing context:', e);
		}
	});
	const { form: formData, enhance, validateForm } = form;
</script>

<form class="w-full" method="POST" action={`/context/${$formData.active}?/setActive`} use:enhance>
	<Form.Field {form} name={'active'}>
		<Form.Control>
			{#snippet children()}
				<Combobox
					placeholder="Select a context"
					fallbackIcon={Album}
					selectionList={contextsList}
					bind:value={$formData.active}
				/>
			{/snippet}
		</Form.Control>
	</Form.Field>

	<Form.Field {form} name={'original'}>
		<input class="hidden" bind:value={$formData.original} />
	</Form.Field>
</form>
