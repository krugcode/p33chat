import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { Single } from '$lib/types/server';
import { FlattenObject, GetNestedObject, SetNestedValue } from '$lib/utils';

interface FileUrlOptions {
  thumb?: string;
  download?: boolean;
}

// choose which file columns we want to return
export function GetPocketBaseFile<T extends Record<string, any>>(
  pb: TypedPocketBase,
  data: T[],
  fileColumns: string[],
  options: FileUrlOptions = {}
): Single<T[]> {
  let error: any | null = null;
  let response: T[] = [];

  try {
    for (let index = 0; index < data.length; index++) {
      const flattened = FlattenObject(data[index]);
      const flattenedKeys = Object.keys(flattened);

      const columnsToCheck = flattenedKeys.filter((column) => fileColumns.includes(column));

      if (columnsToCheck.length > 0) {
        const columnsWithValues = columnsToCheck.filter((column) => {
          return !!flattened[column];
        });

        columnsWithValues.forEach((column) => {
          const filename = flattened[column];

          const recordForFile = column.includes('.')
            ? GetNestedObject(data[index], column)
            : data[index];

          if (recordForFile) {
            const serverURL: string = pb.files.getURL(recordForFile, filename, options);

            const finalURL =
              process.env.S3_ENABLED === 'false'
                ? ReplaceServerUrlWithPublic(serverURL)
                : serverURL;

            SetNestedValue(data[index], column, finalURL);
          }
        });
      }

      response.push(data[index]);
    }
  } catch (e) {
    error = e;
  }

  return { data: response, error };
}

// TODO: hacky? sacky? fuck it we ball
export function ReplaceServerUrlWithPublic(serverUrl: string): string {
  const publicUrl = process.env.POCKETBASE_PUBLIC_URL || 'http://localhost:8090';

  return serverUrl
    .replace('http://pocketbase:8090', publicUrl)
    .replace('http://localhost:8090', publicUrl);
}
