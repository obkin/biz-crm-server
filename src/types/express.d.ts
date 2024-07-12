import { UserPayload } from '../auth/interfaces/user-payload.interface';

declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}
