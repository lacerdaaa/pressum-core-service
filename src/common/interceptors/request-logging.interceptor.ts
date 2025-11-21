import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class RequestLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request & { user?: { sub?: string } }>();
    const { method, url } = req;
    const user = req?.user?.sub;
    const startedAt = Date.now();

    this.logger.log(
      `${method} ${url}${user ? ` user=${user}` : ''}`,
      context.getClass().name,
    );

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startedAt;
        this.logger.log(
          `${method} ${url} -> ${duration}ms`,
          context.getClass().name,
        );
      }),
    );
  }
}
