//most useless but SCRATCHES MY BRAIN

export type Single<T> = {
  data: T;
  error: any | null;
  message?: string;
};

export type List<T> = {
  data: T[];
  error: any | null;
  message?: string;
};
