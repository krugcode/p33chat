import type { UsersRecord } from '$lib/types/pocketbase-types';

export const Profile = (user: UsersRecord) => {
  return {
    name: user.firstName,
    email: user.email,
    avatar: user.avatar ?? k
  };
};
