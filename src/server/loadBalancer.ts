import cluster, { Worker } from 'cluster';
import { createServer, IncomingMessage, ServerResponse, request as makeRequest, ClientRequest } from 'http';
import { AGE, ErrorMessages, HOBBIES, HTTPMethods, StatusCodes, USERNAME } from '../constants';
import { cpus } from 'os';
import { Server } from './server';
import { getPort } from '../utils';
import { ServicesData, User } from '../types';
import { UserService } from '../services';
import { responseError } from '../controller';

export class LoadBalancer {
  private readonly mode: string | undefined;
  private readonly mainPort: number = getPort();
  private readonly cpuQty: number = cpus().length;
  private currentWorkerNumber: number = 0;
  private workers: Worker[] = [];
  private users: User[] = [];

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

  private updateDB = ({ method, data }: { method: string; data: User }): void => {
    if (method === HTTPMethods.POST) {
      this.users.push(data);
    }

    if (method === HTTPMethods.PUT) {
      this.users = this.users.map((user) => (user.id === data.id ? data : user));
    }

    if (method === HTTPMethods.DELETE) {
      this.users = this.users.filter((user) => user.id !== data.id);
    }

    this.workers.forEach((worker) => worker.send(this.users));
  };

  public start = (): void => {
    if (this.mode === 'multi') {
      if (cluster.isPrimary) {
        this.balancer.listen(this.mainPort);

        for (let i = 0; i < this.cpuQty; i++) {
          const worker = cluster.fork({ increment: i + 1 });

          worker.on('message', (msg): void => {
            this.updateDB(msg);
          });

          this.workers.push(worker);
        }
      } else {
        const server = new Server(this.mainPort, [new UserService()]);
        server.start();

        process.on('message', (data: ServicesData): void => {
          console.log('Data:', data);

          const isUserData: boolean = USERNAME in data[0] && AGE in data[0] && HOBBIES in data[0];

          if (isUserData) {
            server.userService.data = [...data];
          }
        });
      }
    } else {
      const server = new Server(this.mainPort, [new UserService()]);
      server.start();
    }
  };
}
