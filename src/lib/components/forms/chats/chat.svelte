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

	import { Brain, CirclePlus, Hand, Sparkles, X } from '@lucide/svelte';
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
		onChunk,
		chatID
	}: {
		superform: any;
		onSuccess?: (form: any) => {};
		onChunk?: (chunk: any) => void;
		chatID?: string;
	} = $props();

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
			content: string | File;
			size: number;
			type: 'text' | 'code' | 'json' | 'html' | 'url' | 'image';
			lines?: number;
			preview?: string;
			mimeType?: string;
		}>
	>([]);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(ChatFormSchema),
		clearOnSubmit: 'message',
		onSubmit: async () => {
			$formData.timeSent = DateTimeFormat();
			error = {} as Types.Generic.FormError;
			showLoading = true;
			if (attachments.length > 0) {
				try {
					const serializedAttachments = await Promise.all(
						attachments.map(async (attachment) => {
							if (typeof attachment.content === 'string') {
								return attachment;
							}

							if (attachment.content instanceof File) {
								return new Promise((resolve) => {
									const reader = new FileReader();
									reader.onload = () => {
										resolve({
											...attachment,
											content: reader.result as string
										});
									};
									reader.readAsDataURL(attachment.content);
								});
							}

							return {
								...attachment,
								content: String(attachment.content)
							};
						})
					);

					$formData.attachments = serializedAttachments;
				} catch (error) {
					console.error('Error serializing attachments:', error);
					$formData.attachments = [];
				}
			} else {
				$formData.attachments = [];
			}
			validateForm({ update: true });
		},
		onUpdate: async ({ form }) => {
			console.log('form', form);
			if (!form.valid && form?.message) {
				toast(form.message);
				return;
			}
			if (form.valid) {
				attachments = [];

				// Handle new chat navigation
				if (form.data.chatId && !chatID) {
					// This is a new chat, navigate to it
					await goto(`/chat/${form.data.chatId}`);
					await tick();
				} else {
					await invalidateAll();
					await tick();
				}

				if (form.data.shouldStream && form.data.model && form.data.userProvider) {
					toast(form.message);

					setTimeout(async () => {
						const streamChatId = form.data.chatId || chatID;
						await startAIStream(form.data.model, form.data.userProvider, streamChatId);
					}, 100);
				}

				resetAndFocusTextarea();
				reset({
					newState: {
						model: form.data.model,
						provider: form.data.provider
					}
				});
			}
			showLoading = false;
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to request a password reset';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, enhance, validateForm, reset } = form;
	async function startAIStream(modelId: string, userProviderID: string, streamChatId?: string) {
		const chatIdToUse = streamChatId || chatID;
		const streamUrl = `/chat/${chatIdToUse}/${userProviderID}/stream?modelID=${modelId}`;

		console.log('🔍 Starting stream with chatId:', chatIdToUse); // Debug log

		const eventSource = new EventSource(streamUrl);

		// Show streaming indicator
		showLoading = true;

		eventSource.onmessage = async (event) => {
			try {
				const data = JSON.parse(event.data);
				switch (data.type) {
					case 'chunk':
						onChunk?.(data);
						break;
					case 'complete':
						eventSource.close();
						showLoading = false;
						onChunk?.({ type: 'complete' });
						await tick();
						await invalidateAll();
						break;
					case 'error':
						console.error('stream error:', data.message);
						eventSource.close();
						showLoading = false;
						toast(`AI Error: ${data.message}`);
						await invalidateAll();
						break;
				}
			} catch (parseError) {
				console.error('error parsing stream data:', parseError, event.data);
			}
		};

		eventSource.onerror = (error) => {
			console.error('EventSource error:', error);
			eventSource.close();
			showLoading = false;
			toast('Connection error during AI response');
		};

		setTimeout(() => {
			if (eventSource.readyState !== EventSource.CLOSED) {
				console.warn('timeout, closing connection');
				eventSource.close();
				showLoading = false;
				toast('AI response timed out');
			}
		}, 60000);
	}
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
		const files = e.clipboardData?.files;

		// handle image files first
		if (files && files.length > 0) {
			e.preventDefault();

			Array.from(files).forEach((file) => {
				if (file.type.startsWith('image/')) {
					const reader = new FileReader();
					reader.onload = (e) => {
						const attachment = {
							id: crypto.randomUUID(),
							name: file.name || `image-${Date.now()}.${file.type.split('/')[1]}`,
							content: file,
							size: file.size,
							type: 'image' as const,
							preview: e.target?.result as string,
							mimeType: file.type
						};
						attachments = [...attachments, attachment];
					};
					reader.readAsDataURL(file);
				}
			});
			return;
		}

		// handle text content
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
			if ($formData.message?.trim() || attachments.length > 0) {
				form.submit();
			}
		}
	}
	function resetAndFocusTextarea() {
		if (textareaRef) {
			textareaRef.style.height = 'auto';
			textareaRef.style.height = '32px';
			// buggy in FF? is that intended or me being stupid? surely it's not deprecated?
			// TODO: RTFM about this shit
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

{#snippet fileIcon(type: string, preview?: string)}
	{#if type === 'image' && preview}
		<div class="h-4 w-4">
			<img src={preview} alt="Preview" />
		</div>
	{:else}
		{@const IconComponent = GetFileIcon(type)}
		<IconComponent class="h-4 w-4 flex-shrink-0 text-blue-600" />
	{/if}
{/snippet}
<div class="relative z-5">
	<div
		class={showLoading ? 'absolute z-10 flex h-full w-full items-center justify-center' : 'hidden'}
	>
		<div class="h-10 w-10 rounded-full p-4">
			<Brain />
		</div>
	</div>
	{#if attachments.length > 0}
		<div class="absolute right-0 bottom-full left-0 z-10 mb-2">
			<div class="flex max-h-48 flex-col rounded-lg border bg-white shadow-sm">
				<div class="flex flex-shrink-0 items-center justify-between border-b bg-gray-50 p-2">
					<span class="text-sm font-medium text-gray-700">
						{attachments.length} attachment{attachments.length === 1 ? '' : 's'}
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onclick={() => (attachments = [])}
						class="h-6 w-6 p-0"
					>
						<X class="h-3 w-3" />
					</Button>
				</div>

				<div class="min-h-0 flex-1 overflow-y-auto">
					<div class="grid auto-rows-min grid-cols-2 gap-2 p-3 md:grid-cols-3 lg:grid-cols-4">
						{#each attachments as attachment (attachment.id)}
							<div
								class="bg-background border-border flex items-center gap-2 rounded-md border p-2"
							>
								{#if attachment.type === 'image' && attachment.preview}
									<!-- image preview -->
									<div class="relative h-8 w-8 flex-shrink-0">
										<img
											src={attachment.preview}
											alt={attachment.name}
											class="h-full w-full rounded object-cover"
										/>
									</div>
								{:else}
									{@render fileIcon(attachment.type)}
								{/if}
								<div class="min-w-0 flex-1">
									<div class="text-foreground truncate text-xs font-medium">
										{attachment.name}
									</div>
									<div class="text-muted-foreground text-xs">
										{FormatFileSize(attachment.size)}
										{#if attachment.lines}
											• {attachment.lines} lines
										{/if}
									</div>
								</div>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									onclick={() => removeAttachment(attachment.id)}
									class="text-muted-foreground hover:text-foreground h-5 w-5 p-0"
								>
									<X class="h-3 w-3" />
								</Button>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</div>
	{/if}
	<form
		action={chatID ? `/chat/${chatID}?/sendMessage` : '/chat?/chatInit'}
		autocomplete="off"
		method="POST"
		class={showLoading ? 'w-full blur-xs' : 'w-full'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4 rounded-lg border p-3">
			<div class={'w-full flex-row'}>
				<Form.Field {form} name={'message'}>
					<Form.Control>
						{#snippet children({ props })}
							<textarea
								disabled={showLoading}
								bind:this={textareaRef}
								placeholder="Chat to your buddy (Ctrl+Enter to send)"
								class={cn(
									'placeholder:text-muted-foreground flex field-sizing-content  max-h-[300px] min-h-[32px] w-full resize-none overflow-y-auto rounded-md border border-none bg-transparent px-3 py-1.5 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
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
				{#if !showLoading}
					<Button
						type="submit"
						size={isMobile.current ? 'icon' : 'default'}
						disabled={!$formData.message?.trim() && attachments.length === 0}
					>
						<span class="sr-only">Generate</span>
						<span class="hidden md:inline">Generate</span>
						<Sparkles />
					</Button>
				{:else}
					<Button
						type="submit"
						size={isMobile.current ? 'icon' : 'default'}
						disabled={!$formData.message?.trim() && attachments.length === 0}
					>
						<span class="sr-only">Stop Generating</span>
						<span class="hidden md:inline">Generating</span>
						<Hand />
					</Button>
				{/if}
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
