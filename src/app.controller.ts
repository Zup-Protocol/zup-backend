import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getServiceStatus(): string {
    return 'Service is running...';
  }
}
