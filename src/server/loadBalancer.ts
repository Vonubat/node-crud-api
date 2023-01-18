import cluster, { Worker } from 'cluster';
import { createServer, IncomingMessage, ServerResponse, request as makeRequest, ClientRequest } from 'http';
import { AGE, ErrorMessages, HOBBIES, HTTPMethods, StatusCodes, USERNAME } from '../constants';
import { cpus } from 'os';
import { Server } from './server';
import { getPort } from '../utils';
import { DBSchema, User, WorkerMsg } from '../types';
import { UserService } from '../services';
import { responseError } from '../controller';

export class LoadBalancer {
  private readonly mode: string | undefined;
  private readonly mainPort: number = getPort();
  private readonly cpuQty: number = cpus().length;
  private currentWorkerNumber: number = 0;
  private workers: Worker[] = [];
  private DB: DBSchema = {
    users: [],
  };

  constructor(mode: string | undefined) {
    this.mode = mode;
  }

  private balancer = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const endpoint: string = `http://localhost:${this.mainPort + this.currentWorkerNumber}${request.url}`;

        const clientRequest: ClientRequest = makeRequest(
          endpoint,
          { method: request.method, headers: request.headers },
          (clientResponse: IncomingMessage): void => {
            if (clientResponse.statusCode) {
              response.writeHead(clientResponse.statusCode, clientResponse.statusMessage, clientResponse.headers);
            }

            clientResponse.pipe(response);
          },
        );

        request.pipe(clientRequest);

        this.currentWorkerNumber = this.currentWorkerNumber === this.cpuQty ? 0 : this.currentWorkerNumber + 1;
      } catch {
        responseError(response, StatusCodes.INTERNAL, ErrorMessages.INTERNAL);
      }
    },
  );

  private updateDB = ({ method, data }: WorkerMsg): void => {
    const isUserData: boolean = USERNAME in data && AGE in data && HOBBIES in data;

    if (isUserData) {
      switch (method) {
        case HTTPMethods.POST:
          this.DB.users.push(data);
          break;
        case HTTPMethods.PUT:
          this.DB.users = this.DB.users.map((user: User): User => (user.id === data.id ? data : user));
          break;
        case HTTPMethods.DELETE:
          this.DB.users = this.DB.users.filter((user: User): boolean => user.id !== data.id);
          break;
        default:
          break;
      }
      this.workers.forEach((worker: Worker): boolean => worker.send(this.DB));
    }
  };

  public start = (): void => {
    if (this.mode === 'multi') {
      if (cluster.isPrimary) {
        this.balancer.listen(this.mainPort);

        for (let i = 0; i < this.cpuQty; i++) {
          const worker: Worker = cluster.fork({ increment: i + 1 });

          worker.on('message', (msg: WorkerMsg): void => {
            this.updateDB(msg);
          });

          this.workers.push(worker);
        }
      } else {
        const server = new Server(this.mainPort, [new UserService()]);
        server.start();

        process.on('message', (DB: DBSchema): void => {
          server.userService.data = DB.users;
        });
      }
    } else {
      const server = new Server(this.mainPort, [new UserService()]);
      server.start();
    }
  };
}
