import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { UserService, ReferenceService } from '@faith-giving/faith-giving.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
    private readonly refService: ReferenceService) {}

  @Get()
  async getData() {
    return await this.userService.findAdmins();
  }

  @Get("reference")
  async getReferenceData() {
    return await this.refService.findAll();
  }////

  @Get('environment')
  getEnv() {
    return process.env.NODE_ENV
  }
}
