import { IncomingMessage, ServerResponse } from 'http';
import { AGE, ErrorMessages, HOBBIES, StatusCodes, USERNAME } from '../constants';
import { responseError } from '../controller';
import { UserDto } from '../types';

export const validateUserBody = (
  buffer: Buffer[],
  response: ServerResponse<IncomingMessage>,
  callback: (body: UserDto) => void,
): void => {
  try {
    const body = JSON.parse(Buffer.concat(buffer).toString());

    const isCheckFieldsExist: boolean = USERNAME in body && AGE in body && HOBBIES in body;
    const isCheckFieldsTypes: boolean =
      typeof body.username === 'string' &&
      typeof body.age === 'number' &&
      body.hobbies.every((hobby: unknown): boolean => typeof hobby === 'string');

    if (isCheckFieldsExist && isCheckFieldsTypes) {
      callback(body);
      return;
    }

    responseError(response, StatusCodes.BAD_REQUEST, ErrorMessages.INVALID_BODY);
  } catch {
    responseError(response, StatusCodes.INTERNAL, ErrorMessages.INTERNAL);
  }
};
