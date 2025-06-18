<script lang="ts">
	import { page } from '$app/state';
	import { Chats } from '$lib/components/forms/index.js';
	import { pageMeta } from '$lib/meta.js';
	import { tick } from 'svelte';

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
</script>

<!-- Main chat container -->
<div class="flex h-full flex-col bg-white">
	<!-- Messages area -->
	<div
		bind:this={messagesRef}
		class="max-h-[calc(100vh-15rem)] min-h-[calc(100vh-15rem)] flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8"
		onscroll={handleScroll}
	>
		{#if messages?.length > 0}
			<!-- Messages with better spacing -->
			<div class="flex h-full flex-col gap-8 py-8">
				{#each messages as message}
					{#if message.role === 'User'}
						<!-- User message - Claude style -->
						<div class="flex justify-end">
							<div class="max-w-[70%] rounded-3xl bg-blue-600 px-5 py-3 shadow-sm">
								<p class="text-[15px] leading-relaxed break-words whitespace-pre-wrap text-white">
									{message.message}
								</p>
							</div>
						</div>
					{:else if message.role === 'Assistant'}
						<!-- Assistant message - Claude style -->
						<div class="flex gap-4">
							<!-- Claude avatar -->
							<div
								class="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-medium text-white"
							>
								C
							</div>
							<!-- Message content -->
							<div class="min-w-0 flex-1">
								<div class="prose prose-gray max-w-none">
									<p
										class="m-0 text-[15px] leading-relaxed break-words whitespace-pre-wrap text-gray-800"
									>
										{message.message}
									</p>
								</div>
							</div>
						</div>
					{:else if message.role === 'System'}
						<!-- System message - minimal style -->
						<div class="flex justify-center">
							<div
								class="max-w-md rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-center"
							>
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

	<!-- Input area - cleaner styling -->
	<div class=" bg-white px-4 pt-4 md:px-8">
		<ChatInputForm {superform} {chatID} />
	</div>

	<!-- Scroll to bottom button - Claude style -->
	{#if !isNearBottom && messages?.length > 0}
		<button
			onclick={scrollToBottom}
			class="absolute bottom-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-lg transition-all duration-200 hover:bg-gray-50 hover:shadow-xl"
			aria-label="Scroll to bottom"
		>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M19 14l-7 7m0 0l-7-7m7 7V3"
				/>
			</svg>
		</button>
	{/if}
</div>

<style>
	/* Custom scrollbar styling like Claude */
	:global(.overflow-y-auto) {
		scrollbar-width: thin;
		scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
	}

	:global(.overflow-y-auto::-webkit-scrollbar) {
		width: 6px;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-thumb) {
		background-color: rgba(0, 0, 0, 0.2);
		border-radius: 3px;
	}

	:global(.overflow-y-auto::-webkit-scrollbar-thumb:hover) {
		background-color: rgba(0, 0, 0, 0.3);
	}
</style>
