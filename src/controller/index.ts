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
  };

  static responseError = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    errorMessage: string,
  ): void => {
    response.statusMessage = errorMessage;
    response.statusCode = statusCode;
    response.end();
  };
}

export const { responseSuccess, responseError } = Controller;
