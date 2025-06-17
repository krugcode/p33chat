<script lang="ts">
	import * as Collapsible from '$lib/components/ui/collapsible/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import { Button } from '../ui/button';
	import { CircleChevronRight, CirclePlus, Sparkle, Sparkles } from '@lucide/svelte';
	import { type NavMenuItem } from './app-sidebar';
	import { useSidebar } from '$lib/components/ui/sidebar/index.js';
	import Input from '../ui/input/input.svelte';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let {
		items
	}: {
		items: NavMenuItem[];
	} = $props();

	const sidebar = useSidebar();
</script>

<Sidebar.Group>
	<Sidebar.GroupLabel class="gap-2">Chats</Sidebar.GroupLabel>
	<div class="flex w-full flex-row items-center justify-between gap-2 pb-3 pl-1">
		<Input
			class="h-8 bg-transparent text-xs shadow-none"
			placeholder="Search chats..."
			disabled={items?.length === 0}
		></Input>

		<Button
			variant="ghost"
			href="/chat"
			onclick={() => sidebar.isMobile && sidebar.toggle}
			size="sm"
			class="text-xs"><span class="sr-only">Start New Chat</span><CirclePlus size={10} /></Button
		>
	</div>
	<Sidebar.Menu>
		{#each items as mainItem, i (mainItem.id)}
			{#if i < 5}
				<Collapsible.Root open={mainItem.isActive}>
					{#snippet child({ props })}
						<Sidebar.MenuItem {...props}>
							<Sidebar.MenuButton
								onclick={() => sidebar.isMobile && sidebar.toggle}
								tooltipContent={mainItem.title}
							>
								{#snippet child({ props })}
									<a href={mainItem.url} {...props}>
										{#if mainItem.icon}
											<mainItem.icon />
										{/if}
										<span>{mainItem.title}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
							{#if mainItem.items?.length}
								<Collapsible.Trigger>
									{#snippet child({ props })}
										<Sidebar.MenuAction {...props} class="data-[state=open]:rotate-90">
											<ChevronRightIcon />
											<span class="sr-only">Toggle</span>
										</Sidebar.MenuAction>
									{/snippet}
								</Collapsible.Trigger>
								<Collapsible.Content>
									<Sidebar.MenuSub>
										{#each mainItem.items as subItem (subItem.title)}
											<Sidebar.MenuSubItem>
												<Sidebar.MenuSubButton href={subItem.url}>
													<span>{subItem.title}</span>
												</Sidebar.MenuSubButton>
											</Sidebar.MenuSubItem>
										{/each}
									</Sidebar.MenuSub>
								</Collapsible.Content>
							{/if}
						</Sidebar.MenuItem>
					{/snippet}
				</Collapsible.Root>
			{/if}
		{/each}
		{#if items?.length > 5}
			<Sidebar.MenuItem>
				<Button
					variant="link"
					onclick={() => sidebar.isMobile && sidebar.toggle}
					href="/chat"
					class="flex w-full flex-row justify-between !px-2 text-xs font-bold tracking-wide uppercase hover:bg-gray-100"
					>View All <CircleChevronRight /></Button
				>
			</Sidebar.MenuItem>
		{/if}
		{#if items?.length === 0}
			<div class="w-full px-2">
				<Button class="w-full" href="/chat">Start Generating <Sparkles /></Button>
			</div>
		{/if}
	</Sidebar.Menu>
</Sidebar.Group>
