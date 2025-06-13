import type { TypedPocketBase } from '$lib/types/pocketbase-types';
import type { Single } from '$lib/types/server';

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
      const columns = Object.keys(data[index]);
      const columnsToCheck = columns.filter((column) => fileColumns.includes(column));
      if (columnsToCheck.length > 0) {
        const columnsWithValues = columnsToCheck.filter((column) => {
          return !!data[index][column];
        });

        columnsWithValues.forEach((column) => {
          const filename = data[index][column];
          const serverURL: string = pb.files.getURL(data[index], filename, options);

          if (process.env.S3_ENABLED === 'false') {
            // replace server url with public url for browser access
            const publicURL = ReplaceServerUrlWithPublic(serverURL);
            (data[index] as any)[column] = publicURL;
          } else {
            (data[index] as any)[column] = serverURL;
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
