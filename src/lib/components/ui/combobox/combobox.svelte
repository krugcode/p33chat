<script lang="ts">
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Button, buttonVariants } from '$lib/components/ui/button/index.js';

	import { ScrollArea } from '$lib/components/ui/scroll-area/index.js';

	import { useId } from 'bits-ui';
	import { CheckIcon, ChevronDown, FileQuestion } from '@lucide/svelte';
	import { Types } from '$lib';
	import * as Avatar from '../avatar';

	interface Props {
		placeholder?: string;
		selectionList?: Types.Generic.SelectionInput[];
		class?: string;
		value?: string | null | undefined;
		selected?: Types.Generic.SelectionInput | null;
		isOpen?: boolean;
		readonly?: boolean;
		fallbackIcon?: any;
	}

	let {
		placeholder = 'Select an option...',
		selectionList = [],
		class: className = '',
		value = $bindable(),
		selected = $bindable(null),
		isOpen = $bindable(false),
		readonly = false,
		fallbackIcon = null
	}: Props = $props();

	$effect(() => {
		if (value === undefined) {
			value = null;
		}
	});

	// unique id for the trigger
	const triggerId = useId();
	let open = $state(false);
	let searchQuery = $state('');

	function closeAndFocusTrigger() {
		open = false;
		isOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	let searchList = $derived.by(() => {
		const query = searchQuery.toLowerCase();
		if (!query) return selectionList;
		return selectionList
			.filter((option) => option.label.toLowerCase().includes(query))
			.sort((a, b) => {
				const aStartsWith = a.label.toLowerCase().startsWith(query);
				const bStartsWith = b.label.toLowerCase().startsWith(query);
				if (aStartsWith && !bStartsWith) return -1;
				if (!aStartsWith && bStartsWith) return 1;
				return a.label.localeCompare(b.label);
			});
	});

	let selectedValue = $derived(
		value ? selectionList.find((item) => item.value === value) || null : null
	);

	// safe effect that never sets undefined
	$effect(() => {
		selected = selectedValue;
	});

	$effect(() => {
		isOpen = open;
	});

	// allow parent to control open state
	$effect(() => {
		open = isOpen;
	});
</script>

{#snippet showIcon(fallbackIcon: any)}
	{@const IconComponent = fallbackIcon}
	<IconComponent size={16} class="text-white" />
{/snippet}

{#if readonly}
	<Popover.Root open={false}>
		<Popover.Trigger class="w-full">
			<Button
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class={`${className} hover:bg-secondary  border-input w-full justify-between bg-white py-3 text-sm font-normal  ${
					selectedValue?.label ? 'text-black' : 'text-black/30'
				}`}
				id={triggerId}
			>
				{#if selectedValue?.label}
					<div class="flex flex-row items-center gap-3">
						{#if selectedValue.image}
							<Avatar.Root class="size-6 rounded-lg">
								<Avatar.Image src={selectedValue.image} alt={selectedValue.image} />
								<Avatar.Fallback class="bg-primary rounded-lg">
									<FileQuestion size={16} class="text-white" />
								</Avatar.Fallback>
							</Avatar.Root>
						{/if}
						{selectedValue.label}
					</div>
				{:else}
					{placeholder}
				{/if}
			</Button>
		</Popover.Trigger>
	</Popover.Root>
{:else}
	<Popover.Root bind:open>
		<Popover.Trigger
			class={`${buttonVariants({ variant: 'outline' })} ${className} hover:bg-secondary border-input w-full justify-between bg-white py-3 text-sm font-normal  ${
				selectedValue?.label ? 'text-black' : 'text-black/30'
			}`}
			role="combobox"
			aria-expanded={open}
			id={triggerId}
		>
			{#if selectedValue?.label}
				<div class="flex flex-row items-center gap-3">
					{#if selectedValue.image}
						<Avatar.Root class="size-6 rounded-lg">
							<Avatar.Image src={selectedValue.image} alt={selectedValue.image} />
							<Avatar.Fallback class="bg-accent-foreground rounded-lg">
								{#if !fallbackIcon}
									<FileQuestion size={16} class="text-white" />
								{:else}
									{@render showIcon(fallbackIcon)}
								{/if}
							</Avatar.Fallback>
						</Avatar.Root>
					{/if}
					{selectedValue.label}
				</div>
			{:else}
				{placeholder}
			{/if}

			<ChevronDown size={16} />
		</Popover.Trigger>
		<Popover.Content class="w-[300px] p-0">
			<Command.Root shouldFilter={false}>
				<Command.Input
					{placeholder}
					bind:value={searchQuery}
					class={`${selectedValue?.label ? 'text-black' : 'text-black/30'}`}
				/>
				<Command.List>
					<!-- <Command.Empty>No options found.</Command.Empty> -->
					<Command.Group>
						<ScrollArea class={searchList.length > 4 ? `h-36` : 'h-auto'}>
							{#each searchList as selection}
								<Command.Item
									class={`flex items-center justify-between ${
										value === selection.value ? 'text-dark' : ''
									}`}
									value={selection.value}
									onSelect={() => {
										value = selection.value;
										closeAndFocusTrigger();
									}}
								>
									<div class="flex flex-row items-center gap-3">
										{#if selection.image}
											<Avatar.Root class="size-8 rounded-lg">
												<Avatar.Image src={selection.image} alt={selection.image} />
												<Avatar.Fallback class="bg-accent-foreground rounded-lg">
													{#if !fallbackIcon}
														<FileQuestion size={16} class="text-white" />
													{:else}
														{@render showIcon(fallbackIcon)}
													{/if}
												</Avatar.Fallback>
											</Avatar.Root>
										{/if}
										{selection.label}
									</div>
									{#if value === selection.value}
										<CheckIcon class="h-3" />
									{/if}
								</Command.Item>
							{/each}
						</ScrollArea>
					</Command.Group>
				</Command.List>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
{/if}
