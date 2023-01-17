import { Server } from './server';
import { UserService } from './services';

const server = new Server([new UserService()]);
server.start();
