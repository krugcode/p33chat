import { writable, derived } from 'svelte/store';

export type Breadcrumb = {
	title: string;
	url: string;
};

type MetaData = {
	title?: string;
	description?: string;
	keywords?: string[];
	ogImage?: string;
	noindex?: boolean;
	activeBreadcrumb?: Breadcrumb;
	inactiveBreadCrumbs?: Breadcrumb[];
};

const createMetaStore = () => {
	const { subscribe, set, update } = writable<MetaData>({});

	return {
		subscribe,
		set,
		update,
		reset: () => set({}),
		setMeta: (data: Partial<MetaData>) => update((n) => ({ ...n, ...data }))
	};
};

export const pageMeta = createMetaStore();

export const resolvedMeta = derived(pageMeta, ($pageMeta) => ({
	title: $pageMeta.title ?? 'P33 Chat',
	description: $pageMeta.description ?? 'LLM Repository',
	keywords: $pageMeta.keywords ?? ['p33chat', 'p33 ai', 'llm chat', 'krug', 'krug.dev'],
	ogImage: $pageMeta.ogImage ?? '',
	noindex: $pageMeta.noindex ?? false
}));
