import type { SelectionInput } from '$lib/types/generic';
import { FlattenObject } from '$lib/utils';
import { Code, Code2, CodeXml, FileText, Hash, Link } from '@lucide/svelte';

export const LONG_PASTE_THRESHOLD = 800;

export function FormatFileSize(chars: number): string {
  if (chars < 1024) return `${chars} chars`;
  if (chars < 1024 * 1024) return `${(chars / 1024).toFixed(1)}K chars`;
  return `${(chars / (1024 * 1024)).toFixed(1)}M chars`;
}

export function GetFileIcon(type: string) {
  switch (type) {
    case 'code':
      return Code;
    case 'json':
      return Hash;
    case 'html':
      return CodeXml;
    case 'url':
      return Link;

    default:
      return FileText;
  }
}

export function GenerateFileName(content: string, type: string): string {
  const firstLine = content.split('\n')[0].slice(0, 40).trim();
  const timestamp = new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  switch (type) {
    case 'code':
      return `Code snippet ${timestamp}.txt`;
    case 'json':
      return `Data ${timestamp}.json`;
    case 'html':
      return `HTML ${timestamp}.html`;
    case 'url':
      return `Links ${timestamp}.txt`;
    default:
      return firstLine
        ? `${firstLine.replace(/[^a-zA-Z0-9\s]/g, '')} ${timestamp}.txt`
        : `Pasted content ${timestamp}.txt`;
  }
}

export function DetectContentType(content: string): 'text' | 'code' | 'json' | 'html' | 'url' {
  if (content.includes('```') || content.match(/^(function|const|let|var|class|import|export)/m)) {
    return 'code';
  }
  if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
    try {
      JSON.parse(content);
      return 'json';
    } catch { }
  }
  if (content.includes('<html') || content.includes('<!DOCTYPE')) {
    return 'html';
  }
  if (content.match(/https?:\/\/[^\s]+/g)) {
    return 'url';
  }
  return 'text';
}

// cleaning up some verboseness
export function ConvertToSelectList<T>(
  key: string,
  data: T[],
  valueKey: string,
  labelKey: string,
  image?: string
): SelectionInput[] {
  if (data.length === 0) {
    console.log(`Unable to map data for ${key}`);
    return [] as SelectionInput[];
  }

  const selectlist = data.map((item) => {
    const flattened = FlattenObject(item);

    return {
      value: flattened[valueKey] as string,
      label: flattened[labelKey] as string,
      image: image ? (flattened[image] as string) : undefined
    };
  });

  return selectlist;
}
