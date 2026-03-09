import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Define the interface for your schedule data
interface ScheduleData {
  identificacion: string;
  docente: string;
  seccion: string;
  materia: string;
  aula: string;
  turno: string;
  estado: string;
  horaEntrada: string;
  horaSalida: string;
}

@Controller('schedule')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('refresh')
  refresh(){
    return{
      status: 200
    }
  }

  @Get('F')
  async getscheduleF(){
    const scheduleF = await this.appService.getscheduleF();
    return{
      Bloque: "F",
      schedule: scheduleF
    } 
  }

  @Get('G')
  async getscheduleG() {
    const scheduleG = await this.appService.getscheduleG();
    return {
      Bloque: "G",
      schedule: scheduleG
    }
  }
}
