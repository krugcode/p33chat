<script lang="ts">
	import { Images } from '$lib';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLElement>> = $props();
</script>

<main
	bind:this={ref}
	data-slot="sidebar-inset"
	class={cn(
		'bg-background relative flex h-[calc(dvh-3rem)] w-full flex-col',
		'md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2',
		className
	)}
	{...restProps}
>
	<!-- Grid overlay -->
	{@render children?.()}

	<div class="grid"></div>
</main>

<style>
	/* Grid overlay */
	.grid {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-image:
			linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
			linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
		background-size: 50px 50px;
		animation: gridMove 20s linear infinite;
		z-index: 0; /* Above background elements */
		pointer-events: none;
	}
	.grid {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.02) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.02) 1px, transparent 1px);
	}

	/* .dark.grid { */
	/* 	background-image: */
	/* 		linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), */
	/* 		linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px); */
	/* } */
</style>
