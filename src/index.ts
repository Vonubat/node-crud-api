import { LoadBalancer } from './server/loadBalancer';
import { Server } from './server/server';
import { UserService } from './services';

const server = new LoadBalancer();
server.start();
