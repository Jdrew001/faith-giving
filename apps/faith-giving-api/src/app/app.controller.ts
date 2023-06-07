import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData() {
    return 'confirmed';//
  }

  @Get("reference")
  getReferenceData() {
    return this.appService.getReferenceData();
  }

  @Get('environment')
  getEnv() {
    return process.env.NODE_ENV
  }
}
