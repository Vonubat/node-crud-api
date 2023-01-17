import { IncomingMessage, ServerResponse, createServer } from 'http';
import { USER_ENDPOINT } from '../constants';
import { getPort } from '../utils';

export class Server {
  private port: number = getPort();

  private server = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const { url } = request;

        if (url?.startsWith(USER_ENDPOINT)) {
          console.log(url);
          response.end();
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
