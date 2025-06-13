// export async function GetModelsByUser(
//   pb: TypedPocketBase,
//   user: AuthRecord
// ): Promise<Types.Server.Single<Types.Generic.UserModelWithModel[]>> {
//   let error: any | null = null;
//   let notify: string = '';
//   let modelsResponse: Types.Generic.UserModelWithModel[] = [];
//
//   try {
//     let filter = `user="${user?.id}" `;
//
//     let getModel = await pb.collection('userProviders').getFullList({
//       sort: '-created',
//       expand: 'providers',
//       ...(filter && { filter })
//     });
//
//     if (getModel.length === 0) {
//       notify = 'No models found for this user';
//       return { data: modelsResponse, error, notify };
//     }
//
//     const flattened = MovePocketBaseExpandsInline(getModel);
//     modelsResponse = flattened as Types.Generic.UserModelWithModel[];
//   } catch (e: any) {
//     error = e;
//     notify = e.message || 'Failed to fetch user models';
//     return { data: modelsResponse, error, notify };
//   }
//
//   return { data: modelsResponse, error, notify };
// }
