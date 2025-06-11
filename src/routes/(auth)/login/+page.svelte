<script lang="ts">
	import type { PageData } from './$types';
	import { pageMeta } from '$lib/meta';
	import { Auth } from '$lib/components/forms';
	import { Images } from '$lib';
	import { Button } from '$lib/components/ui/button';

	interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
	const { superform } = data;
	const LoginForm = Auth.Forms.Login;

	pageMeta.setMeta({
		title: 'Login',
		description: 'Login to P33'
	});
</script>

<div class="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-sm md:p-10">
	<div class="flex flex-row gap-4">
		<img class="h-10 rounded-lg" src={Images.Logo} alt="p33 logo" />
		<h1 class="text-primary mb-5 text-3xl">Login</h1>
	</div>
	<h4>Make a splash with <span class="text-primary font-bold">P33</span></h4>

	<LoginForm {superform} />
</div>

<div class="mt-5 flex w-full items-center justify-center gap-3">
	<p class="mb-0 text-center text-sm">Don't have any details?</p>
	<Button variant="link" href="/register">Register Your Account</Button>
</div>
