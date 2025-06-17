<script lang="ts">
	import { page } from '$app/state';
	import { Images } from '$lib';

	import { resolvedMeta } from '$lib/meta';
	import '../../app.css';
	let { children } = $props();
</script>

<svelte:head>
	<title>{$resolvedMeta.title} - {$resolvedMeta.description}</title>
	<meta name="description" content={$resolvedMeta.description} />

	<!-- SEO -->
	{#if $resolvedMeta.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}
	<meta name="keywords" content={$resolvedMeta.keywords.join(', ')} />

	<!-- Open Graph / Social Media -->
	<meta property="og:title" content={$resolvedMeta.title} />
	<meta property="og:description" content={$resolvedMeta.description} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={page.url.href} />
	{#if $resolvedMeta.ogImage}
		<meta property="og:image" content={$resolvedMeta.ogImage} />
	{/if}

	<!-- Twitter -->
	<!-- <meta name="twitter:card" content="summary" /> -->
	<!-- <meta name="twitter:title" content={$resolvedMeta.title} /> -->
	<!-- <meta name="twitter:description" content={$resolvedMeta.description} /> -->
	<!-- {#if $resolvedMeta.ogImage} -->
	<!-- 	<meta name="twitter:image" content={$resolvedMeta.ogImage} /> -->
	<!-- {/if} -->
</svelte:head>
<div class="relative bg-slate-100">
	<!-- Grid overlay -->
	<div class="grid"></div>
	<div
		class="absolute right-10 bottom-10 h-[600px] w-[500px] opacity-10"
		style={`background-image:url(${Images.Toilet})`}
	></div>
	<div class="relative z-10 flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-md">
			{@render children()}
		</div>
	</div>
</div>

<style>
	/* Grid overlay */
	.grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: gridMove 20s linear infinite;
		z-index: 5; /* Above background elements */
	}
	.grid {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
	}

	/* .dark.grid { */
	/* 	background-image: */
	/* 		linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), */
	/* 		linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px); */
	/* } */
</style>
