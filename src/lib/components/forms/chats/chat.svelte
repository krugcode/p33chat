<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Types } from '$lib';
	import { ChatFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { buttonVariants } from '$lib/components/ui/button/index.js';

	import * as Popover from '$lib/components/ui/popover/index.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import { CirclePlus, Sparkles, X } from '@lucide/svelte';
	import { cn, DateTimeFormat } from '$lib/utils';
	import {
		ConvertToSelectList,
		DetectContentType,
		FormatFileSize,
		GenerateFileName,
		GetFileIcon,
		LONG_PASTE_THRESHOLD
	} from './chat-helpers';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { page } from '$app/state';
	import Combobox from '$lib/components/ui/combobox/combobox.svelte';
	import { Providers } from '..';
	import { toast } from 'svelte-sonner';
	import { onMount, tick } from 'svelte';

	let {
		superform,
		onSuccess,
		chatID
	}: { superform: any; onSuccess?: (form: any) => {}; chatID?: string } = $props();

	const isMobile = new IsMobile();

	let data = $derived(page.data);
	let { messages, salt, addKeySuperform, currentContext, userProviders, providers, models } =
		$derived(data);

	let textareaRef: HTMLTextAreaElement;
	let showLoading = $state(false);

	let attachments = $state<
		Array<{
			id: string;
			name: string;
			content: string;
			size: number;
			type: 'text' | 'code' | 'json' | 'html' | 'url';
			lines: number;
		}>
	>([]);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(ChatFormSchema),
		clearOnSubmit: 'none',
		resetForm: true,
		onSubmit: () => {
			$formData.timeSent = DateTimeFormat();
			error = {} as Types.Generic.FormError;
			showLoading = true;

			validateForm({ update: true });
		},
		onUpdate: async ({ form }) => {
			console.log('form', form);
			showLoading = false;
			if (!form.valid && form?.message) {
				toast(form.message);
				return;
			}
			if (form.valid) {
				attachments = [];
				await invalidateAll();
				await tick();
				resetAndFocusTextarea();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to request a password reset';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, enhance, validateForm } = form;

	$effect(() => {
		if (attachments.length > 0) {
			$formData.attachments = attachments;
		} else {
			$formData.attachments = [];
		}
	});
	onMount(() => {
		textareaRef?.focus();
	});
	function autoResize(e: any) {
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}
	function handlePaste(e: ClipboardEvent) {
		const pastedText = e.clipboardData?.getData('text') || '';

		if (pastedText.length > LONG_PASTE_THRESHOLD) {
			e.preventDefault();

			const contentType = DetectContentType(pastedText);
			const attachment = {
				id: crypto.randomUUID(),
				name: GenerateFileName(pastedText, contentType),
				content: pastedText,
				size: pastedText.length,
				type: contentType,
				lines: pastedText.split('\n').length
			};

			attachments = [...attachments, attachment];
		}
	}
	function handleKeyDown(e: KeyboardEvent) {
		// ctrl+enter or cmd+enter to submit
		if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
			e.preventDefault();

			// only submit if there's content or attachments
			if ($formData.message?.trim() || attachments.length > 0) {
				// trigger form submission
				form.submit();
			}
		}
	}
	function resetAndFocusTextarea() {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = '32px';
			textareaRef.focus();
		}
	}
	function removeAttachment(id: string) {
		attachments = attachments.filter((att) => att.id !== id);
	}
	let getModelsFromProvider = $derived(() => {
		const userProvider = userProviders.find(
			(userProvider: any) => userProvider.provider.id === $formData.provider
		);

		if (!userProvider) return [];

		// extract unique models
		let models = userProvider.provider.providerModelFeaturesJunction_via_provider
			.map((junction) => junction.model)
			.filter(
				(model, index, array) =>
					//remove dupes
					array.findIndex((m) => m.id === model.id) === index
			);

		return models;
	});

	let addKeyPopupIsOpen = $state(false);
	let modelsList = $derived(ConvertToSelectList('models', getModelsFromProvider(), 'id', 'name'));
	let providersList = $derived(
		ConvertToSelectList('providers', userProviders, 'provider.id', 'provider.name', 'provider.logo')
	);

	let buttonText = $derived(() => {
		const providerName =
			providersList?.find((provider) => provider.value === $formData.provider)?.label ??
			'No Provider';
		const modelName =
			modelsList?.find((model) => model.value === $formData.model)?.label ?? 'No Model';

		return `${providerName}, ${modelName}`;
	});

	function handleKeyCreate(form: any) {
		toast(form.message);
		$formData.provider = form.data.provider;
		addKeyPopupIsOpen = false;
	}

	const AddProviderForm = Providers.Forms.AddProvider;
</script>

{#snippet fileIcon(type: string)}
	{@const IconComponent = GetFileIcon(type)}
	<IconComponent class="h-4 w-4 flex-shrink-0 text-blue-600" />
{/snippet}
<div class="relative z-5">
	<div class={showLoading ? 'absolute z-10 h-full w-full' : 'hidden'}>
		<StateIndicator show={showLoading} />
	</div>
	<form
		action={chatID ? `/chat/${chatID}?/sendMessage` : '/chat?/chatInit'}
		autocomplete="off"
		method="POST"
		class={showLoading ? ' w-full bg-white blur-xs' : 'w-full bg-white'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4 rounded-lg border p-3">
			{#if attachments.length > 0}
				<div
					class="grid auto-rows-min grid-cols-2 items-center gap-2 border-b pb-3 md:grid-cols-3 lg:grid-cols-6"
				>
					{#each attachments as attachment (attachment.id)}
						<div class="bg-background border-border flex items-center gap-2 rounded-md border p-2">
							{@render fileIcon(attachment.type)}
							<div class="min-w-0 flex-1">
								<div class="text-foreground truncate text-xs font-medium">
									{attachment.name}
								</div>
								<div class="text-muted-foreground text-xs">
									{FormatFileSize(attachment.size)} • {attachment.lines} lines
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onclick={() => removeAttachment(attachment.id)}
								class="text-muted-foreground hover:text-foreground"
							>
								<X class="h-3 w-3" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
			<div class={'w-full flex-row'}>
				<Form.Field {form} name={'message'}>
					<Form.Control>
						{#snippet children({ props })}
							<textarea
								bind:this={textareaRef}
								placeholder="Chat to your buddy (Ctrl+Enter to send)"
								class={cn(
									'placeholder:text-muted-foreground flex field-sizing-content max-h-[300px] min-h-[32px] w-full resize-none overflow-y-auto rounded-md border border-none bg-transparent px-3 py-1.5 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
								)}
								rows="1"
								{...props}
								bind:value={$formData.message}
								oninput={autoResize}
								onpaste={handlePaste}
								onkeydown={handleKeyDown}
							></textarea>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<div class="flex flex-row items-center justify-between">
				<div class="flex flex-row items-center gap-1 md:hidden">
					<Popover.Root>
						<Popover.Trigger class={buttonVariants({ variant: 'outline' })}
							>{buttonText()}</Popover.Trigger
						>
						<Popover.Content class="w-60">
							<div class="grid gap-4">
								<p class="text-muted-foreground text-sm">Select a provider and model</p>
								<Combobox
									placeholder="Provider"
									selectionList={providersList}
									bind:value={$formData.provider}
								/>

								<Combobox
									placeholder="Model"
									selectionList={modelsList}
									bind:value={$formData.model}
								/>
							</div>
						</Popover.Content>
					</Popover.Root>
					<Popover.Root open={addKeyPopupIsOpen}>
						<Popover.Trigger class={`${buttonVariants({ variant: 'ghost' })} h-8 w-8`}
							><span class="sr-only">Add a Provider</span><CirclePlus /></Popover.Trigger
						>
						<Popover.Content class="w-60">
							<div class="grid gap-4">
								<AddProviderForm
									superform={addKeySuperform}
									onSuccess={(form) => handleKeyCreate(form)}
								/>
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
				<div class="hidden grid-cols-3 gap-1 md:grid">
					<Combobox
						placeholder="Provider"
						selectionList={providersList}
						bind:value={$formData.provider}
					/>

					<Combobox placeholder="Model" selectionList={modelsList} bind:value={$formData.model} />
					<Popover.Root open={addKeyPopupIsOpen}>
						<Popover.Trigger class={`${buttonVariants({ variant: 'ghost' })} h-8 w-8`}
							><span class="sr-only">Add a Provider</span><CirclePlus /></Popover.Trigger
						>
						<Popover.Content class="w-60">
							<div class="grid gap-4">
								<AddProviderForm superform={addKeySuperform} />
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
				<Button
					type="submit"
					size={isMobile.current ? 'icon' : 'default'}
					disabled={!$formData.message?.trim() && attachments.length === 0}
				>
					<span class="sr-only">Generate</span>
					<span class="hidden md:inline">Generate</span>
					<Sparkles />
				</Button>
			</div>
		</div>
		<!-- {#if attachments.length > 0} -->
		<!-- 	{attachments.length} file{attachments.length === 1 ? '' : 's'} attached -->
		<!-- {:else if ($formData.email?.length || 0) > LONG_PASTE_THRESHOLD} -->
		<!-- 	<span class="text-amber-600"> -->
		<!-- 		Long content detected - consider pasting separately to create attachment -->
		<!-- 	</span> -->
		<!-- {/if} -->

		{#if attachments.length > 0}
			<input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
		{/if}
	</form>
</div>
