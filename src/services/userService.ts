import { User, UserDto } from '../types';
import { v4 as UUID } from 'uuid';

export class UserService {
  private data: User[] = [];

  public getAll = async (): Promise<User[]> => {
    return this.data;
  };

  public get = async (id: string): Promise<User> => {
    const user: User | undefined = this.data.find((item: User): boolean => item.id === id);

    if (!user) {
      throw new Error('User not found (get)');
    }

    return user;
  };

  public create = async (user: UserDto): Promise<User> => {
    const newUser: User = { ...user, id: UUID() };
    this.data.push(newUser);

    return newUser;
  };

  public delete = async (id: string): Promise<void> => {
    let isUserExist: boolean = false;

    this.data = this.data.filter((item: User): boolean => {
      if (item.id !== id) {
        return true;
      } else {
        isUserExist = true;
        return false;
      }
    });

    if (!isUserExist) {
      throw new Error('User not found (delete)');
    }
  };

  public update = async (id: string, user: User): Promise<void> => {
    let isUserExist: boolean = false;

    this.data = this.data.filter((item: User): boolean => {
      if (item.id !== id) {
        return false;
      } else {
        isUserExist = true;
        item = { ...user, id };
        return false;
      }
    });

    if (!isUserExist) {
      throw new Error('User not found (update)');
    }
  };
}
