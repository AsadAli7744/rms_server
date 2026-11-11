import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : null;

    let message = 'Internal server error';
    let errorDetails: any = null;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      exceptionResponse !== null
    ) {
      message =
        (exceptionResponse as any).message ||
        (exceptionResponse as any).error ||
        message;
      errorDetails = (exceptionResponse as any).error || undefined;
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const { method, originalUrl, ip, body } = request;
    const user = (request as any).user;
    const userTag = user?.role
      ? `${user.role} (ID:${user.id}, Rest:#${user.restaurant_id})`
      : 'Anonymous';

    // Mask sensitive fields from body in logs
    let sanitizedBody: any = undefined;
    if (body && typeof body === 'object') {
      sanitizedBody = { ...body };
      if ('password' in sanitizedBody) sanitizedBody.password = '***';
      if ('password_hash' in sanitizedBody) sanitizedBody.password_hash = '***';
    }

    const logMessage = `[API ERROR] ${method} ${originalUrl} -> ${status} [${message}] - User: ${userTag} - IP: ${ip}${
      sanitizedBody ? ` - Body: ${JSON.stringify(sanitizedBody)}` : ''
    }`;

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      const stack = exception instanceof Error ? exception.stack : '';
      this.logger.error(logMessage, stack);
    } else {
      this.logger.warn(logMessage);
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: originalUrl,
      method,
      message,
      error: errorDetails,
    });
  }
}
