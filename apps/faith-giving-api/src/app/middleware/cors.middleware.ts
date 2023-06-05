import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private get isDevelopment() { return process.env.NODE_ENV == 'development' }
  private allowedOrigins: string[] | string = this.isDevelopment ? '*': ['https://discoverfaitharlington.org'];

  use(req: any, res: any, next: () => void) {
    const origin = req.headers.origin as string;
    if (this.isDevelopment) {
      next();
      return;
    } 
    if (this.allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
      throw new BadRequestException('Unable to Authorize');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  }
}
