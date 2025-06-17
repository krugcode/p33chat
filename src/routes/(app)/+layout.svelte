<script lang="ts">
	import AppSidebar from '$lib/components/nav/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { Toaster } from '$lib/components/ui/sonner/index.js';
	import { toast } from 'svelte-sonner';

	import '../../app.css';

	let { children, notifications } = $props();

	$effect(() => {
		if (notifications?.length > 0) {
			notifications.foreach((notification: string) => {
				toast(notification);
			});
		}
	});
	$inspect(notifications);
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 max-h-[100vh] shrink-0 items-center gap-2">
			<div class=" flex items-center gap-2 px-4">
				<Sidebar.Trigger class="-ml-1" />
				<Separator orientation="vertical" class="mr-2 data-[orientation=vertical]:h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="#">Building Your Application</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>Data Fetching</Breadcrumb.Page>
						</Breadcrumb.Item>
					</Breadcrumb.List>
				</Breadcrumb.Root>
			</div>
		</header>
		<div class="flex max-h-[calc(100vh-5rem)] flex-col gap-4 p-4 pt-0">
			{@render children()}
			<!-- <div class="grid auto-rows-min gap-4 md:grid-cols-3"> -->
			<!-- 	<div class="bg-muted/50 aspect-video rounded-xl"></div> -->
			<!-- 	<div class="bg-muted/50 aspect-video rounded-xl"></div> -->
			<!-- 	<div class="bg-muted/50 aspect-video rounded-xl"></div> -->
			<!-- </div> -->
			<!-- <div class="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min"></div> -->
			<Toaster position="top-right" />
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
