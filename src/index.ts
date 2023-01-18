import { LoadBalancer } from './server';

const MODE = process.env.MODE;
const server = new LoadBalancer(MODE);
server.start();
