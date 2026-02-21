import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { nanoid } from 'nanoid';
import {Observable } from 'rxjs';

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();

        const requestId = req.headers['x-request-id'] ?? nanoid();
        req.requestId = requestId;
        res.setHeader('x-request-id', requestId)

        return next.handle();
    }
}