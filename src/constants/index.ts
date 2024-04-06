export const DEFAULT_PORT = 4000;

export const enum Endpoints {
  USERS = '/api/users',
}

export const enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export const enum StatusCodes {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  NOT_FOUND = 404,
  INTERNAL = 500,
}

export enum ErrorMessages {
  INTERNAL = 'Unexpected server error',
  INVALID_ENDPOINT = 'Endpoint is not available',
  INVALID_METHOD = 'Method is not supported',
  INVALID_ID = 'Invalid user id',
  INVALID_BODY = 'Invalid user data',
  ID_NOT_FOUND = 'User with this id not found',
}

export const USERNAME = 'username';
export const AGE = 'age';
export const HOBBIES = 'hobbies';
