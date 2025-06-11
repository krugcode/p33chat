<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/state';
	import { pageMeta } from '$lib/meta';
	import { Auth } from '$lib/components/forms';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { superform } = data;
	const LoginForm = Auth.Forms.Login;
	function handleLoginSuccess() {
		if (!page.url?.searchParams?.has('redirect')) {
			window.location.href = '/';
		}
		window.location.href = page.url?.searchParams?.get('redirect') ?? '/';
	}

	pageMeta.setMeta({
		title: 'Login',
		description: 'FindMyChip Vet & Animal Welfare Login'
	});
</script>

<h1 class="text-primary mb-5 text-3xl">Login</h1>
<h4>Make a splash</h4>

<LoginForm {superform} onSuccess={handleLoginSuccess} />
