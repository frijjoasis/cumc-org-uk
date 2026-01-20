import { User as SharedUser, Member } from '@cumc/shared-types';

declare global {
  namespace Express {
    interface User extends SharedUser {
      member?: Member;
    }
  }
}

export {};
