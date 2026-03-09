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
    const scheduleF = await this.appService.getscheduleF() as ScheduleData;
    return{
      Bloque: "F",
      schedule: {
        identificacion: scheduleF.identificacion,
        docente: scheduleF.docente,
        seccion: scheduleF.seccion,
        materia: scheduleF.materia,
        aula: scheduleF.aula,
        turno: scheduleF.turno,
        estado: scheduleF.estado,
        horaEntrada: scheduleF.horaEntrada,
        horaSalida: scheduleF.horaSalida
      }
    } 
  }

  @Get('G')
  async getscheduleG() {
    const scheduleG = await this.appService.getscheduleG() as ScheduleData;
    return {
      Bloque: "G",
      schedule: {
        identificacion: scheduleG.identificacion,
        docente: scheduleG.docente,
        seccion: scheduleG.seccion,
        materia: scheduleG.materia,
        aula: scheduleG.aula,
        turno: scheduleG.turno,
        estado: scheduleG.estado,
        horaEntrada: scheduleG.horaEntrada,
        horaSalida: scheduleG.horaSalida
      }
    }
  }
}
