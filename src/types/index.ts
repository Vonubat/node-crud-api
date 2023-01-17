export interface User extends UserDto {
  id: string;
}

export interface UserDto {
  username: string;
  age: number;
  hobbies: string[];
}
