<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Types } from '$lib';
	import { ChatFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import FormError from '$lib/components/form-error.svelte';
	import { Send } from '@lucide/svelte';

	let formLoading = $state(false);
	let { superform, onSuccess }: { superform: any; onSuccess?: (form: any) => {} } = $props();

	let showLoading = $state(false);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(ChatFormSchema),
		clearOnSubmit: 'none',
		resetForm: false,
		onSubmit: () => {
			error = {} as Types.Generic.FormError;
			showLoading = true;
			validateForm({ update: true });
		},
		onUpdate: async ({ form }) => {
			console.log('form', form);
			showLoading = false;
			if (!form.valid && form?.message) {
				error.summary = form.message;
				return;
			}
			if (form.valid) {
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to request a password reset';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, enhance, validateForm } = form;
</script>

<div class="relative">
	<div class={showLoading ? 'absolute z-10 h-full w-full' : 'hidden'}>
		<StateIndicator show={showLoading} />
	</div>
	<form
		action="/forgot-password?"
		autocomplete="off"
		method="POST"
		class={showLoading ? 'w-full blur-xs' : 'w-full'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4">
			<div class="flex w-full flex-row justify-center gap-5">
				<div class={'w-full flex-row'}>
					<Form.Field {form} name={'text'}>
						<Form.Control>
							{#snippet children({ props })}
								<Input
									type="text"
									placeholder="Chat to your homie"
									autocomplete="off"
									{...props}
									bind:value={$formData.email}
								/>
							{/snippet}
						</Form.Control>
					</Form.Field>
				</div>
				<Button type="submit" size="icon">
					<Send />
				</Button>
			</div>
		</div>
	</form>
</div>
