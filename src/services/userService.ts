import { v4 as UUID } from 'uuid';
import { ServiceMethod, User, UserDto } from '../types';
import { responseSuccess, responseError } from '../controller';
import { ErrorMessages, HTTPMethods, StatusCodes, Endpoints } from '../constants';
import { getAndValidateID, validateUserBody } from '../utils';

export class UserService {
  private data: User[] = [];

  private get: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url === Endpoints.USERS) {
      return responseSuccess(response, StatusCodes.OK, this.data);
    }

    const id: string | null = getAndValidateID(url as string);
    if (!id) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.INVALID_ID);
    }

    const user: User | undefined = this.data.find((item: User): boolean => item.id === id);
    if (!user) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.ID_NOT_FOUND);
    }

    return responseSuccess(response, StatusCodes.OK, user);
  };

  private create: ServiceMethod = async (request, response) => {
    const { url } = request;
    if (url !== Endpoints.USERS) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.INVALID_ENDPOINT);
    }

    const buffer: Buffer[] = [];
    request
      .on('data', (chunk: Buffer): void => {
        buffer.push(chunk);
      })
      .on('end', (): void => {
        validateUserBody(buffer, response, (body: UserDto): void => {
          const newUser: User = { ...body, id: UUID() };
          this.data.push(newUser);

          return responseSuccess(response, StatusCodes.CREATED, newUser);
        });
      });
  };

  private update: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = getAndValidateID(url as string);
    if (!id) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.INVALID_ID);
    }

    const user: User | undefined = this.data.find((item: User): boolean => item.id === id);
    if (!user) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.ID_NOT_FOUND);
    }

    const buffer: Buffer[] = [];
    request
      .on('data', (chunk: Buffer): void => {
        buffer.push(chunk);
      })
      .on('end', (): void => {
        validateUserBody(buffer, response, (body: UserDto): void => {
          const updatedUser: User = { ...body, id };
          this.data = this.data.map((item: User): User => (item.id === id ? updatedUser : user));

          return responseSuccess(response, StatusCodes.CREATED, updatedUser);
        });
      });
  };

  private delete: ServiceMethod = async (request, response) => {
    const { url } = request;

    const id: string | null = getAndValidateID(url as string);
    if (!id) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.INVALID_ID);
    }

    const user: User | undefined = this.data.find((item: User): boolean => item.id === id);
    if (!user) {
      return responseError(response, StatusCodes.NOT_FOUND, ErrorMessages.ID_NOT_FOUND);
    }

    this.data = this.data.filter((item: User): boolean => item.id !== user.id);
    responseSuccess(response, StatusCodes.NO_CONTENT);
  };

  public execute: ServiceMethod = async (request, response) => {
    try {
      switch (request.method) {
        case HTTPMethods.GET:
          this.get(request, response);
          break;
        case HTTPMethods.POST:
          this.create(request, response);
          break;
        case HTTPMethods.PUT:
          this.update(request, response);
          break;
        case HTTPMethods.DELETE:
          this.delete(request, response);
          break;
        default:
          throw new Error(ErrorMessages.INVALID_METHOD);
      }
    } catch (error) {
      if (error instanceof Error) {
        responseError(response, StatusCodes.INTERNAL, error.message);
      }
    }
  };
}
