import type { RequestHandler } from 'express';

export function validateRequest(): RequestHandler {
  return (_request, _response, next) => next();
}
