<script lang="ts">
	import { Chats } from '$lib/components/forms';

	let { data } = $props();
	const { superform } = data;
	const ChatInputForm = Chats.Forms.Chat;
</script>

<div class="flex h-full flex-col bg-white">
	<!-- Messages area -->
	<div
		class="max-h-[calc(100vh-15rem)] min-h-[calc(100vh-15rem)] flex-1 overflow-x-hidden overflow-y-auto px-4 py-5 md:px-8"
	>
		<div class="flex h-full flex-col items-center justify-center gap-3 py-8">
			<h4
				class="z-10 inline-block bg-gradient-to-r from-black via-pink-500 to-violet-800 bg-clip-text text-5xl leading-tight font-normal text-transparent"
			>
				Nothing to see here
			</h4>
			<p class="text-muted-foreground">Start generating below.</p>
		</div>
	</div>

	<div class=" mt-2">
		<ChatInputForm {superform} />
	</div>
</div>
