import { validate } from 'uuid';

export const getID = (url: string): string | undefined => {
  return url.split('/').at(-1);
};

export const validateID = (id: string): boolean => {
  return validate(id);
};
