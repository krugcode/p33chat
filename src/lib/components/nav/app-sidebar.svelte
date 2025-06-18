<script lang="ts">
	import NavChats from './nav-chats.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { sidebarItems, ConvertChatsToNavItems } from './app-sidebar';
	import { page } from '$app/state';
	import { Contexts } from '../forms';
	import { buttonVariants } from '../ui/button/button.svelte';
	import { CirclePlus } from '@lucide/svelte';
	import { Images } from '$lib';

	let { ref = $bindable(null), ...restProps } = $props();

	let superform = $derived(page.data.changeContextForm);
	let createContextSuperform = $derived(page.data.createContextForm);
	let currentContext = $derived(page.data.currentContext);
	let currentURL = $derived(page.url.pathname);

	let contextsList = $derived(
		page.data.contexts.map((userContext: Record<string, any>) => ({
			value: userContext.id,
			label: userContext.context.name,
			image: userContext.context.logo?.length > 0 ? userContext.context.logo : '#'
		}))
	);
	let chats = $derived(page?.data?.currentContext.chats_via_userContext ?? []);

	let chatsMenuItems = $derived(ConvertChatsToNavItems(chats, currentURL));
	let openCreateContext = $state(false);

	function flipPopupState() {
		openCreateContext = !openCreateContext;
	}
</script>

<Sidebar.Root bind:ref class="overflow-x-hidden overflow-y-hidden" variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<div class="flex flex-row justify-between gap-3">
					<Contexts.Forms.SetActiveContext {superform} {currentContext} {contextsList} />

					<Popover.Root open={openCreateContext} onOpenChange={flipPopupState}>
						<Popover.Trigger class={buttonVariants({ variant: 'ghost' })}
							><CirclePlus /></Popover.Trigger
						>
						<Popover.Content class="w-80">
							<div class="grid gap-4">
								<div class="space-y-2">
									<h4 class="leading-none font-medium">Create New Context</h4>
									<p class="text-muted-foreground text-xs">
										Contexts organise your chats into logical groups.<br /> Think like 'History', 'Code',
										'Waifus'
									</p>
								</div>
								<Contexts.Forms.CreateContext
									superform={createContextSuperform}
									onSuccess={flipPopupState}
								/>
							</div>
						</Popover.Content>
					</Popover.Root>
				</div>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content>
		<NavChats items={chatsMenuItems} />
		<!-- <NavProjects projects={sidebarItems.projects} /> -->
		<!-- <NavSecondary items={sidebarItems.navSecondary} class="mt-auto" /> -->
	</Sidebar.Content>
	<Sidebar.Footer class="relative">
		<div
			class="pointer-events-none absolute -bottom-20 -left-20 h-[600px] w-[400px] opacity-10"
			style={`background-image:url(${Images.Toilet})`}
		></div>

		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
