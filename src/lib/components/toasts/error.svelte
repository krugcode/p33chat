<script lang="ts">
	import { toast } from 'svelte-sonner';
	import Button from '../ui/button/button.svelte';

	const { toastElement, title, message, buttonText } = $props();
</script>

<div>
	<h3>{title}</h3>
	<Button onclick={() => toast.dismiss(toastElement)}>{buttonText ?? 'Close'}</Button>
</div>
