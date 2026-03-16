import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Types } from 'mongoose';

export interface RequestUser {
  _id: Types.ObjectId;
  firebaseUid: string;
  email: string;
  displayName: string;
}

export const ReqUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): RequestUser => {
    return ctx.switchToHttp().getRequest().user as RequestUser;
  },
);
