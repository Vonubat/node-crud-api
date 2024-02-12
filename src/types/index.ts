import { IncomingMessage, ServerResponse } from 'http';
import { UserService } from '../services';

export interface DBSchema {
  users: User[];
}

export interface User extends UserDto {
  id: string;
}

export interface UserDto {
  username: string;
  age: number;
  hobbies: string[];
}

export interface ServiceMethod {
  (request: IncomingMessage, response: ServerResponse<IncomingMessage>): Promise<void>;
}

export type ServicesData = User;

export interface WorkerMsg {
  method: string;
  data: ServicesData;
}
