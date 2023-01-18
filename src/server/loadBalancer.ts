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
  private port: number = getPort();
  public users: User[] = [];
  private workers: Worker[] = [];
  private currentWorkerNumber = 1;
  private cpuNumber = cpus().length;

  public balancer = createServer(
    async (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void> => {
      try {
        const endpoint = `http://localhost:${this.port + this.currentWorkerNumber}${request.url}`;

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

        this.currentWorkerNumber = this.currentWorkerNumber === this.cpuNumber ? 1 : this.currentWorkerNumber + 1;
      } catch {
        responseError(response, StatusCodes.INTERNAL, ErrorMessages.INTERNAL);
      }
    },
  );

  public start() {
    if (cluster.isPrimary) {
      this.balancer.listen(this.port);

      for (let i = 0; i < this.cpuNumber; i++) {
        const worker = cluster.fork({ id: i + 1 });

        worker.on('message', (msg): void => {
          this.updateUsers(msg);
        });

        this.workers.push(worker);
      }
    } else {
      const server = new Server([new UserService()], process);
      server.start();

      process.on('message', (msg: User[]): void => {
        server.userService.data = [...msg];
      });
    }
  }

  private updateUsers({ method, id, data }: { id: number; method: string; data: User }): void {
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
  }
}
