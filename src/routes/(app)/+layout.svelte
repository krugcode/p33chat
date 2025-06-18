<script lang="ts">
	import AppSidebar from '$lib/components/nav/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { toast } from 'svelte-sonner';

	import { resolvedMeta } from '$lib/meta';

	import '../../app.css';
	import { page } from '$app/state';

	let { children, notifications, currentContext } = $props();

	$effect(() => {
		if (notifications?.length > 0) {
			notifications.foreach((notification: string) => {
				toast(notification);
			});
		}
	});

	let { activeBreadcrumb, inactiveBreadcrumbs } = $derived($resolvedMeta);
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
	<meta name="keywords" content={$resolvedMeta.keywords?.join(', ')} />

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
<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset class="min-w-0 overflow-hidden">
		<header class="flex h-16 max-h-[100vh] shrink-0 items-center gap-2">
			<div class="flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				{#if activeBreadcrumb?.title || inactiveBreadcrumbs?.length > 0}
					<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
					<Breadcrumb.Root>
						<Breadcrumb.List>
							{#if inactiveBreadcrumbs?.length > 0}
								{#each inactiveBreadcrumbs as breadcrumb}
									<Breadcrumb.Item class="hidden md:block">
										<Breadcrumb.Link href={breadcrumb.url}>{breadcrumb.title}</Breadcrumb.Link>
									</Breadcrumb.Item>
									<Breadcrumb.Separator class="hidden md:block" />
								{/each}
							{/if}
							{#if activeBreadcrumb}
								<Breadcrumb.Item>
									<Breadcrumb.Page>{activeBreadcrumb.title}</Breadcrumb.Page>
								</Breadcrumb.Item>
							{/if}
						</Breadcrumb.List>
					</Breadcrumb.Root>
				{/if}
			</div>
		</header>
		<div
			class="scrollable-content flex max-h-[calc(100vh-5rem)] w-full min-w-0 flex-col gap-4 overflow-x-hidden overflow-y-auto p-4 pt-0"
		>
			{@render children()}
			<Toaster position="top-right" />
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>

<style>
	:global(.scrollable-content) {
		scrollbar-width: none; /* Firefox */
		-ms-overflow-style: none; /* Internet Explorer 10+ */
	}

	:global(.scrollable-content::-webkit-scrollbar) {
		display: none; /* Webkit browsers */
	}
</style>
