<script lang="ts">
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import DOMPurify from 'dompurify';
	import { onMount } from 'svelte';

	let { content = '' } = $props();
	let renderedContent = $state('');

	// Configure marked with highlight.js
	marked.setOptions({
		highlight: function (code, lang) {
			if (lang && hljs.getLanguage(lang)) {
				try {
					return hljs.highlight(code, { language: lang }).value;
				} catch (err) {
					console.warn('Syntax highlighting failed:', err);
				}
			}
			return hljs.highlightAuto(code).value;
		},
		breaks: true,
		gfm: true
	});

	// Custom renderer for better styling control
	const renderer = new marked.Renderer();

	// Custom code block renderer
	renderer.code = function (code, language) {
		const validLang = language && hljs.getLanguage(language) ? language : 'plaintext';
		const highlighted = hljs.highlight(code, { language: validLang }).value;

		return `
			<div class="code-block-container">
				<div class="code-block-header">
					<span class="code-block-language">${validLang}</span>
					<button class="copy-code-btn" data-code="${encodeURIComponent(code)}">
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

	// Custom inline code renderer
	renderer.codespan = function (code) {
		return `<code class="inline-code">${code}</code>`;
	};

	marked.use({ renderer });

	$effect(() => {
		if (content) {
			// Parse markdown and sanitize for security
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
		}
	});

	onMount(() => {
		// Handle copy code button clicks
		const handleCopyClick = (event: Event) => {
			const target = event.target as HTMLElement;
			const button = target.closest('.copy-code-btn') as HTMLButtonElement;
			if (button) {
				const code = decodeURIComponent(button.dataset.code || '');
				navigator.clipboard.writeText(code).then(() => {
					// Visual feedback
					button.style.color = '#10b981';
					setTimeout(() => {
						button.style.color = '';
					}, 1000);
				});
			}
		};

		document.addEventListener('click', handleCopyClick);
		return () => document.removeEventListener('click', handleCopyClick);
	});
</script>

<!-- Include highlight.js CSS -->
<svelte:head>
	<link
		rel="stylesheet"
		href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github.min.css"
	/>
</svelte:head>

<div class="markdown-content">
	{@html renderedContent}
</div>
