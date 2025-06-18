<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Types } from '$lib';
	import { AddKeyFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import FormError from '$lib/components/form-error.svelte';
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import { page } from '$app/state';
	import type { ProvidersRecord } from '$lib/types/pocketbase-types';
	import { ClientEncryption, type EncryptedKeyData } from '$lib/crypto';

	let formLoading = $state(false);
	let { superform, onSuccess }: { superform: any; onSuccess?: (form: any) => void } = $props();

	let showLoading = $state(false);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);

	let providers = $derived(page.data.providers ?? ([] as ProvidersRecord[]));
	let salt = $derived(page.data.salt);
	let user = page.data.user;
	let providersList: Types.Generic.SelectionInput[] = $derived(
		providers.map((provider) => ({
			value: provider.id,
			label: provider.name,
			image: provider.logo ?? null
		}))
	);

	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(AddKeyFormSchema),
		clearOnSubmit: 'none',
		resetForm: false,
		onSubmit: async ({ cancel }) => {
			let generatedKey: EncryptedKeyData = {} as EncryptedKeyData;
			try {
				generatedKey = await ClientEncryption.encrypt($formData.apiKey, user, salt);
			} catch (e: any) {
				$errors.apiKey = [e];
				cancel();
			}
			if (!generatedKey?.encryptedKey) {
				$errors.apiKey = ['Something went wrong.'];
			}
			$formData.apiKey = generatedKey.encryptedKey;
			error = {} as Types.Generic.FormError;
			showLoading = true;

			validateForm({ update: true });
		},
		onUpdate: async ({ form }) => {
			showLoading = false;
			if (!form.valid && form?.message) {
				error.summary = form.message;
				return;
			}
			if (form.valid) {
				onSuccess?.(form);
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to add key';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, errors, enhance, validateForm } = form;
</script>

<div class="relative">
	<div class={showLoading ? 'absolute z-10 h-full w-full' : 'hidden'}>
		<StateIndicator show={showLoading} />
	</div>
	<form
		action="/providers?/addKey"
		method="POST"
		autocomplete="off"
		class={showLoading ? 'w-full blur-xs' : 'w-full'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4">
			<div class={'w-full flex-grow'}>
				<Form.Field {form} name={'provider'}>
					<Form.Control>
						{#snippet children()}
							<div class="flex flex-row justify-between">
								<Form.Label class="text-foreground/70 text-sm tracking-wider"
									>Select a Provider</Form.Label
								>
								<Form.FieldErrors />
							</div>
							<div class="mt-1">
								<Combobox selectionList={providersList} bind:value={$formData.provider} />
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<div class={'w-full flex-grow'}>
				<Form.Field {form} name="apiKey">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-row justify-between">
								<Form.Label class="text-foreground/70 text-sm   tracking-wider">API Key</Form.Label>

								<Form.FieldErrors />
							</div>
							<div class="mt-1 flex flex-row gap-3">
								<Input
									type={'password'}
									placeholder="Paste your key"
									autocomplete="off"
									{...props}
									bind:value={$formData.apiKey}
								/>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<div class="grid w-full grid-cols-1 justify-center gap-5">
				<Button class="w-full" disabled={formLoading} type="submit">Create Your Key</Button>
			</div>
			<div class="flex w-full flex-row justify-center gap-5">
				{#if error.summary}
					<FormError summary={error.summary} debug={error.debug} />
				{/if}
			</div>
		</div>
	</form>
</div>
