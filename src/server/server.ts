import { IncomingMessage, ServerResponse, createServer } from 'http';
import { ErrorMessages, StatusCodes, Endpoints } from '../constants';
import { responseError } from '../controller';
import { UserService } from '../services';
import { User } from '../types';

export class Server {
  constructor(private port: number, private userService: UserService) {
    this.port = process.env.increment ? port + Number(process.env.increment) : port;
  }

  private server = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const { url } = request;
        process.env.executionPort = String(this.port);

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
      console.log(`Server started on port: ${this.port}, proccess id: #${process.pid}`);
    });
  };

  public getTestServer = () => {
    return this.server;
  };

  public setData = (data: User[]): void => {
    this.userService.data = data;
  };
}
