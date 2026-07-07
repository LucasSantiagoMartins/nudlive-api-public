import { Request } from 'express';
// import { User } from '@modules/user/entities/user.entity';

export type RequestWithUser = Request & {
  user: any;
};