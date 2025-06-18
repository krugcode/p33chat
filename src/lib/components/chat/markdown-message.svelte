<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import DOMPurify from 'dompurify';
	import { onMount } from 'svelte';

	let { content = '' } = $props();
	let renderedContent = $state('');

	const renderer = new marked.Renderer();

	renderer.code = function (codeArg: any, langArg?: any, escapedArg?: any) {
		let codeString: string;
		let language: string;

		// this got fucky very fast
		if (typeof codeArg === 'object' && codeArg !== null) {
			codeString =
				typeof codeArg.text === 'string'
					? codeArg.text
					: String(codeArg.text || codeArg.code || '');
			language = codeArg.lang || codeArg.language || 'plaintext';
		} else {
			codeString = typeof codeArg === 'string' ? codeArg : String(codeArg || '');
			language = typeof langArg === 'string' ? langArg : String(langArg || 'plaintext');
		}

		const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';

		let highlighted: string;
		try {
			highlighted = hljs.highlight(codeString, { language: validLang }).value;
		} catch (err) {
			console.warn('Highlighting failed, using plain text:', err);
			highlighted = hljs.highlightAuto(codeString).value;
		}

		return `
			<div class="code-block-container">
				<div class="code-block-header">
					<span class="code-block-language">${validLang}</span>
					<button class="copy-code-btn" data-code="${encodeURIComponent(codeString)}">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
							<path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
						</svg>
					</button>
				</div>
				<pre><code class="hljs language-${validLang}">${highlighted}</code></pre>
			</div>
		`;
	};

	renderer.codespan = function (codeArg: any) {
		console.log('Codespan renderer called with:', { codeArg });

		let codeString: string;

		if (typeof codeArg === 'object' && codeArg !== null) {
			codeString =
				typeof codeArg.text === 'string'
					? codeArg.text
					: String(codeArg.text || codeArg.code || '');
		} else {
			codeString = typeof codeArg === 'string' ? codeArg : String(codeArg || '');
		}

		return `<code class="inline-code">${codeString}</code>`;
	};

	marked.use({
		renderer,
		breaks: true,
		gfm: true
	});

	$effect(() => {
		if (content && typeof content === 'string') {
			try {
				const parsed = marked.parse(content);
				renderedContent = DOMPurify.sanitize(parsed, {
					ALLOWED_TAGS: [
						'p',
						'br',
						'strong',
						'em',
						'u',
						'strike',
						'code',
						'pre',
						'h1',
						'h2',
						'h3',
						'h4',
						'h5',
						'h6',
						'ul',
						'ol',
						'li',
						'blockquote',
						'a',
						'img',
						'table',
						'thead',
						'tbody',
						'tr',
						'th',
						'td',
						'div',
						'span',
						'button',
						'svg',
						'rect',
						'path'
					],
					ALLOWED_ATTR: [
						'href',
						'target',
						'rel',
						'src',
						'alt',
						'class',
						'data-code',
						'width',
						'height',
						'viewBox',
						'fill',
						'stroke',
						'stroke-width',
						'd',
						'x',
						'y',
						'rx',
						'ry'
					]
				});
			} catch (error) {
				console.error('Markdown parsing failed:', error);

				renderedContent = DOMPurify.sanitize(content.replace(/</g, '&lt;').replace(/>/g, '&gt;'));
			}
		} else {
			renderedContent = '';
		}
	});

	onMount(() => {
		const handleCopyClick = async (event: Event) => {
			const target = event.target as HTMLElement;
			const button = target.closest('.copy-code-btn') as HTMLButtonElement;
			if (button) {
				const code = decodeURIComponent(button.dataset.code || '');

				try {
					if (navigator.clipboard && window.isSecureContext) {
						await navigator.clipboard.writeText(code);
						showCopySuccess(button);
					} else {
						// fallback for older browsers
						await fallbackCopyTextToClipboard(code);
						showCopySuccess(button);
					}
				} catch (err) {
					console.warn('Copy failed:', err);
					// try the fallback method
					try {
						await fallbackCopyTextToClipboard(code);
						showCopySuccess(button);
					} catch (fallbackErr) {
						console.error('All copy methods failed:', fallbackErr);
						showCopyError(button);
					}
				}
			}
		};

		function fallbackCopyTextToClipboard(text: string): Promise<void> {
			return new Promise((resolve, reject) => {
				const textArea = document.createElement('textarea');
				textArea.value = text;

				textArea.style.top = '0';
				textArea.style.left = '0';
				textArea.style.position = 'fixed';
				textArea.style.opacity = '0';

				document.body.appendChild(textArea);
				textArea.focus();
				textArea.select();

				try {
					const successful = document.execCommand('copy');
					document.body.removeChild(textArea);

					if (successful) {
						resolve();
					} else {
						reject(new Error('execCommand copy failed'));
					}
				} catch (err) {
					document.body.removeChild(textArea);
					reject(err);
				}
			});
		}

		// visual feedback for successful copy
		function showCopySuccess(button: HTMLButtonElement) {
			const originalColor = button.style.color;
			button.style.color = '#10b981';

			const svg = button.querySelector('svg');
			if (svg) {
				svg.innerHTML = `
					<path d="M20 6 9 17l-5-5" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
				`;

				setTimeout(() => {
					svg.innerHTML = `
						<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
						<path d="m4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
					`;
					button.style.color = originalColor;
				}, 1500);
			} else {
				setTimeout(() => {
					button.style.color = originalColor;
				}, 1500);
			}
		}

		function showCopyError(button: HTMLButtonElement) {
			const originalColor = button.style.color;
			button.style.color = '#ef4444';
			setTimeout(() => {
				button.style.color = originalColor;
			}, 1500);
		}

		document.addEventListener('click', handleCopyClick);
		return () => document.removeEventListener('click', handleCopyClick);
	});
