import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { UserService } from '@faith-giving/faith-giving.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService) {}

  @Get()
  async getData() {
    return await this.userService.findAll();
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
