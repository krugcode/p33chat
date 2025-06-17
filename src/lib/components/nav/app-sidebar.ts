export type NavMenuItem = {
	id: string;
	title: string;
	url: string;
	// This should be `Component` after @lucide/svelte updates types
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	icon?: any;
	isActive?: boolean;
	items?: NavMenuItem[];
};

export const sidebarItems = {};

export function ConvertChatsToNavItems(data: any[], currentPath: string): NavMenuItem[] {
	const navItem: NavMenuItem[] = data.map((chat) => {
		return {
			id: chat.id,
			title: chat?.title?.length > 0 ? chat?.title : 'New Chat',
			url: `/chat/${chat.id}/`,
			isActive: `/chat/${chat.id}/` === currentPath
		};
	});
	return navItem;
}
