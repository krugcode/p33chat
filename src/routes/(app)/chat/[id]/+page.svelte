<script lang="ts">
	import { page } from '$app/state';
	import { Chats } from '$lib/components/forms/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { pageMeta } from '$lib/meta.js';
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowDown, Copy, RefreshCw, SquareArrowOutUpRight, X } from '@lucide/svelte';
	import MarkdownMessage from '$lib/components/chat/markdown-message.svelte';
	import { FormatFileSize, GetFileIcon } from '$lib/components/forms/chats/chat-helpers.js';
	import { invalidateAll } from '$app/navigation';

	let { data } = $props();
	let { superform, messages, currentContext } = $derived(data);

	let chatID = page.params.id;
	const ChatInputForm = Chats.Forms.Chat;

	let messagesRef: HTMLElement | null = $state(null);
	let isUserScrolling = $state(false);
	let scrollTimeout: number;
	let isNearBottom = $state(true);

	let streaming = $state(false);
	let streamContent = $state('');
	let chatTitle = $derived(messages[0]?.chat?.title);

	$effect(async () => {
		if (messages?.length > 0 && isNearBottom && !isUserScrolling) {
			await tick();
			scrollToBottom();
		}
	});

	function scrollToBottom() {
		if (messagesRef) {
			messagesRef.scrollTo({
				top: messagesRef.scrollHeight,
				behavior: 'smooth'
			});
		}
	}

	function handleScroll() {
		if (!messagesRef) return;

		const { scrollTop, scrollHeight, clientHeight } = messagesRef;
		const threshold = 100;

		isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;
		isUserScrolling = !isNearBottom;

		clearTimeout(scrollTimeout);
		scrollTimeout = setTimeout(() => {
			isUserScrolling = false;
		}, 1500);
	}

	$effect(() => {
		pageMeta.setMeta({
			title: messages[0]?.chat?.title?.length > 0 ? messages[0]?.chat?.title?.length : 'New Chat',
			description: currentContext?.context?.name,
			keywords: ['about', 'services', 'veterinary cremation'],
			noindex: false,
			ogImage: '/images/about-page.jpg'
		});
	});

	async function onChunk(chunk: any) {
		console.log('Raw chunk received:', chunk);
		streaming = true;

		// Debug: Check what we're actually receiving
		if (chunk.content !== undefined) {
			console.log('Content type:', typeof chunk.content);
			console.log('Content value:', chunk.content);
		}

		// Ensure content is always a string
		let content = '';
		if (chunk.content !== undefined && chunk.content !== null) {
			if (typeof chunk.content === 'string') {
				content = chunk.content;
			} else if (typeof chunk.content === 'object') {
				console.warn('Received object as chunk.content, skipping:', chunk.content);
				content = ''; // Skip objects entirely
			} else {
				content = String(chunk.content);
			}
		}

		streamContent = streamContent + content;
		scrollToBottom();

		if (chunk.type === 'complete') {
			streaming = false;
			streamContent = '';

			return;
		}
	}
	$effect(() => {
		pageMeta.setMeta({
			title: chatTitle ?? 'New Chat',
			description: 'Generating CONTENT',
			activeBreadcrumb: {
				title: chatTitle,
				url: '#'
			}
		});
	});
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
<!-- Main chat container -->
<div class="flex h-full flex-col bg-white">
	<!-- Messages area -->
	<div
		bind:this={messagesRef}
		class="max-h-[calc(100vh-15rem)] min-h-[calc(100vh-15rem)] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 md:px-8"
		onscroll={handleScroll}
	>
		{#if messages?.length > 0}
			<!-- messages with better spacing -->
			<div class="flex h-full flex-col gap-3 py-8">
				{#each messages as message}
					{#if message.role === 'User'}
						<!-- user message -->
						<div class="z-1 flex flex-col items-end gap-2 pb-3">
							{#if message?.attachments?.length > 0}
								<div class="flex max-h-48 flex-col rounded-lg border bg-white shadow-sm">
									<div
										class="flex flex-shrink-0 items-center justify-between border-b bg-gray-50 p-2"
									>
										<span class="text-sm font-medium text-gray-700">
											{message.attachments.length} attachment{message.attachments.length === 1
												? ''
												: 's'}
										</span>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											onclick={() => (message.attachments = [])}
											class="h-6 w-6 p-0"
										>
											<X class="h-3 w-3" />
										</Button>
									</div>

									<div class="min-h-0 flex-1 overflow-y-auto">
										<div
											class="grid auto-rows-min grid-cols-2 gap-2 p-3 md:grid-cols-3 lg:grid-cols-4"
										>
											{#each message.attachments as attachment}
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
												</div>
											{/each}
										</div>
									</div>
								</div>
							{/if}
							{#if message?.message?.length > 0}
								<div class="max-w-[70%] rounded-lg bg-gray-100 px-5 py-3 shadow-sm">
									<p class="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-black">
										{message.message}
									</p>
								</div>
							{/if}
						</div>
					{:else if message.role === 'Assistant'}
						<!-- assistant message -->
						<div class="z-1 flex w-full justify-start pb-8">
							<div class="flex w-full flex-col">
								<div
									class="border-primary flex w-full flex-col gap-2 rounded-lg bg-white px-5 py-3 shadow-sm"
								>
									<MarkdownMessage content={message.message} />

									<div class="flex flex-row justify-between border-t pt-2">
										<div class="flex items-center gap-2">
											<!-- fucking cursed but good enough -->
											<Avatar.Root>
												<Avatar.Image
													src={`/path/to/logos/${message.model.providerModelFeaturesJunction_via_model[0].provider.logo}`}
													alt={message.model.providerModelFeaturesJunction_via_model[0].provider
														.name}
												/>
												<Avatar.Fallback>
													{message.model.providerModelFeaturesJunction_via_model[0].provider.name
														.slice(0, 2)
														.toUpperCase()}
												</Avatar.Fallback>
											</Avatar.Root>
											<div>
												<h4 class="text-sm font-medium">{message.model.name}</h4>
												<p class="text-xs text-gray-500">
													{message.model.providerModelFeaturesJunction_via_model[0].provider.name}
												</p>
											</div>
										</div>
										<div class="flex flex-row gap-2">
											<Button variant="outline" aria-label="Regenerate" size="icon">
												<RefreshCw />
											</Button>
											<Button variant="outline" aria-label="Copy Contents" size="icon">
												<Copy />
											</Button>
											<Button variant="outline" aria-label="Export" size="icon">
												<SquareArrowOutUpRight />
											</Button>
										</div>
									</div>
								</div>
							</div>
						</div>
					{:else if message.role === 'System'}
						<!-- system message -->
						<div class="flex justify-center">
							<div class="max-w-md rounded-2xl border px-4 py-3 text-center">
								<span class="text-xs font-medium tracking-wider text-gray-500 uppercase"
									>System</span
								>
								<p class="m-0 mt-1 text-sm text-gray-700">{message.message}</p>
							</div>
						</div>
					{/if}
				{/each}
				{#if streaming}
					<div class="z-1 flex w-full justify-start pb-10">
						<div class="flex w-full flex-col">
							<div
								class="border-primary flex w-full flex-col gap-2 rounded-lg bg-white px-5 py-3 shadow-sm"
							>
								<MarkdownMessage content={streamContent} />

								<div class="flex flex-row justify-between border-t pt-2">
									<div class="flex items-center gap-2">Thinking...</div>
									<div class="flex flex-row gap-2">
										<Button variant="outline" aria-label="Regenerate" size="icon">
											<RefreshCw />
										</Button>
										<Button variant="outline" aria-label="Copy Contents" size="icon">
											<Copy />
										</Button>
										<Button variant="outline" aria-label="Export" size="icon">
											<SquareArrowOutUpRight />
										</Button>
									</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="flex h-full flex-col items-center justify-center gap-3 py-8">
				<h4
					class="z-10 inline-block bg-gradient-to-r from-black via-pink-500 to-violet-800 bg-clip-text text-5xl leading-tight font-normal text-transparent"
				>
					Nothing to see here
				</h4>
				<p class="text-muted-foreground">Start generating below.</p>
			</div>
		{/if}
	</div>

	<div class="sticky bottom-0 z-16 flex-shrink-0 border-t bg-white backdrop-blur-sm">
		<div class="p-4">
			<ChatInputForm {superform} {chatID} {onChunk} />
		</div>
	</div>

	{#if !isNearBottom && messages?.length > 0}
		<Button
			onclick={scrollToBottom}
			class="absolute bottom-5 left-1/2 z-20 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
			aria-label="Scroll to bottom"
		>
			<ArrowDown />
		</Button>
	{/if}
</div>
