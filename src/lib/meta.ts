import { writable, derived } from 'svelte/store';

interface MetaData {
	title?: string;
	description?: string;
	keywords?: string[];
	ogImage?: string;
	noindex?: boolean;
}

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
	title: $pageMeta.title ?? 'loading',
	description: $pageMeta.description ?? '',
	keywords: $pageMeta.keywords ?? '',
	ogImage: $pageMeta.ogImage ?? '',
	noindex: $pageMeta.noindex ?? false
}));
