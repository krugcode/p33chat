<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { superForm } from 'sveltekit-superforms';

	let { superform, children } = $props();

	let showLoading = $state(false);
	const form = superForm(superform, {
		delayMs: 300,
		clearOnSubmit: 'errors',
		onSubmit: () => {
			showLoading = true;
			validateForm({ update: true });
		},
		onUpdate: async ({ result }) => {
			showLoading = false;

			if (result.data.success) {
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			console.log('Error logging out:', e);
		}
	});

	const { enhance, validateForm } = form;
</script>

<form method="POST" action="/logout?" use:enhance>
	<button type="submit" class="w-full">
		{@render children()}
	</button>
</form>
