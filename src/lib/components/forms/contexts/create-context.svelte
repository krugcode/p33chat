<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { fileProxy, superForm } from 'sveltekit-superforms';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { CreateContextFormSchema } from './_schemas';

	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import { Button } from '$lib/components/ui/button';
	import FormError from '$lib/components/form-error.svelte';
	import { Types } from '$lib';
	import FileInput from '$lib/components/ui/file-input/file-input.svelte';

	let { superform, onSuccess } = $props();
	let showLoading = $state(false);

	let formLoading = $state(false);
	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		clearOnSubmit: 'errors',

		validators: zodClient(CreateContextFormSchema),
		onSubmit: () => {
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
				onSuccess(form);
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message.toString() ?? 'Unable to add key';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, enhance, validateForm } = form;
	const file = fileProxy(form, 'logo');
</script>

<div class="relative">
	<div class={showLoading ? 'absolute z-10 h-full w-full' : 'hidden'}>
		<StateIndicator show={showLoading} />
	</div>
	<form class="w-full" method="POST" action={`/contexts`} use:enhance enctype="multipart/form-data">
		<div class={'w-full flex-grow'}>
			<Form.Field {form} name="name">
				<Form.Control>
					{#snippet children({ props })}
						<div class="flex flex-row justify-between">
							<Form.Label class="text-foreground/70 text-sm   tracking-wider">Name</Form.Label>
							<Form.FieldErrors />
						</div>
						<div class="mt-1 flex flex-row gap-3">
							<Input
								type={'name'}
								placeholder="Like 'Schoolwork'"
								autocomplete="off"
								{...props}
								bind:value={$formData.name}
							/>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>
		<div class={'mt-3 w-full flex-grow'}>
			<Form.Field {form} name="logo">
				<Form.Control>
					{#snippet children()}
						<div class="flex flex-row justify-between">
							<Form.Label class="text-foreground/70 text-sm   tracking-wider">Icon</Form.Label>
							<Form.FieldErrors />
						</div>
						<div class="mt-1 flex flex-row gap-3">
							<FileInput
								bind:files={$file}
								name="logo"
								acceptedTypes={['image/png', 'image/jpeg', 'image/webp']}
								maxSize={5 * 1024 * 1024}
								maxFiles={1}
								dragDropText="Choose a logo or drag & drop"
								showPreview={true}
								variant="compact"
							/>
						</div>
					{/snippet}
				</Form.Control>
			</Form.Field>
		</div>
		<div class="mt-3 grid w-full grid-cols-1 justify-center gap-5 md:grid-cols-2">
			<Button disabled={formLoading} type="submit">Create Context</Button>
		</div>
		<div class="flex w-full flex-row justify-center gap-5">
			{#if error.summary}
				<FormError summary={error.summary} debug={error.debug} />
			{/if}
		</div>
	</form>
</div>
