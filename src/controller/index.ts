import { IncomingMessage, ServerResponse } from 'http';

class Controller {
  static responseSuccess = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    data?: unknown[] | unknown,
  ): void => {
    response.setHeader('Content-Type', 'application/json');
    response.statusCode = statusCode;
    response.end(JSON.stringify(data));

    console.log(`\n\n\Execution on port: ${process.env.executionPort}, proccess id: #${process.pid}`);
    console.log(`\x1b[33mSuccessful response, status code:\x1b[0m \x1b[32m${statusCode}\x1b[0m`);
    console.log(`\x1b[34mResponse data:\x1b[0m`);
    console.dir(data ? data : 'NO CONTENT');
  };

  static responseError = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    errorMessage: string,
  ): void => {
    response.setHeader('Content-Type', 'application/json');
    response.statusMessage = errorMessage;
    response.statusCode = statusCode;
    response.end(JSON.stringify({ message: errorMessage }));

    console.log(`\n\n\Execution on port: ${process.env.executionPort}, proccess id: #${process.pid}`);
    console.log(`\x1b[33mFailed response, status code:\x1b[0m \x1b[31m${statusCode}\x1b[0m`);
    console.log(`\x1b[34mResponse message:\x1b[0m \x1b[31m${errorMessage}\x1b[0m`);
  };
}

export const { responseSuccess, responseError } = Controller;
