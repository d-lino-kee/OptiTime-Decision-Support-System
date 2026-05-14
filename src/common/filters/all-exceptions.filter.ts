import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse();
        const req = ctx.getRequest();

        const isHttp = exception instanceof HttpException;
        const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

        const payload = isHttp ? exception.getResponse() : { message: 'Internal server error' };

        // Log everything non-HTTP at error level (real crashes) and 5xx HTTP errors too.
        // 4xx HTTP errors get a single-line warn — they're usually user input issues.
        if (!isHttp || status >= 500) {
            this.logger.error(
                `[${req?.method} ${req?.url}] ${status} ${(exception as Error)?.message ?? exception}`,
                (exception as Error)?.stack,
            );
        } else if (status >= 400) {
            this.logger.warn(
                `[${req?.method} ${req?.url}] ${status} ${(exception as Error)?.message ?? exception}`,
            );
        }

        res.status(status).json({
            statusCode: status,
            path: req?.url,
            method: req?.method,
            ...(typeof payload === 'string' ? { message: payload } : payload),
            timestamp: new Date().toISOString(),
            requestId: req?.requestId,
        });
    }
}
