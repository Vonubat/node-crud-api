import { validate } from 'uuid';

export const getAndValidateID = (url: string): string | null => {
  const id = url.split('/').at(-1);

  if (!id || !validate(id)) {
    return null;
  }

  return id;
};
