<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Input } from '$lib/components/ui/input';
	import { Types } from '$lib';
	import { LoginFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import Eye from '@lucide/svelte/icons/eye';
	import EyeOff from '@lucide/svelte/icons/eye-off';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import FormError from '$lib/components/form-error.svelte';

	let formLoading = $state(false);
	let { superform, onSuccess }: { superform: any; onSuccess?: (form: any) => {} } = $props();

	let showPassword = $state(false);
	let showLoading = $state(false);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(LoginFormSchema),
		clearOnSubmit: 'none',
		resetForm: false,
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
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to log in';
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
		action="/login?"
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
			<div class={'w-full flex-grow'}>
				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<div class="flex flex-row justify-between">
								<Form.Label class="text-foreground/70 text-sm   tracking-wider">Password</Form.Label
								>
								<Form.FieldErrors />
							</div>
							<div class="mt-1 flex flex-row gap-3">
								<Input
									type={showPassword ? 'text' : 'password'}
									placeholder="Enter your password"
									autocomplete="current-password"
									{...props}
									bind:value={$formData.password}
								/>
								<Button
									disabled={formLoading}
									variant="default"
									size="icon"
									onclick={() => (showPassword = !showPassword)}
								>
									{#if !showPassword}
										<Eye />
									{:else}
										<EyeOff />
									{/if}
								</Button>
							</div>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<div class="grid w-full grid-cols-1 justify-center gap-5 md:grid-cols-2">
				<Button href="/forgot-password" variant="secondary">Forgot Your Password?</Button>
				<Button disabled={formLoading} type="submit">Login</Button>
			</div>
			<div class="flex w-full flex-row justify-center gap-5">
				{#if error.summary}
					<FormError summary={error.summary} debug={error.debug} />
				{/if}
			</div>
		</div>
	</form>
</div>
