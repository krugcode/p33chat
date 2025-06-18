<script lang="ts">
	import { page } from '$app/state';
	import { Chats } from '$lib/components/forms/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Accordion from '$lib/components/ui/accordion/index.js';
	import { pageMeta } from '$lib/meta.js';
	import { tick } from 'svelte';
	import { Button } from '$lib/components/ui/button';
	import {
		ArrowDown,
		Copy,
		RefreshCw,
		SquareArrowOutUpRight,
		SquareArrowOutUpRightIcon
	} from '@lucide/svelte';

	let { data } = $props();
	let { superform, messages, currentContext } = $derived(data);

	let chatID = page.params.id;
	const ChatInputForm = Chats.Forms.Chat;

	let messagesRef: HTMLElement | null = $state(null);
	let isUserScrolling = $state(false);
	let scrollTimeout: number;
	let isNearBottom = $state(true);

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
	console.log('MESSAGES', messages);
</script>

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
			<div class="flex h-full flex-col gap-8 py-8">
				{#each messages as message}
					{#if message.role === 'User'}
						<!-- user message -->
						<div class="z-1 flex justify-end">
							<div class="max-w-[70%] rounded-lg bg-gray-100 px-5 py-3 shadow-sm">
								<p class="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-black">
									{message.message}
								</p>
							</div>
						</div>
					{:else if message.role === 'Assistant'}
						<!-- assistant message -->
						<div class="z-1 flex w-full justify-start">
							<div class="flex w-full flex-col">
								<div
									class="flex w-full flex-col gap-2 rounded-lg border bg-white px-5 py-3 shadow-sm"
								>
									<p class="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
										{message.message}
									</p>
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

	<div class=" bg-white px-2 pt-2">
		<ChatInputForm {superform} {chatID} />
	</div>

	{#if !isNearBottom && messages?.length > 0}
		<Button
			onclick={scrollToBottom}
			class="absolute bottom-5 left-1/2 z-10 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
			aria-label="Scroll to bottom"
		>
			<ArrowDown />
		</Button>
	{/if}
</div>
