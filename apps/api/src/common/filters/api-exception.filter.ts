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

const safeOperationalErrors: Record<string, { status: HttpStatus; message: string }> = {
  SMTP_NOT_CONFIGURED: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    message: 'O SMTP está desabilitado ou incompleto. Confira host, remetente e senha na configuração.',
  },
  SMTP_AUTH_FAILED: {
    status: HttpStatus.BAD_GATEWAY,
    message: 'O usuário ou a senha do SMTP foram rejeitados pelo servidor.',
  },
  SMTP_CONNECTION_FAILED: {
    status: HttpStatus.BAD_GATEWAY,
    message: 'Não foi possível conectar ao servidor SMTP. Confira host, porta e segurança.',
  },
  SMTP_RECIPIENT_REJECTED: {
    status: HttpStatus.BAD_REQUEST,
    message: 'O servidor SMTP rejeitou o destinatário informado.',
  },
  SMTP_SERVER_REJECTED: {
    status: HttpStatus.BAD_GATEWAY,
    message: 'O servidor SMTP rejeitou a mensagem. Confira remetente e regras da conta.',
  },
  SMTP_SEND_FAILED: {
    status: HttpStatus.BAD_GATEWAY,
    message: 'Não foi possível concluir o envio pelo SMTP. Confira a configuração e tente novamente.',
  },
  SETTINGS_SECRET_INVALID: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    message: 'Uma credencial protegida não pôde ser lida. Salve novamente a configuração SMTP.',
  },
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
    const isMulterError = exception instanceof Error && exception.name === 'MulterError';
    const multerCode = isMulterError && (exception as Error & { code?: string }).code === 'LIMIT_FILE_SIZE'
      ? 'IMAGE_TOO_LARGE'
      : 'INVALID_UPLOAD';
    const safeOperationalError = exception instanceof Error ? safeOperationalErrors[exception.message] : undefined;
    const status = exception instanceof HttpException
      ? exception.getStatus()
      : isMulterError
        ? HttpStatus.BAD_REQUEST
        : safeOperationalError?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = exception instanceof HttpException ? exception.getResponse() : undefined;
    const payload = typeof raw === 'object' && raw !== null ? raw as ErrorResponse : undefined;
    const isValidation = status === HttpStatus.BAD_REQUEST && payload?.code === 'VALIDATION_ERROR';

    response.setHeader('x-request-id', requestId);
    response.status(status).json({
      code: payload?.code ?? (isValidation ? 'VALIDATION_ERROR' : isMulterError ? multerCode : safeOperationalError ? exception instanceof Error ? exception.message : 'INTERNAL_ERROR' : status >= 500 ? 'INTERNAL_ERROR' : 'HTTP_ERROR'),
      message: payload?.message ?? (isMulterError ? 'O arquivo enviado é inválido ou excede o limite permitido.' : safeOperationalError?.message ?? (status >= 500 ? 'Ocorreu um erro interno.' : 'Não foi possível concluir a solicitação.')),
      requestId,
      ...(payload?.fieldErrors ? { fieldErrors: payload.fieldErrors } : {}),
      ...(payload?.fields ? { fields: payload.fields } : {}),
    });
  }
}
