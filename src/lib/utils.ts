import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Types } from '$lib';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

// export function MovePocketBaseExpandsInline(record: any): any {
// 	if (Array.isArray(record)) {
// 		return record.map((item) => MovePocketBaseExpandsInline(item));
// 	}
//
// 	const newRecord = JSON.parse(JSON.stringify(record));
//
// 	if (!newRecord.expand || Object.keys(newRecord.expand).length === 0) {
// 		const { expand, ...recordWithoutExpand } = newRecord;
// 		return recordWithoutExpand;
// 	}
//
// 	for (const key in newRecord.expand) {
// 		const expandedValue = MovePocketBaseExpandsInline(newRecord.expand[key]);
//
// 		newRecord[key] = expandedValue;
// 	}
//
// 	const { expand, ...recordWithoutExpand } = newRecord;
// 	return recordWithoutExpand;
// }

export function MovePocketBaseExpandsInline<T extends Types.Generic.PocketBaseExpandableRecord>(
	record: T | T[]
): any | any[] {
	if (Array.isArray(record)) {
		return record.map((item) => MovePocketBaseExpandsInline(item));
	}

	const newRecord = JSON.parse(JSON.stringify(record)) as T;

	if (!newRecord.expand || Object.keys(newRecord.expand).length === 0) {
		const { expand, ...recordWithoutExpand } = newRecord;
		return recordWithoutExpand;
	}

	for (const key in newRecord.expand) {
		const expandedValue = MovePocketBaseExpandsInline(newRecord.expand[key]);
		(newRecord as any)[key] = expandedValue;
	}

	const { expand, ...recordWithoutExpand } = newRecord;
	return recordWithoutExpand;
}
