<script lang="ts">
	import type { PageData } from './$types';
	import { pageMeta } from '$lib/meta';
	import { Auth } from '$lib/components/forms';
	import { Images } from '$lib';
	import { Button } from '$lib/components/ui/button';

	let { data } = $props();
	const { superform, emailEnabled } = data;
	const ForgotPasswordForm = Auth.Forms.ForgotPassword;

	pageMeta.setMeta({
		title: 'ForgotPassword',
		description: 'ForgotPassword for P33'
	});
</script>

<div class="flex flex-col gap-5 rounded-lg bg-white p-5 shadow-sm md:p-10">
	<div class="flex flex-row gap-4">
		<img class="h-10 rounded-lg" src={Images.Logo} alt="p33 logo" />
		<h1 class="text-primary mb-5 text-3xl">Forgot Password</h1>
	</div>
	<h4>Forgot your <span class="text-primary font-bold">P33</span>?</h4>
	{#if !emailEnabled}
		<div class="bg-primary rounded-lg p-3 text-white">
			Please set the Brevo settings in your .env vars and redeploy to get access to SMTP
		</div>
	{/if}
	<ForgotPasswordForm {superform} />
</div>

<div class="mt-5 flex w-full items-center justify-center gap-3">
	<p class="mb-0 text-center text-sm">Don't have any details?</p>
	<Button variant="link" href="/register">Register Your Account</Button>
</div>
