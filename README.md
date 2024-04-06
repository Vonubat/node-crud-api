# node-crud-api

simple CRUD API using in-memory database underneath

# Start app

**1. Clone repository**

`git clone https://github.com/Vonubat/node-crud-api.git`

**2. Change directory and branch**

`cd node-crud-api`

`git checkout dev`

**3. Install dependencies**

`npm i`

**4. Rename .env.example to .env**

**5. You can use these scripts for run**

- `npm run start:dev` (run a single server in development mode with using nodemon)
- `npm run start:prod` (run a single server in production mode with create file bundle.js ./build/bundle.js)
- `npm run start:dev:multi` (run a load balancer in development mode with using nodemon)
- `npm run start:prod:multi` (run a load balancer in production mode with create file bundle.js ./build/bundle.js)
- `npm run test` (run tests)

**6. Implemented endpoint `api/users`:**

- **GET** `api/users` is used to get all persons
  - Server should answer with `status code` **200** and all users records
- **GET** `api/users/{userId}`
  - Server should answer with `status code` **200** and and record with `id === userId` if it exists
  - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist
- **POST** `api/users` is used to create record about new user and store it in database
  - Server should answer with `status code` **201** and newly created record
  - Server should answer with `status code` **400** and corresponding message if request `body` does not contain **required** fields
- **PUT** `api/users/{userId}` is used to update existing user
  - Server should answer with` status code` **200** and updated record
  - Server should answer with` status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server should answer with` status code` **404** and corresponding message if record with `id === userId` doesn't exist
- **DELETE** `api/users/{userId}` is used to delete existing user from database
  - Server should answer with `status code` **204** if the record is found and deleted
  - Server should answer with `status code` **400** and corresponding message if `userId` is invalid (not `uuid`)
  - Server should answer with `status code` **404** and corresponding message if record with `id === userId` doesn't exist

**7. Users are stored as `objects` that have following properties:**

- `id` — unique identifier (`string`, `uuid`) generated on server side
- `username` — user's name (`string`, **required**)
- `age` — user's age (`number`, **required**)
- `hobbies` — user's hobbies (`array` of `strings` or empty `array`, **required**)

**8. Testing**

Script npm run test runs e2e test for all methods with valid and invalid data. For manual testing Postman or similar tools can be used. In a multi mode workers can be accessed directly via corresponding ports (requests can be sent directly to ports 4001, 4002, ...). Workers' ids, ports and processed requests are logged to console.
