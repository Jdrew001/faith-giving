import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private get isDevelopment() { return process.env.NODE_ENV == 'development' }
  private allowedOrigins: string[] | string = this.isDevelopment ? '*': ['https://discoverfaitharlington.org'];

  use(req: any, res: any, next: () => void) {
    const origin = this.requestOrigin(req);
    if (this.isDevelopment) {
      next();
      return;
    } 
    if (origin && this.allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      throw new BadRequestException('Unable to Authorize');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  }

  private requestOrigin(req: any): string | undefined {
    if (typeof req.headers.origin === 'string') return req.headers.origin;
    if (typeof req.headers.referer !== 'string') return undefined;
    try {
      return new URL(req.headers.referer).origin;
    } catch {
      return undefined;
    }
  }

}
