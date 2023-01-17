import http from 'http';
import { HTTPMethods } from '../constants';
import { getPort } from '../utils';

export class Server {
  private port: number = getPort();

  private server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> = http.createServer(
    (request: http.IncomingMessage, response: http.ServerResponse): void => {
      try {
        switch (request.method) {
          case HTTPMethods.GET:
            break;
          case HTTPMethods.POST:
            break;
          case HTTPMethods.PUT:
            break;
          case HTTPMethods.DELETE:
            break;
          default:
            throw new Error();
        }
      } catch {
        throw new Error();
      }
    },
  );

  public start = (): void => {
    this.server.listen(this.port, (): void => {
      console.log(`Server started on port: ${this.port}`);
    });
  };
}
