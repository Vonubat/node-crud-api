import { IncomingMessage, ServerResponse, createServer } from 'http';
import { ErrorMessages, StatusCodes, Endpoints } from '../constants';
import { responseError } from '../controller';
import { UserService } from '../services';
import { ServicesDI } from '../types';
import { getPort } from '../utils';

export class Server {
  userService: UserService | undefined;

  constructor(services: ServicesDI) {
    services.forEach((service: UserService): void => {
      if (service instanceof UserService) {
        this.userService = service;
      }
    });
  }

  private port: number = getPort();

  private server = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const { url } = request;

        if (url?.startsWith(Endpoints.USERS)) {
          this.userService?.execute(request, response);
        } else {
          throw new Error(ErrorMessages.INVALID_ENDPOINT);
        }
      } catch (error) {
        if (error instanceof Error) {
          responseError(response, StatusCodes.NOT_FOUND, error.message);
        }
      }
    },
  );

  public start = (): void => {
    this.server.listen(this.port, (): void => {
      console.log(`Server started on port: ${this.port}`);
    });
  };
}
