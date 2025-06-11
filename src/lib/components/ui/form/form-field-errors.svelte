<script lang="ts">
	import * as FormPrimitive from 'formsnap';
	import { cn, type WithoutChild } from '$lib/utils.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { AlertCircle } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		class: className,
		errorClasses,
		children: childrenProp,
		...restProps
	}: WithoutChild<FormPrimitive.FieldErrorsProps> & {
		errorClasses?: string | undefined | null;
	} = $props();
</script>

<FormPrimitive.FieldErrors bind:ref class={cn(className)} {...restProps}>
	{#snippet children({ errors, errorProps })}
		{#if childrenProp}
			{@render childrenProp({ errors, errorProps })}
		{:else if errors.length === 1}
			<!-- Single error with icon -->
			<div
				{...errorProps}
				class={cn('text-destructive flex items-center gap-1 text-sm font-medium', errorClasses)}
			>
				<AlertCircle size={14} />
				{errors[0]}
			</div>
		{:else if errors.length > 1}
			<!-- Multiple errors in popover -->
			<Popover.Root>
				<Popover.Trigger
					class={cn(
						'text-destructive hover:text-destructive/80 flex items-center gap-1 text-sm font-medium transition-colors',
						errorClasses
					)}
				>
					<AlertCircle size={14} />
					<span>{errors.length} issues</span>
				</Popover.Trigger>
				<Popover.Content class="w-fit max-w-sm p-3">
					<div class="space-y-2">
						{#each errors as error (error)}
							<div
								{...errorProps}
								class="text-destructive flex items-start gap-1 text-sm font-medium"
							>
								<AlertCircle size={12} class="mt-0.5 flex-shrink-0" />
								{error}
							</div>
						{/each}
					</div>
				</Popover.Content>
			</Popover.Root>
		{/if}
	{/snippet}
</FormPrimitive.FieldErrors>
