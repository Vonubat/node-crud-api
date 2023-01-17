import { IncomingMessage, ServerResponse } from 'http';

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
