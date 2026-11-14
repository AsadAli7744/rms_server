import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, ip } = req;
    const start = Date.now();

    // Capture response finish
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusCode = res.statusCode;

      // Extract user info if attached by guard or token
      const user = (req as any).user;
      let userTag = 'Anonymous';
      if (user?.role) {
        userTag = `${user.role} (ID:${user.id || '?'}, Rest:#${user.restaurant_id || '?'})`;
      } else {
        const authHeader = req.headers['authorization'];
        if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          const match = authHeader.substring(7).trim().match(/^rms-token-(\d+)-([a-z]+)/i);
          if (match) {
            userTag = `${match[2]} (ID:${match[1]})`;
          }
        }
      }

      const logMessage = `${method} ${originalUrl} -> ${statusCode} [${duration}ms] - Client: ${ip} - User: ${userTag}`;

      if (statusCode >= 500) {
        this.logger.error(logMessage);
      } else if (statusCode >= 400) {
        this.logger.warn(logMessage);
      } else {
        this.logger.log(logMessage);
      }
    });

    next();
  }
}
