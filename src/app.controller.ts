import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('schedule')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('F')
  async getscheduleF(){
    return{
      Bloque: "F",
      schudule: await this.appService.getscheduleF()
    } 
  }
  @Get('G')
  async getscheduleG() {
    return {
      Bloque: "G",
      schudule: await this.appService.getscheduleG()
    }
  }

}
