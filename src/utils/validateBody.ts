import { IncomingMessage, ServerResponse } from 'http';
import { ErrorMessages, StatusCodes } from '../constants';
import { responseError } from '../controller';
import { UserDto } from '../types';

export const validateUserBody = (
  buffer: Buffer[],
  response: ServerResponse<IncomingMessage>,
  callback: (body: UserDto) => void,
): void => {
  try {
    const body = JSON.parse(Buffer.concat(buffer).toString());

    if ('username' in body && 'age' in body && 'hobbies' in body) {
      callback(body);
      return;
    }

    responseError(response, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_BODY);
  } catch {
    responseError(response, StatusCodes.INTERNAL, ErrorMessages.INTERNAL);
  }
};
