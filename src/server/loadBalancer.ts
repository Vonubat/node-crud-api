import cluster, { Worker } from 'cluster';
import { createServer, IncomingMessage, ServerResponse, request as makeRequest, ClientRequest } from 'http';
import { cpus } from 'os';

import { Server } from './server';
import { getPort } from '../utils';
import { UserService } from '../services';
import { responseError } from '../controller';
import { DBSchema, User, WorkerMsg } from '../types';
import { AGE, ErrorMessages, HOBBIES, HTTPMethods, StatusCodes, USERNAME } from '../constants';

export class LoadBalancer {
  private currentWorker: number = 0;
  private workers: Worker[] = [];
  private DB: DBSchema = {
    users: [],
  };

  constructor() {}

  private balancer = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const endpoint: string = `http://localhost:${getPort() + this.currentWorker}${request.url}`;

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

        const cpuQty = cpus().length;
        this.currentWorker = this.currentWorker === cpuQty ? 0 : this.currentWorker + 1;
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

  private start = (mode?: string): void => {
    if (mode === 'multi') {
      if (cluster.isPrimary) {
        this.balancer.listen(getPort());
        const cpuQty = cpus().length;

        for (let i = 0; i < cpuQty; i++) {
          const worker: Worker = cluster.fork({ increment: i + 1 });

          worker.on('message', (msg: WorkerMsg): void => {
            this.updateDB(msg);
          });

          this.workers.push(worker);
        }
      } else {
        const server = new Server(getPort(), new UserService());
        server.start();

        process.on('message', (DB: DBSchema): void => {
          server.setData(DB.users);
        });
      }
    } else {
      const server = new Server(getPort(), new UserService());
      server.start();
    }
  };

  static run(mode?: string) {
    new LoadBalancer().start(mode);
  }
}
