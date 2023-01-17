import { IncomingMessage, ServerResponse } from 'http';
import { UserService } from '../services';

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

export type ServicesDI = [UserService];
