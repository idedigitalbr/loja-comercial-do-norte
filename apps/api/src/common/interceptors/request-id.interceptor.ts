import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';

type RequestWithId = {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
};

@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<{ setHeader(name: string, value: string): void }>();
    const header = request.headers['x-request-id'];
    const incomingId = Array.isArray(header) ? header[0] : header;
    const requestId =
      incomingId && /^[A-Za-z0-9._-]{1,80}$/.test(incomingId)
        ? incomingId
        : `req_${randomUUID()}`;

    request.requestId = requestId;
    response.setHeader('x-request-id', requestId);
    return next.handle();
  }
}
