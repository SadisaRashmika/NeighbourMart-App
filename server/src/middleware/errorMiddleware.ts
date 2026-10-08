import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);
  const status = typeof error?.status === 'number' ? error.status : 500;
  response.status(status).json({ message: status === 500 ? 'Internal server error' : error.message });
};
