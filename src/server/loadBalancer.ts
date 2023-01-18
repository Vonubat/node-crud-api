import cluster, { Worker } from 'cluster';
import { createServer, IncomingMessage, ServerResponse, request as makeRequest, ClientRequest } from 'http';
import { ErrorMessages, StatusCodes } from '../constants';
import { cpus } from 'os';
import { Server } from './server';
import { getPort } from '../utils';
import { User } from '../types';
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
          (res) => {
            if (res.statusCode) {
              response.writeHead(res.statusCode, res.statusMessage, res.headers);
            }

            res.pipe(response);
          },
        );

        request.pipe(clientRequest);

        this.currentWorkerNumber = this.currentWorkerNumber === this.cpuQty ? 0 : this.currentWorkerNumber + 1;
      } catch {
        responseError(response, StatusCodes.INTERNAL, ErrorMessages.INTERNAL);
      }
    },
  );

  private updateUsers = ({ method, id, data }: { id: number; method: string; data: User }): void => {
    if (method === 'post') {
      this.users.push(data);
    }

    if (method === 'put') {
      this.users = this.users.map((user) => (user.id === data.id ? data : user));
    }

    if (method === 'delete') {
      this.users = this.users.filter((user) => user.id !== data.id);
    }

    this.workers.forEach((worker) => worker.send(this.users));
  };

  public start = (): void => {
    if (this.mode === 'multi') {
      if (cluster.isPrimary) {
        this.balancer.listen(this.mainPort);

        for (let i = 0; i < this.cpuQty; i++) {
          const worker = cluster.fork({ id: i + 1 });

          worker.on('message', (msg): void => {
            this.updateUsers(msg);
          });

          this.workers.push(worker);
        }
      } else {
        const server = new Server(this.mainPort, [new UserService()]);
        server.start();

        process.on('message', (msg: User[]): void => {
          server.userService.data = [...msg];
        });
      }
    } else {
      const server = new Server(this.mainPort, [new UserService()]);
      server.start();
    }
  };
}
