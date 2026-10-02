import { validateRequest } from '../middleware/validateRequest.js';

export const validateLogin = validateRequest();
export const validateRegistration = validateRequest();
