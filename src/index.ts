import { LoadBalancer } from './server';

const mode = process.env.MODE;
const server = new LoadBalancer(mode);
server.start();
