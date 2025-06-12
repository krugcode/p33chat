<script lang="ts">
	import { Chats } from '$lib/components/forms';

	let { data } = $props();
	const { superform } = data;
	const ChatInputForm = Chats.Forms.Chat;
</script>

<div class="flex h-full flex-col justify-end">
	<!-- chat messages -->
	<div class="grid grid-cols-1 md:grid-cols-2"></div>
	<!-- chat input -->
	<ChatInputForm {superform} />
</div>
