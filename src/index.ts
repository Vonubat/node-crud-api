import { LoadBalancer } from './server';

const mode = process.env.MODE;
export const loadBalancer = new LoadBalancer(mode);
loadBalancer.start();
