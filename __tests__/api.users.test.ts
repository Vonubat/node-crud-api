import request from 'supertest';
import { v4 as UUID } from 'uuid';
import { Server } from '../src/server';
import { DEFAULT_PORT, Endpoints, ErrorMessages, StatusCodes } from '../src/constants';
import { UserService } from '../src/services';
import { UserDto } from '../src/types';

const app = new Server(DEFAULT_PORT, [new UserService()]);
const server = app.getTestServer();

const VALID_ID = UUID();
const INVALID_ID = 'INVALID_ID';
const ENDPOINT = Endpoints.USERS;
const INVALID_ENDPOINT = '/api/books';
const USER_DTO: UserDto = {
  username: 'John Doe',
  age: 28,
  hobbies: ['Games'],
};
const UPDATED_USER_DTO: UserDto = {
  username: 'Updated',
  age: 10,
  hobbies: ['Beer'],
};

describe('Users API', () => {
  afterAll((done) => {
    server.close();
    done();
  });

  describe('scenario 1: CRUD operations with correct data', () => {
    it('should return empty array of users', async () => {
      await request(server).get(ENDPOINT).expect(StatusCodes.OK, []);
    });

    it('should create new user', async () => {
      const response = await request(server).post(ENDPOINT).send(USER_DTO);

      expect(response.statusCode).toBe(StatusCodes.CREATED);
      const newUser = response.body;
      expect(newUser).toEqual({ ...USER_DTO, id: newUser.id });

      await request(server).get(ENDPOINT).expect(StatusCodes.OK, [newUser]);
    });

    it('should return array with one user after user creation', async () => {
      const response = await request(server).get(ENDPOINT);
      expect(response.statusCode).toBe(StatusCodes.OK);
      expect(response.body).toHaveLength(1);
    });

    it('should get user by id', async () => {
      const response = await request(server).get(ENDPOINT);
      const [user] = response.body;
      const { id } = user;

      await request(server).get(`${ENDPOINT}/${id}`).expect(StatusCodes.OK, user);
    });

    it('should update user', async () => {
      const response = await request(server).get(ENDPOINT);
      const [user] = response.body;
      const { id } = user;

      const updateResponse = await request(server).put(`${ENDPOINT}/${id}`).send(UPDATED_USER_DTO);

      expect(response.statusCode).toBe(StatusCodes.OK);
      const updatedUser = updateResponse.body;
      expect(updatedUser).toEqual({ ...UPDATED_USER_DTO, id });
    });

    it('should delete user', async () => {
      const response = await request(server).get(ENDPOINT);
      const [user] = response.body;
      const { id } = user;

      const deleteResponse = await request(server).delete(`${ENDPOINT}/${id}`);

      expect(deleteResponse.statusCode).toBe(StatusCodes.NO_CONTENT);
    });

    it('should return empty array of users after user was deleted', async () => {
      await request(server).get(ENDPOINT).expect(StatusCodes.OK, []);
    });
  });

  describe('scenario 2: handling invalid endpoint, method, id, non-exist user', () => {
    it("should return 404 when requesting endpoint that doesn't exist", async () => {
      await request(server).get(INVALID_ENDPOINT).expect(StatusCodes.NOT_FOUND, {
        message: ErrorMessages.INVALID_ENDPOINT,
      });
    });

    it('should return 500 when requesting unavailable method', async () => {
      await request(server).patch(ENDPOINT).expect(StatusCodes.INTERNAL, {
        message: ErrorMessages.INVALID_METHOD,
      });
    });

    it('should return 400 when getting user by invalid id', async () => {
      await request(server).get(`${ENDPOINT}/${INVALID_ID}`).expect(StatusCodes.BAD_REQUEST, {
        message: ErrorMessages.INVALID_ID,
      });
    });

    it("should return 404 when getting user by id that doesn't exist", async () => {
      await request(server).get(`${ENDPOINT}/${VALID_ID}`).expect(StatusCodes.NOT_FOUND, {
        message: ErrorMessages.ID_NOT_FOUND,
      });
    });

    it('should return 400 when trying to delete user by invalid id', async () => {
      await request(server)
        .delete(`${ENDPOINT}/${INVALID_ID}`)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_ID });
    });

    it("should return 404 when trying to delete user that doesn't exist", async () => {
      await request(server).delete(`${ENDPOINT}/${VALID_ID}`).expect(StatusCodes.NOT_FOUND, {
        message: ErrorMessages.ID_NOT_FOUND,
      });
    });

    it('should return 400 when trying to update user by invalid id', async () => {
      await request(server)
        .put(`${ENDPOINT}/${INVALID_ID}`)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_ID });
    });

    it("should return 404 when trying to update user that doesn't exist", async () => {
      await request(server).put(`${ENDPOINT}/${VALID_ID}`).send(UPDATED_USER_DTO).expect(StatusCodes.NOT_FOUND, {
        message: ErrorMessages.ID_NOT_FOUND,
      });
    });
  });

  describe('scenario 3: handling invalid user data cases', () => {
    it('should handle missing fields in user data', async () => {
      const noUserName = {
        age: 20,
        hobbies: ['no hobby'],
      };
      await request(server)
        .post(ENDPOINT)
        .send(noUserName)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });

      const noAge = {
        userName: 'John Doe',
        hobbies: ['no hobby'],
      };
      await request(server)
        .post(ENDPOINT)
        .send(noAge)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });

      const noHobbies = {
        userName: 'John Doe',
        age: 20,
      };
      await request(server)
        .post(ENDPOINT)
        .send(noHobbies)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });
    });

    it('should handle wrong data types in user data', async () => {
      const invalidUserName = {
        userName: 1,
        age: 20,
        hobbies: ['no hobby'],
      };
      await request(server)
        .post(ENDPOINT)
        .send(invalidUserName)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });

      const invalidAge = {
        userName: 'John Doe',
        age: '20',
        hobbies: ['no hobby'],
      };
      await request(server)
        .post(ENDPOINT)
        .send(invalidAge)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });

      const invalidHobbies = {
        userName: 'John Doe',
        age: 20,
        hobbies: { hobby: 0 },
      };
      await request(server)
        .post(ENDPOINT)
        .send(invalidHobbies)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });
    });

    it('should handle wrong data types in nested data', async () => {
      const invalidHobbies = {
        userName: 'John Doe',
        age: 20,
        hobbies: [1, 2, 3],
      };
      await request(server)
        .post(ENDPOINT)
        .send(invalidHobbies)
        .expect(StatusCodes.BAD_REQUEST, { message: ErrorMessages.INVALID_BODY });
    });
  });
});
