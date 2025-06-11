<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Types } from '$lib';
	import { ForgotPasswordFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import FormError from '$lib/components/form-error.svelte';

	let formLoading = $state(false);
	let { superform, onSuccess }: { superform: any; onSuccess?: (form: any) => {} } = $props();

	let showLoading = $state(false);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(ForgotPasswordFormSchema),
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
		method="POST"
		class={showLoading ? 'w-full blur-xs' : 'w-full'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4">
			<div class={'w-full flex-grow'}>
				<Form.Field {form} name={'email'}>
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-row justify-between">
								<Form.Label class="text-foreground/70 text-sm tracking-wider"
									>Email Address</Form.Label
								>
								<Form.FieldErrors />
							</div>
							<div class="mt-1">
								<Input
									type="email"
									placeholder="Enter your email address"
									autocomplete="email"
									{...props}
									bind:value={$formData.email}
								/>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>

			<div class="grid w-full grid-cols-1 justify-center gap-5">
				<Button disabled={formLoading} type="submit">Request a Password Reset</Button>
			</div>
			<div class="flex w-full flex-row justify-center gap-5">
				{#if error.summary}
					<FormError summary={error.summary} debug={error.debug} />
				{/if}
			</div>
		</div>
	</form>
</div>
