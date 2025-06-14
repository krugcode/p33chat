<script lang="ts">
	import {
		Upload,
		X,
		File as FileIcon,
		Image as ImageIcon,
		FileText,
		Music,
		Video
	} from '@lucide/svelte';
	import { Button } from '../button/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLInputAttributes, 'type' | 'class'> {
		name: string;
		class?: string;
		files?: FileList | null;
		maxSize?: number; // in bytes
		maxFiles?: number;
		showPreview?: boolean;
		showFileInfo?: boolean;
		dragDropText?: string;
		browseText?: string;
		acceptedTypes?: string[];
		variant?: 'default' | 'compact';
	}

	let {
		name,
		class: className = '',
		files = $bindable(null),
		maxSize = 5 * 1024 * 1024, // 5mb default
		maxFiles = 1,
		showPreview = true,
		showFileInfo = true,
		dragDropText = 'Choose files or drag & drop',
		browseText = 'Browse Files',
		acceptedTypes = [],
		variant = 'default',
		accept = '',
		...restProps
	}: Props = $props();

	let dragOver = $state(false);
	let inputElement: HTMLInputElement;

	// generate accept string from acceptedtypes if not provided
	const acceptString = $derived(accept || acceptedTypes.join(','));
	const fileArray = $derived(files ? Array.from(files) : []);
	const validation = $derived(() => {
		const errors: string[] = [];

		if (fileArray.length > maxFiles) {
			errors.push(`Maximum ${maxFiles} file${maxFiles === 1 ? '' : 's'} allowed`);
		}

		for (const file of fileArray) {
			if (file.size > maxSize) {
				const maxMB = Math.round(maxSize / 1024 / 1024);
				errors.push(`${file.name} exceeds ${maxMB}MB limit`);
			}

			if (
				acceptedTypes.length > 0 &&
				!acceptedTypes.some((type) => file.type.match(type.replace('*', '.*')))
			) {
				errors.push(`${file.name} is not an accepted file type`);
			}
		}

		return {
			isValid: errors.length === 0,
			errors
		};
	});

	// generate preview urls for images
	let previewUrls = $derived.by(() => {
		if (!showPreview || fileArray.length === 0) return [];

		return fileArray
			.filter((file) => file.type.startsWith('image/'))
			.map((file) => URL.createObjectURL(file));
	});
	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			files = target.files;
		}
	}
	$effect(() => {
		return () => {
			// cleanup urls when component destroys
			previewUrls.forEach((url) => URL.revokeObjectURL(url));
		};
	});

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const droppedFiles = event.dataTransfer?.files;
		if (droppedFiles && droppedFiles.length > 0) {
			files = droppedFiles;
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		// only set dragover to false if we're leaving the dropzone entirely
		//@ts-ignore
		const rect = event.currentTarget?.getBoundingClientRect();
		if (rect) {
			const x = event.clientX;
			const y = event.clientY;
			if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
				dragOver = false;
			}
		}
	}

	function clearFiles() {
		files = null;
		if (inputElement) {
			inputElement.value = '';
		}
	}

	function removeFile(index: number) {
		if (fileArray.length <= 1) {
			clearFiles();
			return;
		}

		const dt = new DataTransfer();
		fileArray.forEach((file, i) => {
			if (i !== index) dt.items.add(file);
		});

		files = dt.files;
		if (inputElement) {
			inputElement.files = dt.files;
		}
	}

	function getFileIcon(file: File) {
		const fileType = file.type;
		if (fileType.startsWith('image/')) return ImageIcon;
		if (fileType.startsWith('video/')) return Video;
		if (fileType.startsWith('audio/')) return Music;
		if (fileType.includes('text') || fileType.includes('document')) return FileText;
		return FileIcon;
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 B';
		const k = 1024;
		const sizes = ['B', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
	}

	function triggerFileSelect() {
		inputElement?.click();
	}
</script>

{#snippet showIcon(file: File)}
	{@const IconComponent = getFileIcon(file)}
	<IconComponent size={16} class="text-white" />
{/snippet}

<div class={cn('w-full', className)}>
	<!-- Main Upload Area -->
	<div
		class={cn(
			'relative rounded-lg border-2 border-dashed transition-all duration-200',
			dragOver
				? 'border-primary bg-primary/5 scale-[1.02]'
				: 'border-muted-foreground/25 hover:border-muted-foreground/50',
			fileArray.length > 0 && variant === 'default' ? 'border-border bg-muted/20 border-solid' : '',
			variant === 'compact' ? 'p-4' : 'p-6',
			!validation().isValid ? 'border-destructive bg-destructive/5' : ''
		)}
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		role="button"
		tabindex="0"
		onclick={triggerFileSelect}
		onkeydown={(e) => e.key === 'Enter' && triggerFileSelect()}
	>
		{#if fileArray.length === 0}
			<!-- Empty State -->
			<div class="text-center">
				<div
					class={cn(
						'bg-muted mx-auto mb-3 flex items-center justify-center rounded-full',
						variant === 'compact' ? 'h-8 w-8' : 'h-12 w-12'
					)}
				>
					{#if dragOver}
						<Upload size={variant === 'compact' ? 16 : 20} class="text-primary" />
					{:else}
						<Upload size={variant === 'compact' ? 16 : 20} class="text-muted-foreground" />
					{/if}
				</div>

				<div class="space-y-1">
					<p class={cn('font-medium', variant === 'compact' ? 'text-xs' : 'text-sm')}>
						{dragOver ? 'Drop your files here' : dragDropText}
					</p>
					<p class={cn('text-muted-foreground', variant === 'compact' ? 'text-xs' : 'text-xs')}>
						{#if acceptedTypes.length > 0}
							{acceptedTypes.join(', ')} up to {formatFileSize(maxSize)}
						{:else}
							Up to {formatFileSize(maxSize)}
						{/if}
					</p>
				</div>
			</div>
		{:else}
			<!-- files display -->
			<div class={cn('space-y-3', variant === 'compact' ? 'space-y-2' : '')}>
				{#each fileArray as file, index}
					<div
						class={cn(
							'bg-background flex items-center gap-3 rounded-md border p-2',
							variant === 'compact' ? 'gap-2 p-2' : ''
						)}
					>
						<!-- File Icon/Preview -->
						<div class={cn('flex-shrink-0', variant === 'compact' ? 'h-6 w-6' : 'h-10 w-10')}>
							{#if showPreview && file.type.startsWith('image/') && previewUrls[fileArray
										.filter((f) => f.type.startsWith('image/'))
										.indexOf(file)]}
								<img
									src={previewUrls[
										fileArray.filter((f) => f.type.startsWith('image/')).indexOf(file)
									]}
									alt="Preview"
									class={cn(
										'rounded object-cover',
										variant === 'compact' ? 'h-6 w-6' : 'h-10 w-10'
									)}
								/>
							{:else}
								<div
									class={cn(
										'bg-muted flex items-center justify-center rounded',
										variant === 'compact' ? 'h-6 w-6' : 'h-10 w-10'
									)}
								>
									{@render showIcon(file)}
								</div>
							{/if}
						</div>

						<!-- file info -->
						<div class="min-w-0 flex-1">
							<p class={cn('truncate font-medium', variant === 'compact' ? 'text-xs' : 'text-sm')}>
								{file.name}
							</p>
							{#if showFileInfo}
								<p
									class={cn('text-muted-foreground', variant === 'compact' ? 'text-xs' : 'text-xs')}
								>
									{formatFileSize(file.size)}
									{#if file.type}
										• {file.type}
									{/if}
								</p>
							{/if}
						</div>

						<!-- remove button -->
						<Button
							type="button"
							variant="ghost"
							size={variant === 'compact' ? 'sm' : 'sm'}
							class={cn(
								'hover:bg-destructive hover:text-destructive-foreground flex-shrink-0',
								variant === 'compact' ? 'h-6 w-6 p-0' : 'h-8 w-8 p-0'
							)}
							onclick={(e) => {
								e.stopPropagation();
								removeFile(index);
							}}
						>
							<X size={variant === 'compact' ? 12 : 14} />
						</Button>
					</div>
				{/each}
			</div>
		{/if}

		<!-- hidden file input -->
		<input
			bind:this={inputElement}
			{name}
			type="file"
			accept={acceptString}
			multiple={maxFiles > 1}
			class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
			onchange={handleFileSelect}
			{...restProps}
		/>
	</div>

	<!-- Browse Button (when files are present) -->

	{#if fileArray.length > 0 && maxFiles > fileArray.length}
		<div class="mt-3 flex w-full justify-center">
			<Button type="button" variant="outline" size="sm" onclick={triggerFileSelect}>
				<Upload size={14} class="mr-2" />
				Add More Files
			</Button>
		</div>
	{:else if fileArray.length === 0 && variant === 'compact'}
		<div class="mt-3 flex w-full justify-center">
			<Button type="button" variant="outline" size="sm" onclick={triggerFileSelect}>
				<Upload size={14} class="mr-2" />
				{browseText}
			</Button>
		</div>
	{/if}

	{#if !validation().isValid}
		<div class="mt-2 space-y-1">
			{#each validation().errors as error}
				<p class="text-destructive text-xs">{error}</p>
			{/each}
		</div>
	{/if}
</div>
