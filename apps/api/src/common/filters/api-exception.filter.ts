import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';

type RequestWithId = {
  headers: Record<string, string | string[] | undefined>;
  requestId?: string;
};

type ErrorResponse = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  fields?: string[];
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithId>();
    const response = context.getResponse<{
      status(code: number): { json(body: unknown): void };
      setHeader(name: string, value: string): void;
    }>();
    const header = request.headers['x-request-id'];
    const incomingId = Array.isArray(header) ? header[0] : header;
    const requestId =
      request.requestId ??
      (incomingId && /^[A-Za-z0-9._-]{1,80}$/.test(incomingId)
        ? incomingId
        : `req_${randomUUID()}`);
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload = typeof raw === 'object' && raw !== null ? raw as ErrorResponse : undefined;
    const isValidation = status === HttpStatus.BAD_REQUEST && payload?.code === 'VALIDATION_ERROR';

    response.setHeader('x-request-id', requestId);
    response.status(status).json({
      code: payload?.code ?? (isValidation ? 'VALIDATION_ERROR' : status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR'),
      message: payload?.message ?? (status >= 500 ? 'Ocorreu um erro interno.' : 'Não foi possível concluir a solicitação.'),
      requestId,
      ...(payload?.fieldErrors ? { fieldErrors: payload.fieldErrors } : {}),
      ...(payload?.fields ? { fields: payload.fields } : {}),
    });
  }
}
