import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  const status = error.status ?? (error.name === 'VersionError' ? 409 : error.name === 'ValidationError' || error.name === 'CastError' ? 400 : 500);
  response.status(status).json({ message: status === 500 ? 'Internal server error' : error.message });
};
