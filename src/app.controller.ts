import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('schedule')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('F')
  async getscheduleF(){
    return this.appService.getscheduleF();
  }
  @Get('G')
  getscheduleG() {
    return this.appService.getscheduleG();
  }

}
