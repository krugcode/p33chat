<script lang="ts">
	import * as Form from '$lib/components/ui/form';
	import { Types } from '$lib';
	import { ChatFormSchema } from './_schemas';
	import { zodClient } from 'sveltekit-superforms/adapters';
	import { superForm } from 'sveltekit-superforms';
	import { goto, invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import StateIndicator from '$lib/components/state-indicator.svelte';
	import { Send, Sparkles, X } from '@lucide/svelte';
	import { cn } from '$lib/utils';
	import {
		DetectContentType,
		FormatFileSize,
		GenerateFileName,
		GetFileIcon,
		LONG_PASTE_THRESHOLD
	} from './chat-helpers';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';

	let { superform, onSuccess }: { superform: any; onSuccess?: (form: any) => {} } = $props();
	const isMobile = new IsMobile();
	let showLoading = $state(false);
	let attachments = $state<
		Array<{
			id: string;
			name: string;
			content: string;
			size: number;
			type: 'text' | 'code' | 'json' | 'html' | 'url';
			lines: number;
		}>
	>([]);

	let error: Types.Generic.FormError = $state({} as Types.Generic.FormError);
	const form = superForm(superform, {
		dataType: 'json',
		validators: zodClient(ChatFormSchema),
		clearOnSubmit: 'none',
		resetForm: false,
		onSubmit: () => {
			error = {} as Types.Generic.FormError;
			showLoading = true;

			validateForm({ update: true });
		},
		onUpdate: async ({ form }) => {
			console.log('form', form);
			showLoading = false;
			if (!form.valid && form?.message) {
				error.summary = form.message;
				return;
			}
			if (form.valid) {
				attachments = [];
				await invalidateAll();
			}
		},
		onError: (e: any) => {
			showLoading = false;
			error.summary = e.message ?? 'Unable to request a password reset';
			error.debug = JSON.stringify(e);
		}
	});
	const { form: formData, enhance, validateForm } = form;

	$effect(() => {
		if (attachments.length > 0) {
			$formData.attachments = attachments;
		}
	});
	function autoResize(e: any) {
		const textarea = e.target;
		textarea.style.height = 'auto';
		textarea.style.height = textarea.scrollHeight + 'px';
	}
	function handlePaste(e: ClipboardEvent) {
		const pastedText = e.clipboardData?.getData('text') || '';

		if (pastedText.length > LONG_PASTE_THRESHOLD) {
			e.preventDefault();

			const contentType = DetectContentType(pastedText);
			const attachment = {
				id: crypto.randomUUID(),
				name: GenerateFileName(pastedText, contentType),
				content: pastedText,
				size: pastedText.length,
				type: contentType,
				lines: pastedText.split('\n').length
			};

			attachments = [...attachments, attachment];
		}
	}
	function removeAttachment(id: string) {
		attachments = attachments.filter((att) => att.id !== id);
	}
</script>

{#snippet fileIcon(type: string)}
	{@const IconComponent = GetFileIcon(type)}
	<IconComponent class="h-4 w-4 flex-shrink-0 text-blue-600" />
{/snippet}
<div class="relative">
	<div class={showLoading ? 'absolute z-10 h-full w-full' : 'hidden'}>
		<StateIndicator show={showLoading} />
	</div>
	<form
		action="/chat?/chatInit"
		autocomplete="off"
		method="POST"
		class={showLoading ? 'w-full blur-xs' : 'w-full'}
		use:enhance
	>
		<div class="flex w-full flex-col gap-4 rounded-lg border p-3">
			{#if attachments.length > 0}
				<div
					class=" grid auto-rows-min grid-cols-2 gap-2 border-b pb-3 md:grid-cols-3 lg:grid-cols-6"
				>
					{#each attachments as attachment (attachment.id)}
						<div class="bg-background border-border flex items-center gap-2 rounded-md border p-2">
							{@render fileIcon(attachment.type)}
							<div class="min-w-0 flex-1">
								<div class="text-foreground truncate text-xs font-medium">
									{attachment.name}
								</div>
								<div class="text-muted-foreground text-xs">
									{FormatFileSize(attachment.size)} • {attachment.lines} lines
								</div>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onclick={() => removeAttachment(attachment.id)}
								class="text-muted-foreground hover:text-foreground"
							>
								<X class="h-3 w-3" />
							</Button>
						</div>
					{/each}
				</div>
			{/if}
			<div class={'w-full flex-row'}>
				<Form.Field {form} name={'text'}>
					<Form.Control>
						{#snippet children({ props })}
							<textarea
								data-slot="textarea"
								placeholder="Chat to your buddy"
								class={cn(
									'placeholder:text-muted-foreground flex field-sizing-content max-h-[300px] min-h-[32px] w-full resize-none overflow-y-auto rounded-md border border-none bg-transparent px-3 py-1.5 text-base transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm'
								)}
								rows="1"
								{...props}
								bind:value={$formData.email}
								oninput={autoResize}
								onpaste={handlePaste}
							></textarea>
						{/snippet}
					</Form.Control>
				</Form.Field>
			</div>
			<div class="flex flex-row items-center justify-between">
				<div class="text-muted-foreground text-xs">
					{#if attachments.length > 0}
						{attachments.length} file{attachments.length === 1 ? '' : 's'} attached
					{:else if ($formData.email?.length || 0) > LONG_PASTE_THRESHOLD}
						<span class="text-amber-600">
							Long content detected - consider pasting separately to create attachment
						</span>
					{/if}
				</div>

				<Button
					type="submit"
					size={isMobile.current ? 'icon' : 'default'}
					disabled={!$formData.email?.trim() && attachments.length === 0}
				>
					<span class="sr-only">Generate</span>
					<span class="hidden md:inline">Generate</span>
					<Sparkles />
				</Button>
			</div>
		</div>
		{#if attachments.length > 0}
			<input type="hidden" name="attachments" value={JSON.stringify(attachments)} />
		{/if}
	</form>
</div>
