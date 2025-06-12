<script lang="ts">
	import { Types } from '$lib';

	let data: Types.Chats.LLMResponse = $props();
	let message = $derived(data.message);
</script>

<div class="">{message}</div>
