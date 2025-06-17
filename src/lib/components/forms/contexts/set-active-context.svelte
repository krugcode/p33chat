<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { SetContextFormSchema } from './_schemas';
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import * as Form from '$lib/components/ui/form';
	import { Album } from '@lucide/svelte';

	let { superform, contextsList, currentContext } = $props();

	let isSubmitting = $state(false);
	let showLoading = $state(false);

	const form = superForm(superform, {
		clearOnSubmit: 'errors',
		resetForm: false,
		validators: zodClient(SetContextFormSchema),

		onSubmit: () => {
			showLoading = true;
			validateForm({ update: true });
		},
		onUpdate: async ({ result }) => {
			showLoading = false;
			isSubmitting = false;
			console.log('FORM RESULT', result);
			if (result.type === 'success') {
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			console.log('Error changing context:', e);
		}
	});
	const { form: formData, enhance, validateForm } = form;

	$effect(() => {
		if ($formData.active && !isSubmitting && $formData.active !== $formData.original) {
			isSubmitting = true;
			form.submit();
		}
	});
	$effect(() => {
		if (currentContext?.id && $formData.active !== currentContext.id) {
			// Make sure the context exists in the list before setting it
			const contextExists = contextsList.some((c) => c.value === currentContext.id);

			if (contextExists) {
				form.reset({
					data: {
						active: currentContext.id,
						original: currentContext.id
					}
				});
			} else {
				console.warn('🚨 Current context not found in contextsList:', currentContext.id);
			}
		}
	});
</script>

<form class="w-full" method="POST" action={`/contexts/${$formData.active}?/setActive`} use:enhance>
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
