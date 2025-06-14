<script lang="ts">
	import NavMain from './nav-main.svelte';
	import NavProjects from './nav-projects.svelte';
	import NavSecondary from './nav-secondary.svelte';
	import NavUser from './nav-user.svelte';

	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { sidebarItems } from './app-sidebar';
	import type { ContextsResponse } from '$lib/types/pocketbase-types';
	import { page } from '$app/state';
	import { Contexts } from '../forms';
	import Button, { buttonVariants } from '../ui/button/button.svelte';
	import { CirclePlus } from '@lucide/svelte';

	let { ref = $bindable(null), ...restProps } = $props();

	let superform = $derived(page.data.changeContextForm);
	let createContextSuperform = $derived(page.data.createContextForm);
	let contextsList = $derived(
		page.data.contexts.map((context: ContextsResponse) => ({
			value: context.id,
			label: context.name,
			image: context.logo?.length > 0 ? context.logo : '#'
		}))
	);
	let openCreateContext = $state(false);
	function flipPopupState() {
		openCreateContext = !openCreateContext;
	}
</script>

<Sidebar.Root bind:ref variant="inset" {...restProps}>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<div class="flex flex-row gap-3">
					<Contexts.Forms.SetActiveContext {superform} {contextsList} />

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
		<NavMain items={sidebarItems.navMain} />
		<NavProjects projects={sidebarItems.projects} />
		<NavSecondary items={sidebarItems.navSecondary} class="mt-auto" />
	</Sidebar.Content>
	<Sidebar.Footer>
		<NavUser />
	</Sidebar.Footer>
</Sidebar.Root>