</script>

<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
	/>
</svelte:head>

<div class="markdown-content">
	{@html renderedContent}
</div>

<style>
	:global(.code-block-container) {
		margin: 1rem 0;
		border-radius: 0.5rem;
		overflow: hidden;
		border: 1px solid #e5e7eb;
		width: 100%;
		max-width: 100%;
	}

	:global(.code-block-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem 1rem;
		background-color: #f9fafb;
		border-bottom: 1px solid #e5e7eb;
		width: 100%;
		box-sizing: border-box;
	}

	:global(.code-block-language) {
		font-size: 0.75rem;
		font-weight: 500;
		color: #6b7280;
		text-transform: uppercase;
	}

	:global(.copy-code-btn) {
		background: none;
		border: none;
		color: #6b7280;
		cursor: pointer;
		padding: 0.25rem;
		border-radius: 0.25rem;
		transition: color 0.2s;
		flex-shrink: 0;
	}

	:global(.copy-code-btn:hover) {
		color: #374151;
	}

	:global(.code-block-container pre) {
		margin: 0;
		padding: 1rem;
		overflow-x: auto;
		background-color: #ffffff;
		width: 100%;
		max-width: 100%;
		box-sizing: border-box;
		white-space: pre;
	}

	:global(.code-block-container code) {
		font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
		font-size: 0.875rem;
		line-height: 1.5;
		display: block;
		width: 100%;
		overflow-wrap: break-word;
	}

	:global(.inline-code) {
		background-color: #f3f4f6;
		padding: 0.125rem 0.25rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
		color: #e11d48;
		font-family: 'Fira Code', 'Monaco', 'Cascadia Code', 'Roboto Mono', monospace;
		word-break: break-word; /* Break long inline code */
	}

	:global(.markdown-content) {
		line-height: 1.6;
		width: 100%; /* Full width of container */
		max-width: 100%; /* Don't exceed container */
		overflow-wrap: break-word; /* Handle long words */
	}

	:global(
		.markdown-content h1,
		.markdown-content h2,
		.markdown-content h3,
		.markdown-content h4,
		.markdown-content h5,
		.markdown-content h6
	) {
		margin-top: 1.5rem;
		margin-bottom: 0.5rem;
		font-weight: 600;
		overflow-wrap: break-word; /* Break long headings */
	}

	:global(.markdown-content p) {
		margin-bottom: 1rem;
		overflow-wrap: break-word; /* Break long paragraphs */
	}

	:global(.markdown-content ul, .markdown-content ol) {
		margin-bottom: 1rem;
		padding-left: 1.5rem;
	}

	:global(.markdown-content blockquote) {
		border-left: 4px solid #e5e7eb;
		padding-left: 1rem;
		margin: 1rem 0;
		color: #6b7280;
		font-style: italic;
		overflow-wrap: break-word; /* Break long quotes */
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		:global(.code-block-container pre) {
			padding: 0.75rem; /* Smaller padding on mobile */
			font-size: 0.8rem; /* Slightly smaller font on mobile */
		}

		:global(.code-block-header) {
			padding: 0.5rem 0.75rem; /* Smaller header padding on mobile */
		}

		:global(.code-block-language) {
			font-size: 0.7rem; /* Smaller language label on mobile */
		}
	}
</style>
